<?php
/**
 * Copyright (c) 2014 Robin Appelman <icewind@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OCA\Gallery;


use \OCA\Gallery\AppInfo\Application;

$application = new Application();

$application->registerRoutes($this, array('routes' => array(
	array('name' => 'page#index', 'url' => '/', 'verb' => 'GET'),
	array('name' => 'public#index', 'url' => '/', 'verb' => 'GET'),
	array('name' => 'page#loadGallery', 'url' => '/loadgallery', 'verb' => 'GET'),
	array('name' => 'image#getMetadataImage', 'url' => '/getmetadataimage', 'verb' => 'GET'),
	array('name' => 'image#saveMetadataImage', 'url' => '/savemetadataimage', 'verb' => 'GET'),
	array('name' => 'page#getImageData', 'url' => '/getimages', 'verb' => 'GET'),
	array('name' => 'page#getImagesCaching', 'url' => '/getimagescaching', 'verb' => 'GET'),
	)));
	$this->create('gallery_ajax_image', 'ajax/image')->actionInclude('gallery/ajax/image.php');
	$this->create('gallery_ajax_thumbnail', 'ajax/thumbnail')->actionInclude('gallery/ajax/thumbnail.php');
	$this->create('gallery_ajax_batch', 'ajax/thumbnail/batch')	->actionInclude('gallery/ajax/batch.php');
	$this->create('gallery_ajax_thumbnail_preview', 'ajax/thumbnailpreview')
	->actionInclude('gallery/ajax/thumbpreview.php');	
	//$this->create('gallery_public', '/public/{token}')->actionInclude('gallery/public.php');
/*
$this->create('gallery_index', '/')
	->actionInclude('gallery/index.php');
$this->create('gallery_ajax_gallery', 'ajax/gallery')
	->actionInclude('gallery/ajax/gallery.php');
$this->create('gallery_ajax_images', 'ajax/images')
	->actionInclude('gallery/ajax/getimages.php');
$this->create('gallery_ajax_images_cache', 'ajax/imagesCache')
	->actionInclude('gallery/ajax/getimagescached.php');	
$this->create('gallery_ajax_image', 'ajax/image')
	->actionInclude('gallery/ajax/image.php');
	$this->create('gallery_ajax_metadata', 'ajax/metadata')
	->actionInclude('gallery/ajax/metadata.php');
	$this->create('gallery_ajax_savemetadata', 'ajax/savemetadata')
	->actionInclude('gallery/ajax/savemetadata.php');
$this->create('gallery_ajax_thumbnail', 'ajax/thumbnail')
	->actionInclude('gallery/ajax/thumbnail.php');
$this->create('gallery_ajax_thumbnail_preview', 'ajax/thumbnailpreview')
	->actionInclude('gallery/ajax/thumbpreview.php');	
$this->create('gallery_ajax_batch', 'ajax/thumbnail/batch')
	->actionInclude('gallery/ajax/batch.php');

$this->create('gallery_public', '/public/{token}')
	->actionInclude('gallery/public.php');
*/