<?php

/**
 * ownCloud - Gallery App
 *
 * @author Sebastian Doell
 * @copyright 2014 Sebastian Doell sebastian.doell@libasys.de
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 */



\OCP\JSON::callCheck();
\OCP\JSON::checkLoggedIn();

$l = \OC_L10N::get('gallery');

$startPath = isset($_POST['startPath']) ? $_POST['startPath'] : null;
if (!is_null($startPath)){
	if (\OC\Files\Filesystem::file_exists($startPath) ===false ){
		if(!\OC\Files\Filesystem::mkdir($startPath)){
			\OCP\JSON::error(
				array(
					'data' => array('message'=> $l->t('An error occurred while changing directory.'))
				)
			);
		}
	}
	\OCP\Config::setUserValue(\OCP\User::getUser(), 'gallery', 'start_path', $startPath);
	\OCP\JSON::success(
		array(
			'data' => array('message'=> $l->t('Directory saved successfully.'))
			)
	);
	exit();
}

exit();
