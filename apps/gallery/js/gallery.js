var Gallery = {};
Gallery.images = [];
Gallery.currentAlbum = '';
Gallery.users = [];
Gallery.albumMap = {};
Gallery.imageMap = {};
Gallery.folderSharees = {};
Gallery.init = false;
Gallery.bSort = true;



Gallery.getAlbum = function(path, token) {
	if (!Gallery.albumMap[path]) {
		Gallery.albumMap[path] = new Album(path, [], [], OC.basename(path), token);
		if (path !== '') {
			var parent = OC.dirname(path);
			if (parent === path) {
				parent = '';
			}
			Gallery.getAlbum(parent, token).subAlbums.push(Gallery.albumMap[path]);
		
		}
	}
	return Gallery.albumMap[path];
};

// fill the albums from Gallery.images

Gallery.fillAlbums = function() {
	var sortFunction = function(a, b) {
		if (a.title != undefined) {
			//Files
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
		} else {
			//Folders
			return a.path.toLowerCase().localeCompare(b.path.toLowerCase());
		}
	};
	
	var token = ($('#gallery').data('token') !== undefined) ? $('#gallery').data('token') : '';
	
	if(token == ''){
	 OC.Share.loadIcons('folder','',function(data){
			$.each(data,function(i,item){
				if(item.link == true){
					Gallery.folderSharees[i]=3;
				}else{
					
					Gallery.folderSharees[i]=1;
				}
			});
		});
	}
	
	var album, image;
	return $.getJSON(OC.generateUrl('apps/gallery/getimages'), {
		token : token
	}).then(function(data) {
		Gallery.images = data;
        
       
        
		for (var i = 0; i < Gallery.images.length; i++) {
			var path = Gallery.images[i]['path'];
			//alert(Gallery.images[i]['title']);
			 image = new GalleryImage(Gallery.images[i]['path'], path, Gallery.images[i]['title'], Gallery.images[i]['mtime'], Gallery.images[i]['fileid'], token);
			
			var dir = OC.dirname(path);
			if (dir === path) {
				dir = '';
			}
			
		    album = Gallery.getAlbum(dir,token);
			album.images.push(image);
			Gallery.imageMap[image.path] = image;
			
			
			
		}
        
        $.each(Gallery.albumMap,function(path){
         	Gallery.albumMap[path].images.sort(sortFunction);
			Gallery.albumMap[path].subAlbums.sort(sortFunction);
        });
 		
	});

};

Gallery.getAlbumInfo = function(album) {
	if (album === $('#gallery').data('token')) {
		return [];
	}
 
	if (!Gallery.getAlbumInfo.cache[album]) {
		var def = new $.Deferred();
		Gallery.getAlbumInfo.cache[album] = def;
		$.getJSON(OC.generateUrl('apps/gallery/loadgallery?gallery={gallery}', {
			gallery : album
		}), function(data) {
			def.resolve(data);
          
		});
		
	}
	return Gallery.getAlbumInfo.cache[album];
};
Gallery.getAlbumInfo.cache = {};
Gallery.getImage = function(image) {
	var token = ($('#gallery').data('token') !== undefined) ? $('#gallery').data('token') : '';
	return OC.generateUrl('apps/gallery/ajax/image?file={file}&token={token}', {
		file : encodeURIComponent(image),
		token : token
	});
};
Gallery.share = function(event) {
	if (!OC.Share.droppedDown) {
		event.preventDefault();
		event.stopPropagation();

		(function() {
			var target = OC.Share.showLink;
			OC.Share.showLink = function() {
				var r = target.apply(this, arguments);
				$('#linkText').val($('#linkText').val().replace('service=files', 'service=gallery'));
				return r;
			};
		})();

		Gallery.getAlbumInfo(Gallery.currentAlbum).then(function(info) {

			$('a.share').data('item', info.fileid).data('link', true).data('possible-permissions', info.permissions).click();
			if (!$('#linkCheckbox').is(':checked')) {
				$('#linkText').hide();
			}
		});
	}
};
Gallery.view = {};
Gallery.view.element = null;
Gallery.view.clear = function() {
	Gallery.view.element.empty();
	Gallery.showLoading();
};
Gallery.view.cache = {};

Gallery.view.viewAlbum = function(albumPath) {
	var i, crumbs, path;
	albumPath = albumPath || '';
	if (!Gallery.albumMap[albumPath]) {

		return;
	}

	Gallery.view.clear();
	if (albumPath !== Gallery.currentAlbum) {
		Gallery.view.loadVisibleRows.loading = false;

	}
	Gallery.currentAlbum = albumPath;

	if (albumPath === '' || $('#gallery').data('token')) {
		$('button.share').hide();
	} else {
		$('button.share').show();
	}

	OC.Breadcrumb.clear();
	var albumName = $('#content').data('albumname');
	if (!albumName) {
		albumName = t('gallery', 'Pictures');
	}
	OC.Breadcrumb.push(albumName, '#').click(function() {
		//Gallery.view.viewAlbum('');
	});
	
	path = '';
	crumbs = albumPath.split('/');
	for ( i = 0; i < crumbs.length; i++) {
		if (crumbs[i]) {
			if (path) {
				path += '/' + crumbs[i];
			} else {
				path += crumbs[i];
			}
			Gallery.view.pushBreadCrumb(crumbs[i], path);
		}
	}

	Gallery.getAlbumInfo(Gallery.currentAlbum);
	//preload album info
  
	Gallery.albumMap[albumPath].viewedItems = 0;
	setTimeout(function() {
		Gallery.view.loadVisibleRows.activeIndex = 0;
		Gallery.view.loadVisibleRows(Gallery.albumMap[Gallery.currentAlbum], Gallery.currentAlbum);
	}, 0);
};

Gallery.view.loadVisibleRows = function(album, path) {

	if (Gallery.view.loadVisibleRows.loading && Gallery.view.loadVisibleRows.loading.state() !== 'resolved') {
		return Gallery.view.loadVisibleRows.loading;
	}
	// load 2 windows worth of rows
	var scroll = $('#content-wrapper').scrollTop() + $(window).scrollTop();
	var targetHeight = ($(window).height() * 2) + scroll;
	var windowWidth=$(window).width()-5;
	
	var showRows = function(album) {
		if (!(album.viewedItems < album.subAlbums.length + album.images.length)) {
			Gallery.view.loadVisibleRows.loading = null;
			return;
		}
		
		return album.getNextRow(windowWidth).then(function(row) {
			
			return row.getDom().then(function(dom) {
				// defer removal of loading class to trigger CSS3 animation
				
				_.defer(function() {
					dom.removeClass('loading');
				});
				if (Gallery.currentAlbum !== path) {
					Gallery.view.loadVisibleRows.loading = null;
					return;
					//throw away the row if the user has navigated away in the meantime
				}
				if (Gallery.view.element.length == 1) {
					Gallery.showNormal();
				}
				Gallery.view.element.append(dom);
				 
				if (album.viewedItems < album.subAlbums.length + album.images.length && Gallery.view.element.height() < targetHeight) {
					return showRows(album);
				} else {
					Gallery.view.loadVisibleRows.loading = null;
					if (!(album.viewedItems < album.subAlbums.length + album.images.length)) {
				   		$('#controls button').removeAttr('disabled').addClass('isActive');
				  	}
				}
			}, function() {
				Gallery.view.loadVisibleRows.loading = null;
			});
		});
	};
	if (Gallery.view.element.height() < targetHeight) {
	Gallery.view.loadVisibleRows.loading = true;
	
	Gallery.view.loadVisibleRows.loading = showRows(album);

	return Gallery.view.loadVisibleRows.loading;
	}
};
Gallery.view.loadVisibleRows.loading = false;

Gallery.view.pushBreadCrumb = function(text, path) {
	
	OC.Breadcrumb.push(text, '#' + path).click(function() {
		//Gallery.view.viewAlbum(path);
	});
};

Gallery.showEmpty = function() {
	$('#controls').addClass('hidden');
	$('#emptycontent').removeClass('hidden');
	$('#loading').addClass('hidden');
};

Gallery.showLoading = function() {
	$('#emptycontent').addClass('hidden');
	$('#controls').removeClass('hidden');
	$('#content').addClass('icon-loading');
};

Gallery.showNormal = function() {
	$('#emptycontent').addClass('hidden');
	$('#controls').removeClass('hidden');
	$('#content').removeClass('icon-loading');
};

Gallery.slideShow = function(images, startImage, autoPlay) {
	var start = images.indexOf(startImage);

	images = images.map(function(image) {
		return {
			name : OC.basename(image.path),
			url : Gallery.getImage(image.src),
			fileid : image.fileid,
			path : image.path
		};
	});

	var slideShow = new SlideShow($('#viewportImage'), images);
	Thumbnail.concurrent = 1;

	slideShow.onStop = function() {
		Gallery.activeSlideShow = null;

		$('#content').show();
		location.hash = encodeURI(Gallery.currentAlbum);
		
		Thumbnail.concurrent = 3;
	};
	Gallery.activeSlideShow = slideShow;

	slideShow.init(autoPlay);
	slideShow.show(start);
};

Gallery.sortImagesRefresh = function() {
	var sortFunction = function(a, b) {
		//Files
		return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
	};
	
	var path = Gallery.currentAlbum;
	var albumPath = path;
	var album = Gallery.albumMap[albumPath];
	var images = album.images;
    
     $.each(Gallery.albumMap,function(path){
         	Gallery.albumMap[path].images.sort(sortFunction);
       });
    
	
	Gallery.view.viewAlbum(Gallery.currentAlbum);
};


Gallery.sortActive = function(bActive) {
	Gallery.bSort = bActive;
};
Gallery.sortImagesByName = function() {
	var sortFunction = function(a, b) {
		if (a.title != undefined) {
			//Files
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
		} else {
			//Folders
			return a.path.toLowerCase().localeCompare(b.path.toLowerCase());
		}

	};
	if (Gallery.bSort == true) {
        $('#gallery a.image label.descr').hide(); 
        
		if ($('button.sort').hasClass('arrowDown')) {
			$('button.sort').removeClass('arrowDown');

		} else {
			$('button.sort').addClass('arrowDown');

		}
        
		var path = Gallery.currentAlbum;
		var albumPath = path;
		var album = Gallery.albumMap[albumPath];
		var images = album.images;

         $.each(Gallery.albumMap,function(path){
         	Gallery.albumMap[path].images.sort(sortFunction);
			Gallery.albumMap[path].subAlbums.sort(sortFunction);
			//Sort DESC
			if ($('button.sort').hasClass('arrowDown')) {
				Gallery.albumMap[path].images.reverse();
				Gallery.albumMap[path].subAlbums.reverse();
			}
       });

		
	
		Gallery.view.viewAlbum(Gallery.currentAlbum);
		Gallery.bSort = true;
		
	}
};

Gallery.sortImagesByDate = function() {
	var sortFunction = function(a, b) {
		//Files
		//return a.mtime.localeCompare(b.mtime);
		return a.mtime - b.mtime;
	};
	
    $('#gallery a.image label.descr').hide();
    
	if ($('button.sortdate').hasClass('arrowDown')) {
		$('button.sortdate').removeClass('arrowDown');

	} else {
		$('button.sortdate').addClass('arrowDown');

	}
	if (Gallery.bSort == true) {
		var path = Gallery.currentAlbum;
		var albumPath = path;
		var album = Gallery.albumMap[albumPath];
		var images = album.images;

		 $.each(Gallery.albumMap,function(path){
         	Gallery.albumMap[path].images.sort(sortFunction);
			Gallery.albumMap[path].subAlbums.sort(sortFunction);
			//Sort DESC
			if ($('button.sortdate').hasClass('arrowDown')) {
				Gallery.albumMap[path].images.reverse();
				Gallery.albumMap[path].subAlbums.reverse();
			}
       });

		
		Gallery.view.viewAlbum(albumPath);
		Gallery.bSort = true;
	}
};

Gallery.batchPreviewImages = function() {
	var Icounter = 0;
	var path = decodeURI(location.hash).substr(1);
	var albumPath = path;

	var album = Gallery.albumMap[albumPath];
	var images = album.images;
	var imagesCount = images.length;

	for (var i = 0; i < imagesCount; i++) {
		//alert(images[i]['path']);
		if (i == 0) {
			$('#loaderCaching').show();

		}

		$.getJSON(OC.generateUrl('apps/gallery/getimagescaching'), {
			imagePath : images[i]['path']
		}, function(result) {
			if (result !== null) {
				$('#loaderCaching').html(Icounter + '. ' + result);
				Icounter++;
			}
			if (Icounter == imagesCount) {
				$('#loaderCaching').html(imagesCount + ' Images checked');
				$('#loaderCaching').hide(2000, function() {
					$('#loaderCaching').html('');
				});

			}
		});

	}

};

Gallery.activeSlideShow = null;

$(document).ready(function() {
	Gallery.init = true;
	
	$(document).on('click', 'a.share', function(event) {
				    event.stopPropagation();
			
				
		        (function() {
					var target = OC.Share.showLink;
					OC.Share.showLink = function() {
						var r = target.apply(this, arguments);
						$('#dropdown #linkText').val($('#dropdown #linkText').val().replace('service=files', 'service=gallery'));
						return r;
					};
				})();
				
				$('#gallery #dropdown').css({
					'position':'fixed',
					'top' : $(event.target).offset().top + 20,
					'left' : $(event.target).offset().left,
					'z-index':500,
				});
				var itemId = $(event.target).data('item');
				if(Gallery.folderSharees[itemId]!=undefined){
					if(Gallery.folderSharees[itemId]==3){
						$('#dropdown #linkText').val($('#linkText').val().replace('service=files', 'service=gallery'));
					}
				}
			
			
	});

	Gallery.showLoading();

	Gallery.view.element = $('#gallery');
	
	Gallery.fillAlbums().then(function() {
		
		if (Gallery.images.length === 0) {
			Gallery.showEmpty();
		}
		OC.Breadcrumb.container = $('#breadcrumbs');
        
		window.onhashchange();
		
		$('button.share').click(Gallery.share);
		$('button.batch').click(Gallery.batchPreviewImages);
		$('button.sort').click(Gallery.sortImagesByName);
		$('button.sortdate').click(Gallery.sortImagesByDate);
		$('button.info').click(function(){
				$('#gallery a.image label.descr').toggle();
		});
	});

	$('#openAsFileListButton').click(function(event) {
		window.location.href = window.location.href.replace('service=gallery', 'service=files');
	});
    /*
	$(window).scroll(function() {
		Gallery.view.loadVisibleRows(Gallery.albumMap[Gallery.currentAlbum], Gallery.currentAlbum);
	});*/
	$('#content-wrapper').scroll(function() {
		Gallery.view.loadVisibleRows(Gallery.albumMap[Gallery.currentAlbum], Gallery.currentAlbum);
	});

	$(window).resize(_.throttle(function() {
		Gallery.view.viewAlbum(Gallery.currentAlbum);
	}, 500));

	if ($('#gallery').data('requesttoken')) {
		oc_requesttoken = $('#gallery').data('requesttoken');
	}
});

window.onhashchange = function() {
	var path = decodeURI(location.hash).substr(1);

	if (Gallery.albumMap[path]) {
		
		
		if (Gallery.activeSlideShow) {
			Gallery.activeSlideShow.stop();

		}
		path = decodeURIComponent(path);
		
		if (Gallery.currentAlbum !== path || Gallery.init == true) {
  			Gallery.view.viewAlbum(path);
  			
  			$('#controls button').attr('disabled','disabled').removeClass('isActive');
  			Gallery.init = false;
		}
        
        

	} else if (!Gallery.activeSlideShow) {
		var albumPath = OC.dirname(path);
		if (albumPath === path) {
			albumPath = '';
		}
      
		if (Gallery.currentAlbum !== albumPath  || Gallery.init == true) {
			
			Gallery.view.viewAlbum(albumPath);
			
		}
		var album = Gallery.albumMap[albumPath];
		var images = album.images;
		
		var startImage = Gallery.imageMap[path];
		Gallery.slideShow(images, startImage);
	}

};
