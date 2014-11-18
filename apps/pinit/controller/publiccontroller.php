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
use \OCP\AppFramework\Http;
use \OCP\AppFramework\Http\JSONResponse;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\IRequest;
use \OCP\Share;

class PublicController extends Controller {
		
	private $pinwallController;
	private $l10n;
	
	public function __construct($appName, IRequest $request,  $pinwallController, $l10n) {
		parent::__construct($appName, $request);
		$this->l10n = $l10n;
		$this->pinwallController = $pinwallController;
		
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function index() {
			
		\OCP\Util::addStyle('pinit', 'style');
		\OCP\Util::addStyle('pinit', 'public');
		\OCP\Util::addStyle('pinit/3rdparty', 'leaflet');
		\OCP\Util::addStyle('pinit/3rdparty', 'MarkerCluster');
		\OCP\Util::addStyle('pinit/3rdparty', 'MarkerCluster.Default');
		\OCP\Util::addStyle('pinit/3rdparty', 'leaflet.awesome-markers');
		\OCP\Util::addStyle('pinit/3rdparty', 'bootstrap');
		\OCP\Util::addStyle('pinit/3rdparty', 'jquery.tagit');	
		\OCP\Util::addStyle('pinit', 'mobile');
			
		$token = \OC::$server->getRequest()->getParam('token');
		//\OCP\Util::writeLog('share', 'Token  Controller '.$token, \OCP\Util::DEBUG);
		if ($token == ''){
			$token = $this -> params('t');
		}
		
		
		if ($token) {
			$linkItem = Share::getShareByToken($token, false);
			
			if (is_array($linkItem) && isset($linkItem['uid_owner'])) {
				$type = $linkItem['item_type'];
				$pinWallId= $linkItem['item_source'];
				$shareOwner = $linkItem['uid_owner'];
				$path = null;
				$rootLinkItem = Share::resolveReShare($linkItem);
				$pinWallOwner = $rootLinkItem['uid_owner'];
				$PinwallName = $linkItem['item_target'];
				$ownerDisplayName = \OC_User::getDisplayName($pinWallOwner);
				
				// stupid copy and paste job
					if (isset($linkItem['share_with'])) {
						// Authenticate share_with
						$url = \OCP\Util::linkToPublic('pinwall') . '&t=' . $token;
						
						$password = $this -> params('password');
						
						if (isset($password)) {
							
							if ($linkItem['share_type'] == Share::SHARE_TYPE_LINK) {
								// Check Password
								$forcePortable = (CRYPT_BLOWFISH != 1);
								$hasher = new \PasswordHash(8, $forcePortable);
								if (!($hasher->CheckPassword($password.\OC_Config::getValue('passwordsalt', ''),	$linkItem['share_with']))) {
										
									$tmpl = new \OCP\Template('files_sharing', 'authenticate', 'guest');
									$tmpl->assign('URL', $url);
									$tmpl->assign('wrongpw', true);
									$tmpl->printPage();
									exit;
								} else {
									// Save item id in session for future requests
									\OC::$server->getSession()->set('public_link_authenticated', $linkItem['id']);
								}
							} else {
								\OCP\Util::writeLog('share', 'Unknown share type '.$linkItem['share_type'].' for share id '.$linkItem['id'], \OCP\Util::ERROR);
								
								header('HTTP/1.0 404 Not Found');
								$tmpl = new \OCP\Template('', '404', 'guest');
								$tmpl->printPage();
								exit;
							}
			
						} else {
							// Check if item id is set in session
							if ( ! \OC::$server->getSession()->exists('public_link_authenticated')
								|| \OC::$server->getSession()->get('public_link_authenticated') !== $linkItem['id']
							) {
								// Prompt for password
								\OCP\Util::addStyle('files_sharing', 'authenticate');
								$tmpl = new \OCP\Template('files_sharing', 'authenticate', 'guest');
								$tmpl->assign('URL', $url);
								$tmpl->printPage();
								exit;
							}
						}
					}
				
				\OCP\Util::addscript('pinit/3rdparty', 'tag-it');
				\OCP\Util::addscript('pinit/3rdparty', 'leaflet');
				\OCP\Util::addscript('pinit/3rdparty', 'Leaflet.EdgeMarker');
				\OCP\Util::addscript('pinit/3rdparty', 'leaflet.markercluster-src');
				\OCP\Util::addscript('pinit/3rdparty', 'leaflet.awesome-markers');
				\OCP\Util::addscript('pinit/3rdparty', 'gridify');
				\OCP\Util::addscript('pinit', 'jquery.scrollTo');
				\OCP\Util::addScript('pinit', 'public');
			    $PinWallData=$this->pinwallController->getPinWall($pinWallId,true,true,$pinWallOwner);
				
				$tmpl = new \OCP\Template('pinit', 'public', 'base');
				$tmpl->assign('token', $token);
				$tmpl->assign('requesttoken', \OCP\Util::callRegister());
				$tmpl->assign('displayName', $ownerDisplayName);
				$tmpl->assign('PinwallName', $PinwallName);
				$tmpl->assign('PinwallBg', $PinWallData['wallbg']);
				
				 $tmpl->printPage();
				 exit;
			}
			
		}

		$tmpl = new \OCP\Template('', '404', 'guest');
		$tmpl->printPage();
		
		//return new JSONResponse()->setStatus(Http::STATUS_NOT_FOUND);
	}
		
		
	
}