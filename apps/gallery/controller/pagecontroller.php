<?php

namespace OCA\Gallery\Controller;

use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\IRequest;
use \OCP\AppFramework\Http\JSONResponse;
use \OCA\Gallery\Http\ImageResponse;

/**
 * Controller class for main page.
 */
class PageController extends Controller {
	
	private $userId;
	private $l10n;
	
	

	public function __construct($appName, IRequest $request, $userId, $l10n) {
		parent::__construct($appName, $request);
		$this -> userId = $userId;
		$this->l10n = $l10n;
		
		
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		\OCP\Util::addStyle('gallery', 'styles');
		\OCP\Util::addStyle('gallery', 'mobile');
		
		\OCP\Util::addScript('gallery', 'album');
		\OCP\Util::addScript('gallery', 'gallery');
		\OCP\Util::addScript('gallery', 'thumbnail');
		
		$config = \OC::$server->getConfig();
		
		$response = new TemplateResponse('gallery', 'index');
		$response->setParams(array(
			'allowShareWithLink' => $config->getAppValue('core', 'shareapi_allow_links', 'yes'),
			'mailNotificationEnabled' => $config->getAppValue('core', 'shareapi_allow_mail_notification', 'no'),
		));

		return $response;
		
	}
	
	/**
	 * @NoAdminRequired
	 */
	public function loadGallery(){
		$gallery=$this->params('gallery');
		$path='';
		if(\OCP\Config::getUserValue($this->userId, "gallery", "start_path")){
			$path=\OCP\Config::getUserValue($this->userId, "gallery", "start_path");
		}
		
		$view = new \OC\Files\View('/' . $this->userId . '/files/');
		if (!$view->is_dir($path)){
					$path = '';
		}else {
			$path=$path;   
		}
		$bShared=false;
		$meta =$view->getFileInfo($path.'/'.$gallery);
		$owner=$view->getOwner($path.'/'.$gallery);
		
		if($owner != $this->userId){
			$bShared=true;
			//\OC_Log::write('gallery', 'Shared by ' .$owner, \OC_Log::DEBUG);
		}
		
		$data = array();
		$data['fileid'] = $meta['fileid'];
		$data['permissions'] = $meta['permissions'];
		$data['owner'] = $owner;
		$data['isshared'] = $bShared;
		$response = new JSONResponse();
		$response -> setData($data);
		return $response;
	}
	
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function publicTpl() {
			
		\OCP\Util::addStyle('gallery', 'styles');
		\OCP\Util::addStyle('gallery', 'mobile');
		
		
		$token = \OC::$server->getRequest()->getParam('token');
		if ($token == ''){
			$token = $this->params('t');
		}
		
		if ($token) {
			$file=$this->params('file');
			$dir=$this->params('dir');
			
				$linkItem = \OCP\Share::getShareByToken($token, false);
				if (is_array($linkItem) && isset($linkItem['uid_owner'])) {
					// seems to be a valid share
					$type = $linkItem['item_type'];
					$fileSource = $linkItem['file_source'];
					$shareOwner = $linkItem['uid_owner'];
					$path = null;
					$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
					$fileOwner = $rootLinkItem['uid_owner'];
					$albumName = trim($linkItem['file_target'], '//');
					$ownerDisplayName = \OC_User::getDisplayName($fileOwner);
			
					// stupid copy and paste job
					if (isset($linkItem['share_with'])) {
						// Authenticate share_with
						$url = \OCP\Util::linkToPublic('gallery') . '&t=' . $token;
						if ($file!='') {
							$url .= '&file=' . urlencode($file);
						} else {
							if (isset($dir)) {
								$url .= '&dir=' . urlencode($dir);
							}
						}
						$password=$this->params('password');
						if ($password!='') {
							
							if ($linkItem['share_type'] == \OCP\Share::SHARE_TYPE_LINK) {
								// Check Password
								$forcePortable = (CRYPT_BLOWFISH != 1);
								$hasher = new \PasswordHash(8, $forcePortable);
								if (!($hasher->CheckPassword($password.OC_Config::getValue('passwordsalt', ''),
									$linkItem['share_with']))) {
									\OCP\Util::addStyle('files_sharing', 'authenticate');
									$tmpl = new \OCP\Template('files_sharing', 'authenticate', 'guest');
									$tmpl->assign('URL', $url);
									$tmpl->assign('wrongpw', true);
									$tmpl->printPage();
									exit();
								} else {
									// Save item id in session for future requests
									\OC::$server->getSession()->set('public_link_authenticated', $linkItem['id']);
								}
							} else {
								\OCP\Util::writeLog('share', 'Unknown share type '.$linkItem['share_type']
									.' for share id '.$linkItem['id'], \OCP\Util::ERROR);
								header('HTTP/1.0 404 Not Found');
								$tmpl = new \OCP\Template('', '404', 'guest');
								$tmpl->printPage();
								exit();
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
								exit();
							}
						}
					}
			
					// render template
					$tmpl = new \OCP\Template('gallery', 'public', 'base');
					\OCP\Util::addScript('gallery', 'album');
					\OCP\Util::addScript('gallery', 'gallery');
					\OCP\Util::addScript('gallery', 'thumbnail');
					\OCP\Util::addStyle('gallery', 'public');
					$tmpl->assign('token', $token);
					$tmpl->assign('requesttoken', \OCP\Util::callRegister());
					$tmpl->assign('displayName', $ownerDisplayName);
					$tmpl->assign('albumName', $albumName);
			
					$tmpl->printPage();
					exit;
				}
			}
			
			$tmpl = new OCP\Template('', '404', 'guest');
			$tmpl->printPage();
		
	}
	
	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */

	public function getImagesPublic($token) {

		$path = null;
		if ($token!='') {
			
			$linkItem = \OCP\Share::getShareByToken($token);
			if (is_array($linkItem) && isset($linkItem['uid_owner'])) {
				// seems to be a valid share
				$type = $linkItem['item_type'];
				$fileSource = $linkItem['file_source'];
				$shareOwner = $linkItem['uid_owner'];
		
				$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
				$fileOwner = $rootLinkItem['uid_owner'];
		
				// Setup FS with owner
				\OCP\JSON::checkUserExists($fileOwner);
				\OC_Util::tearDownFS();
				\OC_Util::setupFS($fileOwner);
		
				// The token defines the target directory (security reasons)
				$path = \OC\Files\Filesystem::getPath($linkItem['file_source']);
				$view = new \OC\Files\View(\OC\Files\Filesystem::getView() -> getAbsolutePath($path));
				$images = $view -> searchByMime('image');
		    
				$result = array();
				foreach ($images as $image) {
					$title = $image['name'];
					$mtime = $image['mtime'];
					$id=$image['fileid'];
					$local = $view -> getLocalFile($image['path']);
					$size = getimagesize($local, $info);
					if (array_key_exists('APP13', $info)) {
						$iptc = iptcparse($info["APP13"]);
						if (array_key_exists('2#105', $iptc)) {
							$title = $iptc['2#105'][0];
		
						}
					}
		
					$imagePath = trim($image['path'], '/');
		
					$result[] = array('path' => $imagePath, 'title' => $title, 'mtime' => $mtime, 'fileid' => $id);
					
				}
				$response = new JSONResponse();
				$response -> setData($result);
				return $response;
			}
		}
	}

	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	 
	public function getImageData(){
		$token=$this->params('token');
		if($token!=''){
			return $this->getImagesPublic($token);
		}else{
			return $this->getImages();
		}
		
	}
	
	/**
	 * @NoAdminRequired
	 */
	public function getImages(){
		
		$result = array();
		$path='';
		if (\OCP\Config::getUserValue($this->userId, "gallery", "start_path")) {
			$path = \OCP\Config::getUserValue($this->userId, "gallery", "start_path");
		}
		
		$view = new \OC\Files\View('/' . $this->userId . '/files/');
		if (!$view -> is_dir($path)) {
			$path = '';
		}
		
		if ($path == '') {
			$images = \OCP\Files::searchByMime('image/jpeg');
			$path = '/';
		} else {
			if (\OC\Files\Filesystem::file_exists($path)) {
				$path = '/' . $path;
			} else {
				\OC\Files\Filesystem::mkdir($path);
				$path = '/' . $path;
			}
			$view = new \OC\Files\View(\OC\Files\Filesystem::getView() -> getAbsolutePath($path));
			$images = $view -> searchByMime('image/jpeg');
		
		}
		\OC::$session->close();
		
		$userView = new \OC\Files\View('/' . $this->userId);
		$sizeMax = 1024;
			foreach ($images as $image) {
				if (strpos($path, DIRECTORY_SEPARATOR . ".")) {
					continue;
				}
				$title = $image['name'];
				$mtime = $image['mtime'];
				$id=$image['fileid'];
				//$image['permissions']
			  // \OC_Log::write('gallery', 'ID' .$id, \OC_Log::DEBUG);
				$local = $userView -> getLocalFile('/files' . $path . $image['path']);
				$size = getimagesize($local, $info);
				if (array_key_exists('APP13', $info)) {
					$iptc = iptcparse($info["APP13"]);
					if (array_key_exists('2#105', $iptc)) {
						$title = $iptc['2#105'][0];
			
					}
				}
			
				$imagePath = trim($image['path'], '/');
			
				$result[] = array('path' => $imagePath, 'title' => $title, 'mtime' => $mtime , 'fileid' => $id);
			}
			$response = new JSONResponse();
			$response -> setData($result);
			return $response;
	}
		
	/**
	 * @NoAdminRequired
	 */	
	public function getImagesCaching(){
		
		$toCacheImage=$this->params('imagePath');
		$path='';
		if(\OCP\Config::getUserValue($this->userId, "gallery", "start_path")){
			$path=\OCP\Config::getUserValue($this->userId, "gallery", "start_path");
		}
	    if($path==''){
	    	$path='/';
	    }else{
	    	$path=$path.'/';
	    }
		\OC::$session->close();
		
	    $userView = new \OC\Files\View('/' . $this->userId);
		$fileInfo = $userView->getFileInfo('files/'.$path.$toCacheImage);
			
		$sizeMax=1024;
		$sizeMaxSmall=400;
		$message='';
		//	\OC_Log::write('gallery', 'GENE Cached AFTER preview for "' .$path.$image, \OC_Log::DEBUG);
			$previewBigImage = new \OC\Preview($this->userId, 'files', $path.$toCacheImage, $sizeMax, $sizeMax);
			$previewBigImage->setKeepAspect(true);
			$preview = new \OC\Preview($this->userId, 'files', $path.$toCacheImage, $sizeMaxSmall, 200);
			$preview->setKeepAspect(true);
			
			
			
			if ($previewBigImage->isCached($fileInfo->getId())) {
				$message.='Preview 1024 exist for '.$toCacheImage.'<br />';
			   
			}else{
				$previewBigImage->getPreview();
				$message.='Indexing 1024 ... '.$toCacheImage.'<br />';
			}
			
			if ($preview->isCached($fileInfo->getId())) {
				$message.='Preview 400 exist for '.$toCacheImage.'<br />';
			}else{
				$preview->getPreview();
				$message.='Indexing 400 ... '.$toCacheImage;
			}
			
			return $message;
	}	
	
	
   
	
	
	
}