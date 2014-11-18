<?php
namespace OCA\Gallery\Controller;
use \OCP\AppFramework\Controller;
use \OCP\IRequest;
use \OCP\AppFramework\Http\JSONResponse;

class ImageController extends Controller {
	
	private $userId;
	private $l10n;
	

	public function __construct($appName, IRequest $request, $userId, $l10n) {
		parent::__construct($appName, $request);
		$this -> userId = $userId;
		$this->l10n = $l10n;
		
	}
	
	
	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function getMetadataImage(){
		
		$img=$this->params('file');
		$token=$this->params('token');	
		
		$startPath = '';
		
		if (!empty($token)) {
			$linkItem = \OCP\Share::getShareByToken($token);
			if (!(is_array($linkItem) && isset($linkItem['uid_owner']))) {
				exit ;
			}
			// seems to be a valid share
			$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
			$user = $rootLinkItem['uid_owner'];
		
			// Setup filesystem
			\OCP\JSON::checkUserExists($user);
			\OC_Util::tearDownFS();
			\OC_Util::setupFS($user);
			\OC_User::setIncognitoMode(true);
		
			$fullPath = \OC\Files\Filesystem::getPath($linkItem['file_source']);
			$img = trim($fullPath . '/' . $img);
			
		} else {
		
			if (\OCP\Config::getUserValue($this->userId, "gallery", "start_path")) {
				$startPath = \OCP\Config::getUserValue($this->userId, "gallery", "start_path");
			}
			if ($startPath == ''){
				$startPath = '';
			}else{
				$startPath = '/' . $startPath;
			}
			$user=$this->userId;
		}
		
		\OC::$session->close();
		
		$ownerView = new \OC\Files\View('/' . $user . '/files' . $startPath);
		
		$mime = $ownerView -> getMimeType($img);
	
		list($mimePart, ) = explode('/', $mime);
		if ($mimePart === 'image') {
			$fileInfo = $ownerView -> getFileInfo($img);
			if ($fileInfo['encrypted'] === true) {
				$local = $ownerView -> toTmpFile($img);
			} else {
				$local = $ownerView -> getLocalFile($img);
			}
		
			$rotate = false;
			if (is_callable('exif_read_data')) {//don't use OCP\Image here, using OCP\Image will always cause parsing the image file
				$exif = @exif_read_data($local);
				$size = getimagesize($local, $info);
				$result=array('description' => '', 'title' => '', 'creation_date' => '', 'country' => '', 'size' => '', 'fSize' => '', 'latitude' => '', 'longitude' => '', 'city' => '', 'location' => '', 'filename' => '');
				
				$result['size'] = $size[0] . ' x ' . $size[1] . ' px';
				
				if (array_key_exists('APP13',$info)) {
					$iptc = iptcparse($info["APP13"]);
					
					if(array_key_exists('2#120', $iptc)){
						$result['description'] = $iptc['2#120'][0];
					}
					if(array_key_exists('2#105', $iptc)){
						$result['title'] = $iptc['2#105'][0];
					}
					if(array_key_exists('2#055', $iptc)){
						$dateTime=new \DateTime($iptc['2#055'][0]);
						$result['creation_date']=$dateTime->format('d-m-Y');
					}
					if(array_key_exists('2#101', $iptc)){
						$result['country'] = $iptc['2#101'][0];
					}
					if(array_key_exists('2#090', $iptc)){
						$result['city'] = $iptc['2#090'][0];
					}
					if(array_key_exists('2#092', $iptc)){
						$result['location'] = $iptc['2#092'][0];
					}
					/*
					foreach($iptc as $key => $val){
						\OC_Log::write('gallery', 'IPTC' .$key.':'.$val[0], \OC_Log::DEBUG);
					}*/
		
				}
				
				
				
				if (!array_key_exists('APP13',$info)) {
					//$maxHumanFileSize = \OCP\Util::humanFileSize($maxUploadFileSize);
				    if(isset($exif['FileDateTime'])){
			        	//$edate = $exif['FileDateTime']; 
						$dateTime=date("d-m-Y",$exif['FileDateTime']);
						$result['creation_date']=$dateTime;
			        }
					 if(isset($exif['FileName'])){
			        	
						$result['title']=$exif['FileName'];
						
			        }
				}
				
				 $result['filename']=$exif['FileName'];
				 
				if(isset($exif['DateTimeDigitized']) && strlen($exif['DateTimeDigitized']) >= 8){
					$dateTime=new \DateTime($exif["DateTimeDigitized"]);
					$result['creation_date']=$dateTime->format('d.m.Y H:i');
				}
				
				if(isset($exif['GPSLatitude'])){
						$latitude = $this->gps($exif["GPSLatitude"], $exif['GPSLatitudeRef']);
					    $result['latitude']=$latitude;
						$longitude = $this->gps($exif["GPSLongitude"], $exif['GPSLongitudeRef']);
						$result['longitude']=$longitude;
						
						
				}
			
				if(isset($exif['FileSize'])){
						$result['fSize']=\OCP\Util::humanFileSize($exif['FileSize']);
			        }
				
			}
		
		$response = new JSONResponse();
		$response -> setData($result);
		return $response;
		
		}
		
		
	}
	
	/**
	 * @NoAdminRequired
	 *
	 */
	public function saveMetadataImage(){
			
		$title=$this->params('title');
		$descr=$this->params('descr');	
		$location=$this->params('location');	
		$city=$this->params('city');	
		$country=$this->params('country');	
		$img=$this->params('file');	
		$startPath = '';
		
		$title = filter_var($title,FILTER_SANITIZE_STRING,FILTER_FLAG_NO_ENCODE_QUOTES);
		$descr = filter_var($descr,FILTER_SANITIZE_STRING,FILTER_FLAG_NO_ENCODE_QUOTES);
		$location = filter_var($location,FILTER_SANITIZE_STRING,FILTER_FLAG_NO_ENCODE_QUOTES);
		$city = filter_var($city,FILTER_SANITIZE_STRING,FILTER_FLAG_NO_ENCODE_QUOTES);
		$country = filter_var($country,FILTER_SANITIZE_STRING,FILTER_FLAG_NO_ENCODE_QUOTES);
			
			if (\OCP\Config::getUserValue($this->userId, "gallery", "start_path")) {
				$startPath = \OCP\Config::getUserValue($this->userId, "gallery", "start_path");
			}
			
			$startPath=($startPath == '') ? '' : '/'.$startPath;
			
			 $path=$startPath.'/'.$img;
			 $meta = \OC\Files\Filesystem::getFileInfo($path);
			 //\OC_Log::write('gallery', 'PER' .$meta['permissions'], \OC_Log::DEBUG);
			if(\OC\Files\Filesystem::isUpdatable($path) && ($meta['permissions'] & \OCP\PERMISSION_UPDATE)) {
				 	
					
				 $ownerView = new \OC\Files\View('/' . $this->userId . '/files' . $startPath);
			     $local = $ownerView -> getLocalFile($img);
			 	
				$metaData='';
				
				 if($descr != '' ) {
				 	$metaData.=$this->iptc_make_tag(2, '120', $descr);
				 }
				 if($title != '' ){
				 	$metaData.=$this->iptc_make_tag(2, '105', $title);
				 } 
				 if($country != '' ){
				 	$metaData.=$this->iptc_make_tag(2, '101', $country);
				 } 
				 if($city != '' ){
				 	$metaData.=$this->iptc_make_tag(2, '090', $city);
				 } 
				 if($location != '' ){
				 	$metaData.=$this->iptc_make_tag(2, '092', $location);
				 } 
				 
				 $content = iptcembed($metaData, $local);
				// $filecontents = iconv(mb_detect_encoding($content), "UTF-8", $content);
				\OC\Files\Filesystem::file_put_contents($path, $content);
				// Clear statcache
				clearstatcache();
				// Get new mtime
				$newmtime = \OC\Files\Filesystem::filemtime($path);
				$newsize = \OC\Files\Filesystem::filesize($path);
				$result='Success editing Metadata!';
			}else{
				$result='Error no Write Access';
			}
				
		   	$response = new JSONResponse();
			$response -> setData($result);
			return $response;
		
	}
	
   private function gps($coordinate, $hemisphere) {
	  for ($i = 0; $i < 3; $i++) {
	    $part = explode('/', $coordinate[$i]);
	    if (count($part) == 1) {
	      $coordinate[$i] = $part[0];
	    } else if (count($part) == 2) {
	      $coordinate[$i] = floatval($part[0])/floatval($part[1]);
	    } else {
	      $coordinate[$i] = 0;
	    }
	  }
	  list($degrees, $minutes, $seconds) = $coordinate;
	  $sign = ($hemisphere == 'W' || $hemisphere == 'S') ? -1 : 1;
	  return $sign * ($degrees + $minutes/60 + $seconds/3600);
	}
	
	
	private function iptc_make_tag($rec, $data, $value){
    	
	    $length = strlen($value);
	    $retval = chr(0x1C) . chr($rec) . chr($data);
	
	    if($length < 0x8000)
	    {
	        $retval .= chr($length >> 8) .  chr($length & 0xFF);
	    }
	    else
	    {
	        $retval .= chr(0x80) . 
	                   chr(0x04) . 
	                   chr(($length >> 24) & 0xFF) . 
	                   chr(($length >> 16) & 0xFF) . 
	                   chr(($length >> 8) & 0xFF) . 
	                   chr($length & 0xFF);
	    }
	
	    return $retval . $value;
	}
	
}