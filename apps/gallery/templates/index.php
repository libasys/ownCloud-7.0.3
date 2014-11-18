<input type="hidden" name="mailNotificationEnabled" id="mailNotificationEnabled" value="<?php p($_['mailNotificationEnabled']) ?>" />
<input type="hidden" name="allowShareWithLink" id="allowShareWithLink" value="<?php p($_['allowShareWithLink']) ?>" />
<div id="controls">
<div id='breadcrumbs'></div>
<div id='loaderCaching'></div>
<span class="right">
<div class="button-group" style="margin-right:5px;">
<button class="button info"><?php p($l->t("Info")); ?></button>		
<button class="button sort"><?php p($l->t("Name")); ?></button>
<button class="button sortdate"><?php p($l->t("Date")); ?></button>	
<button class="button share"><?php p($l->t("Share")); ?></button>
<a class="share" 
data-item-type="folder" 
data-item="" 
data-link="true"
title="<?php p($l->t("Share")); ?>"
data-possible-permissions="31"></a>
<button class="button batch"><?php p($l->t("Batch")); ?></button>
</div>	
</span>
</div>
<div id="gallery" class="hascontrols"></div>

<div id="emptycontent" class="hidden"><?php p($l->t("No pictures found! If you upload pictures in the files app, they will be displayed here.")); ?></div>
