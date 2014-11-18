<input type="hidden" name="mailNotificationEnabled" id="mailNotificationEnabled" value="<?php p($_['mailNotificationEnabled']) ?>" />
<input type="hidden" name="allowShareWithLink" id="allowShareWithLink" value="<?php p($_['allowShareWithLink']) ?>" />
<form style="display:none;" class="float" id="file_upload_form" action="<?php print_unescaped(\OCP\Util::linkToRoute('pinit.photo.uploadPhoto')); ?>" method="post" enctype="multipart/form-data" target="file_upload_target">
	<input type="hidden" name="id" value="">
	<input type="hidden" name="requesttoken" value="<?php p($_['requesttoken']) ?>">
	<input type="hidden" name="MAX_FILE_SIZE" value="<?php p($_['uploadMaxFilesize']) ?>" id="max_upload">
	<input type="hidden" class="max_human_file_size" value="(max <?php p($_['uploadMaxHumanFilesize']); ?>)">
	<input id="pinphoto_fileupload" type="file" accept="image/*" name="imagefile" />
</form>
<iframe name="file_upload_target" id='file_upload_target' src=""></iframe>

<div id="notification" style="display:none;"></div>
<div id="controls">
	<div id="first-group" class="button-group" style="float:left;width:250px;">	
		
		<button class="button" id="addPinwall"><img height="16"  class="svg" src="<?php print_unescaped(OCP\Util::imagePath('core', 'actions/add.svg')); ?>" alt="<?php p($l->t('Add')); ?>" /> <?php p($l->t('Pinwall')); ?></button>
		<button class="button" id="addPin"><img height="16"  class="svg" src="<?php print_unescaped(OCP\Util::imagePath('core', 'actions/add.svg')); ?>" alt="<?php p($l->t('Add')); ?>" /> <?php p($l->t('Pin')); ?></button>
		<button class="button" id="showMap"><?php p($l->t('Map')); ?></button>

	</div>
	<div id="second-group" class="button-group" style="float:left;width:420px;">	
		<button class="button filterPins" data-filter="all"><?php p($l->t('All')); ?></button>
	<?php
      	   foreach($_['aPinColors'] as $key => $val){
       	   	if($key == 0) {
       	   		$filter='<button class="button filterPins"  data-filter="'.$val.'">'.$l->t($val).'</button>';
			}else{	
       	   		$filter='<button class="button icon-pin-'.$val.' filterPins" data-filter="'.$val.'">&nbsp;</button>';
			}
			  print_unescaped($filter);
      	   }
      	?>
      	</div>
      	<div id="pinloadingmsg"></div>
</div>
<div id="app-navigation">
	<ul id="pinWalls"></ul>
	<br />
	<ul id="newTag" style="width:180px;float:left;"></ul>
	<button class="button" id="addNewTag" style="margin-top:4px;"><?php p($l -> t("OK")); ?></button>
	<ul id="tagsFilter"></ul>
	<b><?php p($l -> t("Existing Tags")); ?></b><br />
	<ul id="myTagList"></ul>
	
</div>
<div id="app-content" class="pinbackground">

		<div id="pinlist"></div>
		 <div id="map" style="display:none;"></div>
		 <div id="mapPreview"  style="display:none;">
			 <input type="button" class="svg previewNext icon-view-next"/>
			<input type="button" class="svg previewPrevious icon-view-previous"/>
			 <div id="mappins"><div id="mappinsInner"></div></div>
		 </div>
</div>
<div id="pinContainer" style="display:none;"></div>
<div id="pinContainerShow" style="display:none;"></div>

<div id="edit_photo_dialog" title="Edit photo">
		<div id="edit_photo_dialog_img"></div>
</div>
<div id="dialogSmall" style="display:none;"></div>
<div id="dialogPin" style="display:none;"></div>


