<?php
/**
 * ownCloud - Pinit
 *
 * @author Sebastian Doell
 * @copyright 2014 sebastian doell sebastian@libasys.de
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
 
namespace OCA\Pinit;


use \OCA\Pinit\AppInfo\Application;

$application = new Application();

$application->registerRoutes($this, array('routes' => array(
	array('name' => 'page#index', 'url' => '/', 'verb' => 'GET'),
	array('name' => 'public#index', 'url' => '/', 'verb' => 'GET'),
	array('name' => 'pin#getPins',	'url' => '/pins',	'verb' => 'GET'),
	array('name' => 'pin#getPin',	'url' => '/pin',	'verb' => 'GET'),
	array('name' => 'pin#getPinsPublic',	'url' => '/pinspublic',	'verb' => 'GET'),
	array('name' => 'pin#getAllPinsUser',	'url' => '/getallpinsuser',	'verb' => 'GET'),
	array('name' => 'pin#showPin',	'url' => '/showpin',	'verb' => 'POST'),
	array('name' => 'pin#showPinPublic',	'url' => '/showpinpublic',	'verb' => 'POST'),
	array('name' => 'pin#newPin',	'url' => '/newpin',	'verb' => 'POST'),
	array('name' => 'pin#newPinSave',	'url' => '/newpinsave',	'verb' => 'POST'),
	array('name' => 'pin#editPin',	'url' => '/editpin',	'verb' => 'POST'),
	array('name' => 'pin#editPinSave',	'url' => '/editpinsave',	'verb' => 'POST'),
	array('name' => 'pin#deletePin',	'url' => '/deletepin',	'verb' => 'POST'),
	array('name' => 'pin#deletePhotoPin',	'url' => '/deletephotopin',	'verb' => 'GET'),
	array('name' => 'pin#movePin',	'url' => '/movepin',	'verb' => 'GET'),
	array('name' => 'pin#getLonLatFromAddress',	'url' => '/lonlataddresspin',	'verb' => 'GET'),
	array('name' => 'pin#getWebsiteInfo',	'url' => '/getwebsiteinfopin',	'verb' => 'GET'),
	array('name' => 'pin#changePinStatus',	'url' => '/changepinstatus',	'verb' => 'GET'),
	array('name' => 'pinWall#getPinWalls',	'url' => '/pinwalls',	'verb' => 'GET'),
	array('name' => 'pinWall#newPinWall',	'url' => '/newpinwall',	'verb' => 'GET'),
	array('name' => 'pinWall#editPinWall',	'url' => '/editpinwall',	'verb' => 'GET'),
	array('name' => 'pinWall#deletePinWall',	'url' => '/deletepinwall',	'verb' => 'GET'),
	array('name' => 'pinWall#getPinWallBackground',	'url' => '/getpinwallbg',	'verb' => 'GET'),
	array('name' => 'pinWall#saveSortOrderPinwall',	'url' => '/savesortorderpinwall',	'verb' => 'GET'),
	array('name' => 'photo#getImageFromCloud',	'url' => '/getimagefromcloud',	'verb' => 'GET'),
	array('name' => 'photo#cropPhoto',	'url' => '/cropphoto',	'verb' => 'POST'),
	array('name' => 'photo#saveCropPhoto',	'url' => '/savecropphoto',	'verb' => 'POST'),
	array('name' => 'photo#uploadPhoto',	'url' => '/uploadphoto',	'verb' => 'POST'),
	array('name' => 'tags#addTag',	'url' => '/addtag',	'verb' => 'GET'),
	array('name' => 'tags#deleteTag',	'url' => '/deletetag',	'verb' => 'GET'),
	array('name' => 'tags#loadTags',	'url' => '/loadtags',	'verb' => 'GET'),
)));

