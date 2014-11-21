<?php
/**
 * Copyright (c) 2012 Robin Appelman <icewind@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

OCP\JSON::checkAppEnabled('gallery');

$square = isset($_GET['square']) ? (bool)$_GET['square'] : false;
$scale = isset($_GET['scale']) ? $_GET['scale'] : 1;
$imageIds = explode(';', $_GET['image']);




if (!empty($_GET['token'])) {
	$linkItem = \OCP\Share::getShareByToken($_GET['token']);
	if (!(is_array($linkItem) && isset($linkItem['uid_owner']))) {
		exit;
	}
	// seems to be a valid share
	$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
	$user = $rootLinkItem['uid_owner'];
   
	// Setup filesystem
	OCP\JSON::checkUserExists($user);
	OC_Util::tearDownFS();
	OC_Util::setupFS($user);
  
	$startPath = \OC\Files\Filesystem::getPath($linkItem['file_source']) . '/';
	
} else {
	
	$startPath='';
	OCP\JSON::checkLoggedIn();
	$user = OCP\User::getUser();
	
	if(OCP\Config::getUserValue($user, "gallery", "start_path")){
		$startPath=OCP\Config::getUserValue($user, "gallery", "start_path");
	}
	if($startPath=='') {
		$startPath='/';
	}else{
		 $startPath='/'.$startPath.'/';
	}
	
}

\OC::$session->close();
$EventSource = new OC_EventSource();

foreach ($imageIds as $imageId) {
	$height = 200 * $scale;
	if ($square) {
		$width = 200 * $scale;
	} else {
		$width = 400 * $scale;
	}

	$userView = new \OC\Files\View('/' . $user);
	$path= $userView->getPath($imageId);
	$relPath= substr($path,6);
	
	$preview = new \OC\Preview($user, 'files',$relPath, $width, $height);
	$preview->setKeepAspect(!$square);

	// if the thumbnails is already cached, get it directly from the filesystem to avoid decoding and re-encoding the image
	$imageName = substr($relPath, strlen($startPath));
	
	if ($path = $preview->isCached($imageId)) {
		
		$EventSource->send('preview', array(
			'image' => $imageName,
			'preview' => base64_encode($userView->file_get_contents('/' . $path))
		));
	} else {
		$EventSource->send('preview', array(
			'image' => $imageName,
			'preview' => (string)$preview->getPreview()
		));
	}
}
$EventSource->send('done', array('msg' => 'allLoaded'));
$EventSource->close();
