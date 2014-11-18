$(document).ready(function(){
	var gallerySettings = {
		save : function() {
			var data = {
				startPath : $('#gallery-start-path').val()
			};
			OC.msg.startSaving('#gallery-personal .msg');
			$.post(OC.filePath('gallery', 'ajax', 'personal.php'), data, gallerySettings.afterSave);
		},
		afterSave : function(data){
			OC.msg.finishedSaving('#gallery-personal .msg', data);
		}
	};
	$('#gallery-start-path').blur(gallerySettings.save);
	$('#gallery-start-path').keypress(function( event ) {
						if (event.which == 13) {
						  event.preventDefault();
						  gallerySettings.save();
						}
	});
});