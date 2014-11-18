<div id="edit-pin" data-id="<?php p($_['id']); ?>">
 
 	<form name="pinForm" id="pinForm" action=" ">	
    <input type="hidden" name="hiddenfield" value="" />
     <input type="hidden" name="userId"  value="<?php p($_['userid']); ?>" />
      <input type="hidden" name="addedDate" value="<?php p($_['dateadded']); ?>" />
    <input type="hidden" name="plon" id="plon" value="<?php p($_['lon']); ?>" />
  <input type="hidden" name="plat" id="plat" value="<?php p($_['lat']); ?>" />
   <input type="hidden" name="id" id="photoId" value="" />
   <input type="hidden" name="isphoto" id="isphoto" value="<?php p($_['isPhoto']); ?>" />
   <input type="hidden" name="tmpkey" id="tmpkey" value="<?php p($_['tmpkey']); ?>" />
   <textarea id="imgsrc" name="imgsrc" style="display:none;"><?php p($_['imgsrc']); ?></textarea>
   <input type="hidden" name="imgmimetype" id="imgmimetype" value="<?php p($_['imgMimeType']); ?>" />
   <input type="hidden" name="choosencolor" id="choosencolor" value="<?php p($_['choosenPinColor']); ?>" />
   <input type="hidden" name="choosenpinmotive" id="choosenpinmotive" value="<?php p($_['markercolor']); ?>" />
    <input type="hidden" name="wall_id" id="wall_id" value="" />
    <input type="hidden" name="media_url" id="media_url" value="<?php p($_['mediaUrl']); ?>" />
   <input type="hidden" name="media_sitename" id="media_sitename" value="<?php p($_['mediaSite']); ?>" />
   <input type="hidden" name="media_height" id="media_height" value="<?php p($_['mediaHeight']); ?>" />
   <input type="hidden" name="media_width" id="media_width" value="<?php p($_['mediaWidth']); ?>" />
   <input type="hidden" name="tagsforsave" id="tagsforsave" value="<?php p($_['tags']); ?>" />

	
      <span style="text-align:left;float:left;padding-left:5px; width:54%;padding-top:10px;border-right:1px solid #f4f4f4;">
 	<?php
      	   foreach($_['aPinColors'] as $key => $val){
      	   	  	$checked='';	
      	   	  	if($key==0){
      	   	  		$descr=$l -> t($val);
     	   	  	}else{
      	   	  		$descr='<img style="margin-left:-5px;" src="'.OCP\Util::imagePath('pinit', 'pins/'.$val.'.png').'" width="26" height="29" />';
      	   	  	}
				if($key==$_['choosenPinColor']){
					$checked='checked';
				}
  			  print_unescaped('<input  type="radio" name="pincolor" id="picolor-'.$key.'" class="regular-radio radiopincolor" value="'.$key.'" '.$checked.' /><label style="margin-left:4px; top:4px;" for="picolor-'.$key.'"></label> '.$descr);
			  
      	   }
      	?>
      	<br />   
       <input type="checkbox"  value="1" id="ppublic" name="ppublic" <?php p($_['cPublic']); ?> class="regular-checkbox"><label style="margin-left:5px; top:4px;" for="ppublic"></label><span style="line-height:26px;"> <?php p($l -> t("Public")); ?></span>
     <br style="clear:both;">   
     <input type="text" placeholder="<?php p($l -> t("Name")); ?>" value="<?php p($_['title']); ?>" maxlength="300" id="pname"  name="pname" />
	 	<textarea style="width:290px;min-height:100px;" placeholder="<?php p($l -> t("Description")); ?>" id="pdescr"  name="pdescr"><?php p($_['description']); ?></textarea>
	  	<input type="text" style="width:260px;"  placeholder="<?php p($l -> t("Street, Postalcode, City, Country")); ?>" value="<?php p($_['location']); ?>"  id="plocation"  name="plocation" />
	 	 <a  id="renderLocation" class="icon-add"></a>
	 	 <br style="clear:both;" />
	 	 <span id="lonlatinfo" style="display:none;color:#ccc; font-size:11px;"></span>
	 	 <br style="clear:both;" />
	 	 
	  	 <input  type="radio" name="websitemode" id="websitemode-0" class="regular-radio websiteInfo" value="meta" checked /><label style="margin-left:4px; top:4px;" for="websitemode-0"></label> MetaInfo
	  	  <input  type="radio" name="websitemode" id="websitemode-1" class="regular-radio websiteInfo" value="screen"  /><label style="margin-left:4px; top:4px;" for="websitemode-1"></label> Screenshot
	  	  <input  type="radio" name="websitemode" id="websitemode-2" class="regular-radio websiteInfo" value="pic"  /><label style="margin-left:4px; top:4px;" for="websitemode-2"></label> Picture

	  <input style="width:260px;" type="text" placeholder="<?php p($l -> t("http://Url")); ?>" value="<?php p($_['url']); ?>" maxlength="300" id="purl"  name="purl" />
    <a id="renderWebsite" class="icon-add"></a>
	  <br /><span id="websiteService" style="display:none;"></span>
<br style="clear:both;"> 
  </span>
 <span style="width:44%;float:left;display:block;padding-left:10px;padding-top:10px;"> 
 <span class="labelPhoto" id="pinPhoto"><?php print_unescaped($_['thumbnail']); ?>
  <div class="tip" id="pin_details_photo_wrapper" title="<?php p($l->t('Drop photo to upload')); ?> (max <?php p($_['uploadMaxHumanFilesize']); ?>)" data-element="PHOTO">
	<ul id="phototools" class="transparent hidden">
		<li><a class="delete" title="<?php p($l->t('Delete current photo')); ?>"><img style="height:26px;" class="svg" src="<?php print_unescaped(OCP\Util::imagePath('core', 'actions/delete.svg')); ?>"></a></li>
		<li><a class="edit" title="<?php p($l->t('Edit current photo')); ?>"><img style="height:26px;" class="svg" src="<?php print_unescaped(OCP\Util::imagePath('core', 'actions/rename.svg')); ?>"></a></li>
		<li><a class="svg upload" title="<?php p($l->t('Upload new photo')); ?>"><img style="height:26px;" class="svg" src="<?php print_unescaped(OCP\Util::imagePath('core', 'actions/upload.svg')); ?>"></a></li>
		<li><a class="svg cloud" title="<?php p($l->t('Select photo from ownCloud')); ?>"><img style="height:26px;" class="svg" src="<?php print_unescaped(OCP\Util::imagePath('core', 'actions/public.svg')); ?>"></a></li>
	</ul>
	</div>
	<iframe name="file_upload_target" id="file_upload_target" src=""></iframe>	
 </span>
  <div id="embedSrc" style="text-align:left;">
  	<?php 
  	if($_['mediaUrl'] != ''){
  		print_unescaped('<iframe src="'.$_['mediaUrl'].'" width="250" height="160" frameborder="no"></iframe><input type="checkbox" checked="checked" id="saveMedia" /> <span>Save Media</span>');
  	} 
  	?>
  	
  	
  </div>
 <ul id="tagmanager" style="width:250px;"></ul>
 <div id="additMarker" style="display:block; padding-bottom:10px;">
	 	 	<span style="float:left;padding-left:5px;">Marker Color:</span>
	 	 	<span style="float:left;">
	 	  	 <?php
      	   foreach($_['aPinMarkerColors'] as $key => $val){
      	   	  	$checked='';	
      	   	  	if($val==$_['markercolor']){
      	   	  		$checked='checked';	
      	   	  	}
      	   	  	$descr='<img style="background-color:'.$val.';border-radius:10px;opacity:0.6;" src="'.OCP\Util::imagePath('pinit', 'blank.gif').'" width="15" height="15" />';
      	   	  	if($key==4){
      	   	  		print_unescaped('<br />');
      	   	  	}
      	   	  print_unescaped('<input  type="radio" name="pinmarkercolor" id="pinmarkercolor-'.$key.'" class="regular-radio radiopinmarkercolor" value="'.$val.'" '.$checked.' /><label style="margin-left:4px; top:4px;" for="pinmarkercolor-'.$key.'"></label> '.$descr);
      	   }
      	?></span><br style="clear:both;" />
	 	 	<span style="float:left;padding-left:5px;">Marker  Motive :</span>
	 	 	<span style="float:left;">
	 	 	 <select name="pinicon" id="pinicon" size="1">
	 	 	 	
	 	 	  <?php
	  	   			foreach($_['aPinIcons'] as $key => $val){
	  	   				$selected='';	
	  	   				if($key == $_['icon']){
	  	   					$selected='selected';
	  	   				}
      	   				print_unescaped('<option value="'.$key.'" '.$selected.'>'.$val.'</option>');
      	   			}
      	   	?>
      	   	</select>
      	   </span>
	 	 </div>
 </span> 
	<br style="clear:both;">   
<div  style="border-top:1px solid #bbb;height:50px;line-height:50px;width:100%;">
	
 <div  class="button-group" style="margin-top:5px;margin-right:5px; float:right;">	
		<button id="edit-pin-submit" class="button"  style="min-width:60px;"><?php p($l -> t("OK")); ?></button>
		<button id="edit-pin-cancel" class="button"  ><?php p($l -> t("Cancel")); ?></button> 
	   </div>
	</div>
</form>
</div>
