function Album (path, subAlbums, images, name, token) {
	this.token = token;
	this.path = path;
	this.subAlbums = subAlbums;
	this.images = images;
	this.viewedItems = 0;
	this.name = name;
	this.domDef = null;
	this.preloadOffset = 0;
    Gallery.getAlbumInfo(path);
  
}

Album.prototype.getThumbnail = function () {
	if (this.images.length) {
		return this.images[0].getThumbnail(true);
	} else {
		return this.subAlbums[0].getThumbnail();
	}
};

Album.prototype.getThumbnailWidth = function () {
	return this.getThumbnail().then(function (img) {
		return img.originalWidth;
	});
};

/**
 *@param {GalleryImage} image
 * @param {number} targetHeight
 * @param {number} calcWidth
 * @param {object} a
 * @returns {a}
 */
Album.prototype.getOneImage = function (image, targetHeight, calcWidth, a, square) {
	
	var parts = image.src.split('/');
 	parts.shift();
 	var path = parts.join('/');
     var albumpath=this.path;
 	var gm = new GalleryImage(image.src, path, image.title ,image.mtime);
	gm.getThumbnail(square).then(function(img) {
		
		if(square == 2){
			var divCrop=$('<div/>').addClass('cropHeight').css({'margin-left':'0px','max-height': (targetHeight / 2)+'px','overflow':'hidden','display':'block','width':(calcWidth)+'px'});
			$(img).addClass('scale');
			divCrop.append(img);
			a.append(divCrop);
			img.width = calcWidth;
		}else{
			a.append(img);
			img.height = (targetHeight / 2);
			img.width = calcWidth;
		}
		 $(img).click(function(){
		    window.location='#'+albumpath;
		});
		
		});
	
};

/**
 *@param {array} images
 * @param {number} targetHeight
 * @param {number} ratio
 * @param {object} a
 * @returns {a}
 */
Album.prototype.getFourImages = function (images, targetHeight, ratio, a) {
  
	var calcWidth = (targetHeight * ratio) / 2;
	var iImagesCount = images.length;
	if (iImagesCount > 4) {
		iImagesCount = 4;
	}
	var square = 1;
	

	for (var i = 0; i < iImagesCount; i++) {
		if (iImagesCount == 2) {
		 	calcWidth = (targetHeight * ratio);
		 	square = 2;
		}
		 if (iImagesCount == 3) {
			 if (i == 0) {
			 	calcWidth = (targetHeight * ratio);
			 	square = 2;
			 } else {
			 	calcWidth = (targetHeight * ratio) / 2;
			 	square = 1;
			 }
		}

 	this.getOneImage(images[i], targetHeight, calcWidth, a, square);
	}
};

Album.prototype.getDom = function (targetHeight) {
	var album = this;
 
 
	return this.getThumbnail().then(function (img) {
		
		var aShare;
		Gallery.getAlbumInfo(album.path).then(function(info) {
			var sTitle=info.owner;
		   var sIcon='icon-share';
			if(info.isshared == true){
				sIcon='icon-sharedby';
				sTitle='shared by '+info.owner;
			}
			if(Gallery.folderSharees[info.fileid]!=undefined){
				if(Gallery.folderSharees[info.fileid]==3){
					sIcon='icon-public';
					sTitle='shared by public link';
				}else{
					sIcon='icon-shared';
					sTitle='shared with user or group';
				}
			}
			aShare=$('<a/>')
			.attr({
				'class':'share '+sIcon,
				'data-item-type':'folder',
				'data-item':info.fileid,
				'data-link':'true',
				'data-possible-permissions':info.permissions,
				'title':sTitle
			}).css({'margin-top':'2px','margin-right':'3px'});
		});
		
		//.attr('href','#'+album.path)
		var a = $('<a/>').addClass('album');
		var aFolder=$('<a/>').addClass('album-name').attr({'href':'#'+album.path,'title':album.name +' ('+ album.images.length+')'}).text(' '+album.name +' ('+ album.images.length+')');
        var label=$('<label/>').addClass('descr');
       	label.append(aShare);
       	label.append(aFolder);
		a.append(label);
		
		var ratio = Math.round(img.ratio * 100) / 100;
		//var ratio = 1;
		var calcWidth = (targetHeight * ratio) / 2;
       
		a.width(calcWidth * 2);
		a.height(targetHeight);

		if (album.images.length > 1) {
			album.getFourImages(album.images, targetHeight, ratio, a);
		} else {
			if (album.images.length === 0 && album.subAlbums[0].images.length > 1) {
				album.getFourImages(album.subAlbums[0].images, targetHeight, ratio, a);
			} else {
				a.append(img);
				img.height = (targetHeight - 2);
				img.width = (targetHeight * ratio) - 2;
				$(img).click(function(){
				    window.location='#'+album.path;
					
				});
			}

		}

		return a;
	});
};


/**
 *
 * @param {number} width
 * @returns {$.Deferred<Row>}
 */
Album.prototype.getNextRow = function (width) {
	/**
	 * Add images to the row until it's full
	 *
	 * @param {Album} album
	 * @param {Row} row
	 * @param {GalleryImage[]} images
	 * @returns {$.Deferred<Row>}
	 */
	
	var addImages = function (album, row, images) {
	
	 	if ((album.viewedItems + 5) > album.preloadOffset) {
			album.preload(20);
		}
	
		var image = images[album.viewedItems];
		return row.addImage(image).then(function (more) {
			
			album.viewedItems++;
			
			if (more && album.viewedItems < images.length) {
				return addImages(album, row, images);
			} else {
				return row;
			}
		});
	};
	var items = this.subAlbums.concat(this.images);
	var row = new Row(width);
	return addImages(this, row, items);
};

Album.prototype.getThumbnailPaths = function (count) {
	var paths = [];
	var items = this.images.concat(this.subAlbums);
	
	for (var i = 0; i < items.length && i < count; i++) {
		paths = paths.concat(items[i].getThumbnailPaths(count));
	}

	return paths;
};

Album.prototype.getThumbnailIds = function (count) {
	var ids = [];
	var items = this.images.concat(this.subAlbums);
	
	for (var i = 0; i < items.length && i < count; i++) {
		ids = ids.concat(items[i].getThumbnailIds(count));
	}

	return ids;
};

/**
 * preload the first $count thumbnails
 * @param count
 */
Album.prototype.preload = function (count) {
	var items = this.subAlbums.concat(this.images);

	var fileIds = [];
	var squareFileIds = [];
	var paths = [];
	var squarePaths = [];
	for (var i = this.preloadOffset; i < this.preloadOffset + count && i < items.length; i++) {
		if (items[i].subAlbums) {
			squarePaths = squarePaths.concat(items[i].getThumbnailPaths(4));
			squareFileIds = squareFileIds.concat(items[i].getThumbnailIds(4));
			
		} else {
			fileIds = fileIds.concat(items[i].getThumbnailIds());
			paths = paths.concat(items[i].getThumbnailPaths());
		}
		
	}
 
	this.preloadOffset = i;
	
	
	
	Thumbnail.loadBatch(paths, fileIds, false, this.token);
	Thumbnail.loadBatch(squarePaths, squareFileIds, true, this.token);
	
};

function Row (targetWidth) {
	this.targetWidth = targetWidth;
	this.items = [];
	this.width = 8; // 4px margin to start with
	
}

/**
 * @param {GalleryImage} image
 * @return {$.Deferred<bool>} true if more images can be added to the row
 */
Row.prototype.addImage = function (image) {
	var row = this;
	var def = new $.Deferred();
	image.getThumbnailWidth().then(function (width) {
		row.items.push(image);
		
		row.width += width + 4; // add 4px for the margin
		def.resolve(!row.isFull());
	}, function () {
		console.log('Error getting thumbnail for ' + image);
		def.resolve(true);
	});
	return def;
};

Row.prototype.getDom = function () {
	var scaleRation = (this.width > this.targetWidth) ? this.targetWidth / this.width : 1;
	
	var targetHeight = 200 * scaleRation;
	var row = $('<div/>').addClass('row loading');
	/**
	 * @param row
	 * @param {GalleryImage[]} items
	 * @param i
	 * @returns {*}
	 */
	var addImageToDom = function (row, items, i) {
		return items[i].getDom(targetHeight).then(function (itemDom) {
			i++;
			row.append(itemDom);
			
			if (i < items.length) {
				return addImageToDom(row, items, i);
			} else {
				return row;
			}
		});
	};
	
	return addImageToDom(row, this.items, 0);
};

/**
 * @returns {boolean}
 */
Row.prototype.isFull = function () {
	return this.width > this.targetWidth;
};

function GalleryImage (src, path, title, mtime,fileid, token) {
	this.token = token;
	this.src = src;
	this.path = path;
	this.title = title;
	this.mtime = mtime;
	this.fileid = fileid;
	this.thumbnail = null;
	this.domDef = null;
	this.domHeigth = null;
}

GalleryImage.prototype.getThumbnailPaths = function () {
	return [this.path];
};
GalleryImage.prototype.getThumbnailIds = function () {
	return [this.fileid];
};
GalleryImage.prototype.getThumbnail = function (square) {
	
	return Thumbnail.get(this.src, square, this.token).queue();
};

GalleryImage.prototype.getThumbnailWidth = function () {
	return this.getThumbnail().then(function (img) {
		return img.originalWidth;
	});
};

GalleryImage.prototype.getDom = function (targetHeight) {
	var image = this;
	if (this.domDef === null || this.domHeigth !== targetHeight) {
		this.domHeigth = targetHeight;
		this.domDef = this.getThumbnail().then(function (img) {
			
			var a = $('<a/>').addClass('image').attr('href', '#' + encodeURI(image.path)).attr('data-path', image.path);
			img.height = targetHeight;
			img.width = targetHeight * img.ratio;
			img.setAttribute('width', 'auto');
			imgName=image.title;
		
			var externLink='';
		
			if(image.token != '' && image.token != undefined){
				var DownloadLinkSrc=OC.linkTo('','public.php?service=files&t='+image.token+'&files='+ encodeURIComponent(image.path)+'&download');	
			}else{
				var DownloadLinkSrc=OC.generateUrl('apps/gallery/downloadimage?file={file}',{file: encodeURIComponent(image.path)});	
		    }
				externLink=' <a href="'+DownloadLinkSrc+'" class="svg icon-download" title="Download Original Image" style="width:20px; height:32px;background-size:16px 16px;"></a>';
				
			a.append($('<label/>').attr('class','descr').html(imgName+externLink));
			a.append(img);
			return a;
		});
	}
	return this.domDef;
};
