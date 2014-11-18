<?php
/**
 * Copyright (c) 2012 Robin Appelman <icewind@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

OCP\JSON::checkAppEnabled('gallery');

$scale = isset($_GET['scale']) ? $_GET['scale'] : 1;
$img = $_GET['file'];
//$linkItem = \OCP\Share::getShareByToken($owner);
$path='';
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
    OC_User::setIncognitoMode(true);
   
	$fullPath = \OC\Files\Filesystem::getPath($linkItem['file_source']);
	$img = trim($fullPath . '/' . $img);
} else {
	OCP\JSON::checkLoggedIn();
	$user = OCP\User::getUser();
	if(OCP\Config::getUserValue($user, "gallery", "start_path")){
		$path=OCP\Config::getUserValue($user, "gallery", "start_path");
    }

	if($path=='') $path='/';
	else $path='/'.$path.'/';
}

\OC::$session->close();

$square = isset($_GET['square']) ? (bool)$_GET['square'] : false;

if ($square) {
	$preview = new \OC\Preview($user, 'files',$path . $img, 200 * $scale, 200 * $scale);
} else {
	$preview = new \OC\Preview($user, 'files',$path . $img, 400 * $scale, 200 * $scale);
	$preview->setKeepAspect(true);
	
}
$preview->showPreview();


