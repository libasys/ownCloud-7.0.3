<header>
	<div id="header">
		<a href="<?php print_unescaped(link_to('', 'index.php')); ?>"
			title="<?php p($theme -> getLogoClaim()); ?>" id="owncloud">
			<div class="logo-icon svg"></div>
		</a>
		<div id="logo-claim" style="display:none;"><?php p($theme -> getLogoClaim()); ?></div>
		<div class="header-right">
			<span id="details"><?php p($l->t('shared by %s', $_['displayName'])) ?></span>
		</div>
	</div>
</header>
<div id="content-wrapper">
<div id="content" data-albumname="<?php p($_['albumName'])?>">
	<div id="controls">
		<div id="breadcrumbs"></div>
		<!-- toggle for opening shared picture view as file list -->
		<div id="openAsFileListButton" class="button">
			<img class="svg"
				src="<?php print_unescaped(image_path('core', 'actions/toggle-filelist.svg')); ?>"
				alt="<?php p($l -> t('File list')); ?>" />
		</div>
		<button class="button info"><?php p($l->t("Info")); ?></button>	
		<button class="button sort"><?php p($l -> t("Name")); ?></button>
        <button class="button sortdate"><?php p($l -> t("Date")); ?></button>
	</div>

	<div id='gallery' class="hascontrols" data-requesttoken="<?php p($_['requesttoken'])?>" data-token="<?php isset($_['token']) ? p($_['token']) : p(false) ?>"></div>
</div>
</div>
<br> <br>
<footer>
	<div class="info">
		<?php print_unescaped($theme -> getLongFooter()); ?>
	</div>
</footer>
