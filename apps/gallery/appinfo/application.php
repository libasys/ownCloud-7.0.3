<?php
namespace OCA\Gallery\AppInfo;

use \OCP\AppFramework\App;

use \OCA\Gallery\Controller\PageController;
use \OCA\Gallery\Controller\PublicController;
use \OCA\Gallery\Controller\ImageController;

class Application extends App {
	
	public function __construct (array $urlParams=array()) {
		
		parent::__construct('gallery', $urlParams);
        $container = $this->getContainer();
	
	
		$container->registerService('PageController', function($c) {
			return new PageController(
			$c->query('AppName'),
			$c->query('Request'),
			$c->query('UserId'),
			$c->query('L10N')
			);
		});
		$container->registerService('PublicController', function($c) {
			return new PublicController(
			$c->query('AppName'),
			$c->query('Request'),
			$c->query('L10N')
			);
		});
		
		$container->registerService('ImageController', function($c) {
			return new ImageController(
			$c->query('AppName'),
			$c->query('Request'),
			$c->query('UserId'),
			$c->query('L10N')
			);
		});
		
		
		   /**
		 * Core
		 */
		$container -> registerService('UserId', function($c) {
			return \OCP\User::getUser();
		});
		
		$container -> registerService('L10N', function($c) {
			return $c -> query('ServerContainer') -> getL10N($c -> query('AppName'));
		});
		
		
	}
	
	
}