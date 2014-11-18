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
 
namespace OCA\Pinit\Controller;

use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\IRequest;

/**
 * Controller class for main page.
 */
class PageController extends Controller {
	
	private $userId;
	private $pinDAO;
	private $l10n;
	private $helperController;
	

	public function __construct($appName, IRequest $request,  $helperController, $userId, $l10n) {
		parent::__construct($appName, $request);
		$this -> userId = $userId;
		$this->l10n = $l10n;
		$this->helperController = $helperController;
		
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		
		\OCP\Util::addStyle('pinit','style');
		\OCP\Util::addStyle('pinit', 'jquery.Jcrop');
		
		\OCP\Util::addscript('files', 'jquery.fileupload');
		\OCP\Util::addscript('pinit', 'jquery.Jcrop');
		\OCP\Util::addscript('pinit/3rdparty', 'gridify');
		\OCP\Util::addscript('pinit/3rdparty', 'tag-it');
		\OCP\Util::addscript('pinit/3rdparty', 'leaflet');
		\OCP\Util::addscript('pinit/3rdparty', 'Leaflet.EdgeMarker');
		\OCP\Util::addscript('pinit/3rdparty', 'leaflet.markercluster-src');
		\OCP\Util::addscript('pinit/3rdparty', 'leaflet.awesome-markers');
		\OCP\Util::addscript('pinit', 'jquery.scrollTo');
		\OCP\Util::addStyle('pinit/3rdparty', 'jquery.tagit');
		
		\OCP\Util::addStyle('pinit/3rdparty', 'leaflet');
		\OCP\Util::addStyle('pinit/3rdparty', 'MarkerCluster');
		\OCP\Util::addStyle('pinit/3rdparty', 'MarkerCluster.Default');
		\OCP\Util::addStyle('pinit/3rdparty', 'leaflet.awesome-markers');
		\OCP\Util::addStyle('pinit/3rdparty', 'bootstrap');
		\OCP\Util::addStyle('pinit', 'mobile');
		\OCP\Util::addscript('pinit','pinit');
        $maxUploadFilesize = \OCP\Util::maxUploadFilesize('/');
        
        $aPinColors=$this->helperController->getPinColorOptions();
		$config = \OC::$server->getConfig();
		$response = new TemplateResponse('pinit', 'index');
		$response->setParams(array(
			'uploadMaxFilesize' => $maxUploadFilesize,
			'uploadMaxHumanFilesize' => \OCP\Util::humanFileSize($maxUploadFilesize),
			'aPinColors' => $aPinColors,
			'allowShareWithLink' => $config->getAppValue('core', 'shareapi_allow_links', 'yes'),
			'mailNotificationEnabled' => $config->getAppValue('core', 'shareapi_allow_mail_notification', 'no'),
		));

		return $response;
	}
}