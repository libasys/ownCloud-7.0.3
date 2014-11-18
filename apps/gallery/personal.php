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




\OCP\Util::addScript('gallery', 'personal');

$tmpl = new \OCP\Template('gallery', 'personal');
$startPath = \OCP\Config::getUserValue(\OCP\User::getUser(), 'gallery', 'start_path');
$tmpl->assign('startPath', $startPath);

return $tmpl->fetchPage();
