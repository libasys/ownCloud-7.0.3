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
L.PinMarker = L.Marker.extend({
	  options: {
	 	pinId:0,
	 	wallId:0
	 },
	 initialize: function (latlngs, options) {
		L.Marker.prototype.initialize.call(this, latlngs, options);
	},
	 getPinId:function(){
	 	  return this.options.pinId;
	 }	
});

L.pinMarker = function (latlngs, options) {	 
return new L.PinMarker(latlngs, options);
};

var Pinit = function() {
	this.firstLoading = true;
	this.categories = [];
	this.tagslist = [];
	this.oldGroup = false;
	this.photoData = false;
	this.imgSrc = false;
	this.imgMimeType = 'image/jpeg';
	this.aPinsMap ={};
	this.aPinsHtml = [];
	this.currentViewMode = 0;
	this.aPinWalls = [];
	this.maxImagesPerRow = 3;
	this.columnWidth = 230;
	this.currentPinWall = 0;
	this.latestPinIndex =0;
	this.PinMaxLoadonStart=5;
	this.pinContainer = null;
	this.mapObject = null;
	this.mapObjectMarker = {};
	this.currentMomIndex =0;
	this.layerMarker = null;
	this.aPinWallBackgrounds = [];
	this.calcMaxMarkerPerPage=Math.ceil(($('#app-content').width() - 120)/134);
	//this.calcMaxMarkerPerPage=3;
};

Pinit.prototype.init = function() {
	
	this.firstLoading = true;
    this.loadTags();
    this.loadWallBg();
    
	this.getPinWalls();
    var $this=this;
    
	$('.filterPins').each(function(el) {
		$(this).on('click', function() {
			$this.filterPinColor($(this).data('filter'));
		}.bind(this));

	});
   
	$('#newTag').tagit({
		allowNewTags : true,
		placeholder : t('pinit', 'Add new Tags'),
		tagSource : this.categories,
		maxTags : 3,
	});

	$('#tagsFilter').tagit({
		allowNewTags : false,
		tagsChanged : this.filterTagsChanged.bind(this),
		placeholder : t('pinit', 'Filter by tag')
	});

   

	$('#addPinwall').on('click', function() {
		
		this.newPinWall();
		
		//return false;
	}.bind(this));
	
	$('#addNewTag').on('click', function() {
		this.newTag();
		return false;
	}.bind(this));
	
   $('#showMap').on('click', function() {
		this.showMap();
		return false;
	}.bind(this));
	
	$('#addPin').on('click', function() {
		this.newPin();
		return false;
	}.bind(this));

	$('input#pinphoto_fileupload').fileupload({
		dataType : 'json',
		url : OC.generateUrl('apps/pinit/uploadphoto'),
		done : function(e, data) {
			this.setMetaInfo(data.result);
			this.imgSrc = data.result.imgdata;
			this.imgMimeType = data.result.mimetype;
			$('#imgsrc').val(this.imgSrc);
			$('#imgmimetype').val(this.imgMimeType);
			$('#tmpkey').val(data.result.tmp);
			this.editPhoto($('#photoId').val(), data.result.tmp);
		}.bind(this)
	});

	/* Initialize the photo edit dialog */
	$('#edit_photo_dialog').dialog({
		autoOpen : false,
		modal : true,
		position : {
			my : "left top+100",
			at : "left+40% top",
			of : $('#body-user')
		},
		height : 'auto',
		width : 'auto',
		buttons:[
		{
		text : t('core', 'OK'),
		click : function() {
			
			$this.savePhoto(this);
			$('#coords input').val('');
			$(this).dialog('close');
		}
		},
		{
		text :  t('core', 'Cancel'),
		click : function() {
			$('#coords input').val('');
			$(this).dialog('close');
		}
		}
		]
	});
	
	$("body").append('<div id="pinlistBg"></div>');
	$("#pinlistBg").on('click',function(){
 		$('#pinlistBg').hide();
 		$("#pinContainerShow").html('');
		$("#pinContainerShow").hide('fast');
		
		//if ($('#pinContainer').dialog('isOpen') == true) {
			$('#pinContainer').dialog('close');
			$("#pinContainer").html('');
		//}
		
		
		
		if (history && history.replaceState) {
			history.replaceState('', '', '#');
		}
		return false;
 	});
};

Pinit.prototype.showMap = function() {
	if(!$('#showMap').hasClass('isMap')){
   	  	$('#showMap').addClass('isMap');
   	  	$('#map').height($('#app-content').height()-136);
   	  	  this.currentViewMode=1;
   	  	  $('#pinlist').hide();
   	  	 $('#map').show();
   	  	 $('#mapPreview').show();
   	  	  this.initMapList();
   	  	 
   	  }else{
   	  	$('#showMap').removeClass('isMap');
   	  	this.currentViewMode=0;
   	  	this.mapObject.removeLayer(this.layerMarker);
   	  	$('#map').hide();
   	  	 $('#mapPreview').hide();
   	  	$('#pinlist').show();
      	if($('#pinlist .pinrow').length == 0 && this.aPinsHtml.length > 0){
      		this.initPinsList(500);
      	}else{
      		this.adjustGrid('.pinrow');
    	 }
   	  }
};

Pinit.prototype.showMapPin = function(lat,lon,zoom,oMarker) {
	  this.mapObject.setView([lat, lon], zoom);
	  oMarker.openPopup();
	  //alert(oMarker.getPinId());
};

Pinit.prototype.newPinWall = function() {
	  var inputBG = '';
	   var $this=this;
	 
		$.each(this.aPinWallBackgrounds, function(i, el) {
			
			var descr = '';
			var checked = '';
			if (i == 0) {
				descr = t('pinit', el);
				checked = 'checked';
			} else {
				descr = '<img src="' + OC.imagePath('pinit', 'bg/' + el) + '" width="30" height="30" />';
			}
			inputBG += '<input type="radio" class="radiowall" name="wallbackground" value="' + i + '" ' + checked + ' /> ' + descr;
		});
		data = '<input type="checkbox"  value="1" id="pactive"  name="wactive" checked="checked" /> aktiv ' + '<input type="text" placeholder="' + t('pinit', 'Name') + '" value="" style="width:70%;" maxlength="60" id="wname"  name="wname" />' + '<br /><br />' + inputBG;
		$("#dialogPin").html(data);
         
       
         
		$("#dialogPin").dialog({
			resizable : false,
			title : t('pinit', 'New Pinwall'),
			width : 420,
			height : 250,
			modal : true,
			buttons : [{
				text : t('core', 'OK'),
				click : function() {
                    if($('#wname').val()!=''){
					var oDialog = $(this);

					$.getJSON(OC.generateUrl('apps/pinit/newpinwall'), {
						active : $('#wactive').val(),
						name : $('#wname').val(),
						wallbackground : $('input.radiowall:checked').val()
					}, function(jsondata) {
						if (jsondata) {

							var element = jsondata;
							$this.aPinWalls[element.id] = $this.loadPinWallRow(element);
							$('#pinWalls').append($this.aPinWalls[element.id]);
							$this.currentPinWall = element.id;
							$this.getPins();
							$this.showMeldung(t('pinit', 'Pinwall created success'));
							oDialog.dialog("close");
						}
					});
					}else{
						$this.showMeldung(t('pinit', 'Name is missing'));
					}
				}
			}, {
				text : t('core', 'Cancel'),
				click : function() {
					$(this).dialog("close");
				}
			}],
		});

		return false;
};

Pinit.prototype.editPinWall = function(evt) {
	var EditElem = $(evt.target);
		var wallId = EditElem.attr('data-item-wallid');
		var wallName = EditElem.attr('data-name');
		var wallPaper = EditElem.attr('data-wallpaper');
		var $this=this;
		
		var inputBG = '';
		$.each(this.aPinWallBackgrounds, function(i, el) {
			var descr = '';
			var checked = '';
			if (i == 0) {
				descr = t('pinit', el);
				if (wallPaper == '') {
					checked = 'checked';
				}
			} else {
				if (wallPaper == el) {
					checked = 'checked';
				}
				descr = '<img src="' + OC.imagePath('pinit', 'bg/' + el) + '" width="30" height="30" />';
			}
			inputBG += '<input type="radio" class="radiowall" name="wallbackground" value="' + i + '" ' + checked + ' /> ' + descr;
		});
		data =  '<input type="checkbox"  value="1" id="wactive"  name="wactive" checked="checked" /> aktiv ' + '<input type="text" placeholder="' + t('core', 'Name') + '" value="' + wallName + '" maxlength="60" style="width:70%;" id="wname"  name="wname" />' + '<br /><br />' + inputBG;
		$("#dialogPin").html(data);

		$("#dialogPin").dialog({
			resizable : false,
			title : t('pinit', 'Edit Pinwall'),
			width : 420,
			height : 250,
			modal : true,
			buttons : [{
				text : t('core', 'OK'),
				click : function() {
					 if($('#wname').val()!=''){
					var oDialog = $(this);
					$.getJSON(OC.generateUrl('apps/pinit/editpinwall'), {
						wall_id :wallId,
						active : $('#wactive').val(),
						name : $('#wname').val(),
						wallbackground : $('input.radiowall:checked').val()
					}, function(jsondata) {
						if (jsondata) {
							//oDialog.dialog("close");
							var element = jsondata;

							$('#pinWalls .pinwall-row[data-wallid="' + element.id + '"]').text(element.displayname).attr('title', element.displayname);
							EditElem.attr({
								'data-wallpaper' : element.wallbg,
								'data-name' : element.displayname
							});
							$('#pinWalls .pinwall-row[data-wallid="' + element.id + '"]').attr('data-wallpaper', element.wallbg);

							this.currentPinWall = element.id;
							if ($('#pinWalls li .pinwall-row[data-wallid="' + element.id + '"]').hasClass('isActiveWall')) {
								if (element.wallbg != '') {
									$('#app-content').css('background', 'url(' + OC.imagePath('pinit', 'bg/' + element.wallbg) + ') repeat');
								} else {
									$('#app-content').css('background', '');
								}
							}

							$this.showMeldung(t('pinit', 'Pinwall update success'));
							oDialog.dialog("close");
						}
					});
                   }else{
						$this.showMeldung(t('pinit', 'Name is missing'));
					}
				}
			}, {
				text : t('core', 'Delete'),
				'class': 'delButton',
				click : function() {
					var oDialog = $(this);
					$("#dialogSmall").text(t('pinit', 'Delete Pinwall?'));
					$("#dialogSmall").dialog({
						resizable : false,
						title : t('pinit', 'Delete Pinwall'),
						width : 300,
						height : 150,
						modal : false,
						buttons : [{
							text : t('core', 'Delete'),
							'class': 'delButton',
							click : function() {

								var o1Dialog = $(this);
								$.getJSON(OC.generateUrl('apps/pinit/deletepinwall'), {
									wallId : wallId,
								}, function(jsondata) {
									if (jsondata) {
										var element = jsondata;
										$('#pinWalls li[data-wallmainid="' + element.id + '"]').remove();
										if(element.id == this.currentPinWall){
											$this.currentPinWall=0;
											$this.getPins();
										}
										$this.showMeldung(t('pinit', 'Pinwall deleted'));
										o1Dialog.dialog("close");
										oDialog.dialog("close");
									}
								});
							}
						}, {
							text : t('core', 'Cancel'),
							click : function() {
								$(this).dialog("close");
							}
						}],
					});
				}
			}, {
				text : t('core', 'Cancel'),
				click : function() {
					$(this).dialog("close");
				}
			}],
		});

		return false;
};
Pinit.prototype.actionHandlerPin = function(data,actionName,pinId) {
				$('#pinlistBg').show();
				$("#pinContainer").html(data);
				
				if ($("#noimage").length > 0) {
					$("#noimage").text(t('pinit', 'Drag Image Here!'));
				}
				
				$('#pinContainer').dialog({
								height:'auto',
								width:630,
								'title': "Pin",
								modal:true,
								close: function( event, ui ) {
									$('#pinlistBg').hide();
						    },
						});

				$('#wall_id').val($(".isActiveWall").attr('data-wallid'));
                this.loadActionPhotoHandlers();
				this.loadPhotoHandlers();
				
				$('#'+actionName+' a#renderWebsite').on('click', function() {
					if ($('#purl').val() != '' && this.validateURL($('#purl').val()) == true) {
						this.loadWebsitePreviewImage($('#purl').val());
					}
				}.bind(this));
				$('#'+actionName+' a#renderLocation').on('click', function() {
					if ($('#plocation').val() != '' ) {
						this.loadGeoLocation($('#plocation').val());
					}
				}.bind(this));
				
				$('#phototools li a').click(function() {
					$(this).tipsy('hide');
				});

				$('#pinPhoto').on('mouseenter', function() {
					$('#phototools').slideDown(200);
				});
				$('#pinPhoto').on('mouseleave', function() {
					$('#phototools').slideUp(200);
				});

				$('#phototools').hover(function() {
					$(this).removeClass('transparent');
				}, function() {
					$(this).addClass('transparent');
				});
				
				$('#'+actionName+'-submit').on('click', function() {
					var errorMsg = '';
					if ($('#purl').val() != '' && this.validateURL($('#purl').val()) == false) {
						errorMsg = t('pinit', 'Url is not correct') + '<br />';
					}
					if ($('#pname').val() == '') {
						errorMsg += t('pinit', 'Name is missing');
					}
					if (errorMsg != '') {
						this.showMeldung(errorMsg);
					} else {
						$('#choosencolor').val($('input.radiopincolor:checked').val());
						$('#choosenpinmotive').val($('input.radiopinmarkercolor:checked').val());
						var string = '';
						var objTags = $('#tagmanager').tagit('tags');
						$(objTags).each(function(i, el) {
							if (string == '') {
								string = el.value;
							} else {
								string += ',' + el.value;
							}
						});
						$('#tagsforsave').val(string);
						
						if(!$('#saveMedia').is(':checked')){
							$('#media_url').val('');
							$('#media_sitename').val('');
							$('#media_width').val('');
							$('#media_height').val('');
							
						}

						this.SubmitForm(actionName, '#pinForm', '#pinContainer',pinId);
					}

					return false;
				}.bind(this));
				
				$('#'+actionName+'-cancel').on('click', function() {
					$('#pinlistBg').hide();
					$('#pinContainer').dialog('close');
					$("#pinContainer").html('');
					$('#tagmanager').tagit('destroy');
					
					
					return false;
				});

				
};
Pinit.prototype.newPin = function() {
	$.ajax({
			type : 'POST',
			url : OC.generateUrl('apps/pinit/newpin'),
			data : {},
			success : function(data) {
				
				this.actionHandlerPin(data, 'new-pin','newpin');
				
				
				$('#tagmanager').tagit({
					tagSource : this.categories,
					maxTags : 4,
					allowNewTags : false,
					placeholder : t('pinit', 'Add Tags'),
				});
			
				 $('#additMarker').hide();
				 
			}.bind(this)
		});

};

Pinit.prototype.editPin = function(evt) {
	  var pinId = $(evt.target).attr('data-id');
		$.ajax({
			type : 'POST',
			url :  OC.generateUrl('apps/pinit/editpin'),
			data : {
				id : pinId
			},
			success : function(data) {
				
				this.actionHandlerPin(data, 'edit-pin',pinId);

				if ($('#imgsrc').val() != '') {
					this.imgSrc = $('#imgsrc').val();
					this.imgMimeType = $('#imgmimetype').val();
					this.loadPhoto();
				}
	
				var sExistTags = $('#tagsforsave').val();
				var aExitsTags = sExistTags.split(",");
				
				$('#tagmanager').tagit({
					tagSource : this.categories,
					maxTags : 3,
					initialTags : aExitsTags,
					allowNewTags : false,
					placeholder : t('pinit', 'Add Tags'),
				});
                
                if($('#plon').val() !='' ){
                	$('#lonlatinfo').text('Lat: '+$('#plat').val()+', Lon: '+$('#plon').val());
                	$('#lonlatinfo').show();
                	$('#additMarker').show();
                }else{
                	 $('#additMarker').hide();
                }
	
			}.bind(this)
		});

};

Pinit.prototype.showPin = function(pinId) {
	
	$.ajax({
			type : 'POST',
			url : OC.generateUrl('apps/pinit/showpin'),
			data : {id:pinId},
			success : function(data) {
                 
                 	
                 	$('#pinlistBg').show();
                 	
                 	$("#pinContainerShow").html(data);
                  	
					$('#show-pin .avatarrow').avatar($(this).data('user'), 64);
						
                 var widthShow=$('#show-pin').width();
                
				
				$("#pinContainerShow").show('fast');
	
				$('#showPin-cancel').on('click', function() {
					$('#pinlistBg').hide();
				
					$("#pinContainerShow").hide('fast');
					$("#pinContainerShow").html('');
					if (history && history.replaceState) {
						history.replaceState('', '', '#');
					}
					
					return false;
				});
			}
		});

};

Pinit.prototype.deletePin = function(evt) {
	var pinId = $(evt.target).attr('data-id');
		$("#dialogSmall").text(t('pinit','Delete Pin?'));
    var $this=this;
    
		$("#dialogSmall").dialog({
			resizable : false,
			title : t('pinit', 'Delete Pin'),
			width : 300,
			height : 150,
			modal : true,
			buttons : [{
				text : t('core', 'Delete'),
				'class': 'delButton',
				click : function() {

					var oDialog = $(this);
					
					$.post(OC.generateUrl('apps/pinit/deletepin'), {
						'id' : pinId
					}, function(jsondata) {
						if (jsondata) {
							
							$this.aPinsHtml[jsondata.id] = '';
							$('div[data-id="' + jsondata.id + '"]').remove();
							$this.adjustGrid('.pinrow');
							
							wallId = $('#pinWalls span.pinwall-row.isActiveWall').attr('data-wallid');
							var currentCount = $('#pinWalls .wallcounter[data-counterid="count-' + wallId + '"]').text();
							$('#pinWalls .wallcounter[data-counterid="count-' + wallId + '"]').text((parseInt(currentCount) - 1));
							$this.updateCounterTags();
							
							oDialog.dialog("close");
							
						} else {
							alert(jsondata.data.message);
						}
					});
				}
			}, {
				text : t('core', 'Cancel'),
				click : function() {
					$(this).dialog("close");
				}
			}],
		});

		return false;
};

Pinit.prototype.changePublicPinStatus = function(evt) {
	var pinId = $(evt.target).attr('data-id');

		$.getJSON(OC.generateUrl('apps/pinit/changepinstatus'), {
			id : pinId
		}, function(jsondata) {
			if (jsondata) {
				
				if (jsondata.status == 'locked') {
					this.showMeldung(t('pinit', 'You haven\'t the permission to change the status!'));
				}
				if (jsondata.status == 'open') {
					if (jsondata.isPublic) {
						$('li[data-id="' + pinId + '"].publicStatus').removeClass('icon-lock').addClass('icon-link').attr('title', t('pinit', 'Public Pin'));
					} else {
						$('li[data-id="' + pinId + '"].publicStatus').removeClass('icon-link').addClass('icon-lock').attr('title', t('pinit', 'Private Pin'));
					}

					this.showMeldung(t('pinit', 'Status changed!'));
				}
			}
		}.bind(this));
};

Pinit.prototype.showPinOptions = function(evt) {
	$(evt.currentTarget).find('.pintools').show();
};

Pinit.prototype.hidePinOptions = function(evt) {
	$(evt.currentTarget).children('.pintools').hide();
};

Pinit.prototype.switchToBackSide = function(evt) {
	var Id = $(evt.target).attr('data-id');
	          
		if (!$('div.pinrow[data-id="' + Id + '"]').hasClass('backside')) {
			$('div.pinrow[data-id="' + Id + '"]').addClass('backside');
			$('div.pinrow li.arrowmove[data-id="' + Id + '"]').removeClass('icon-arrowright');
			$('div.pinrow li.arrowmove[data-id="' + Id + '"]').addClass('icon-arrowleft');
			//arrowmove
			$('div.pinrow[data-id="' + Id + '"] .card .face.back').slideDown();

		} else {
			$('div.pinrow[data-id="' + Id + '"]').removeClass('backside');
			$('div.pinrow li.arrowmove[data-id="' + Id + '"]').addClass('icon-arrowright');
			$('div.pinrow li.arrowmove[data-id="' + Id + '"]').removeClass('icon-arrowleft');
			$('div.pinrow[data-id="' + Id + '"] .card .face.back').slideUp();
		}
};

Pinit.prototype.savePinWallOrder = function(wallId, iOrder) {
	
	$.getJSON(OC.generateUrl('apps/pinit/savesortorderpinwall'), {
			wallId : wallId,
			iOrder : iOrder
		}, function(jsondata) {
			if (jsondata) {
				this.showMeldung(t('pinit', 'Sorting saved!'));
			}
		}.bind(this));
		return false;
};

Pinit.prototype.loadGeoLocation = function(location) {
	$.getJSON(OC.generateUrl('apps/pinit/lonlataddresspin'), {
				location : location,
			}, function(jsondata) {
				if (jsondata) {
					var locationInfo=jsondata;
					$('#plon').val(locationInfo.lon);
					$('#plat').val(locationInfo.lat);
					//+' GPS LAT Ref:'+locationInfo.gpslatref+' GPS LAT:'+locationInfo.gpslat+' GPS LON Ref:'+locationInfo.gpslonref+' GPS LON:'+locationInfo.gpslon
					$('#lonlatinfo').text('Lon: '+locationInfo.lon+', Lat: '+locationInfo.lat);
					$('#lonlatinfo').show();
					$('#additMarker').show();
				}
			});
			return false;
};

Pinit.prototype.loadWebsitePreviewImage = function(url) {
	
	if ($('#imgsrc').val() == '') {
			
			var Modus=$('input.websiteInfo:checked').val();
			if(Modus == 'screen'){
				$('#noimage').text(t('pinit', 'Generating Preview Website, please wait ...!')).addClass('icon-loading');
				$('#websiteService').html('This Preview Generating is captured by <a href="http://webthumbnail.org/" target="_blank">http://webthumbnail.org</a>');
			}
			if(Modus == 'meta'){
				$('#noimage').text(t('pinit', 'Searching for Preview Picture of Website, please wait ...!')).addClass('icon-loading');
				$('#websiteService').text('Looking for Description,Media, Title and Picture!');
			}
			if(Modus == 'pic'){
				$('#noimage').text(t('pinit', 'Uploading Image, please wait ...!')).addClass('icon-loading');
				$('#websiteService').text('Looking for Image!');
			}
			//var allowedVideoSites={'muzu.tv':1,'youtube':1,'vimeo':1,'soundcloud':1};
			
			$('#websiteService').show();
			//getwebsiteinfopin
			$.getJSON(OC.generateUrl('apps/pinit/getwebsiteinfopin'), {
				url : encodeURIComponent(url),
				mode:Modus
			}, function(jsondata) {
				if (jsondata) {
					
					 if(Modus == 'meta' && jsondata.metainfo!=''){
							$('#pname').val(jsondata.metainfo['title']);
							$('#pdescr').val(jsondata.metainfo['description']);
							
							if(jsondata.metainfo['video_secure_url']!=''){
								$('#embedSrc').empty();
								$('#media_url').val(jsondata.metainfo['video_secure_url']);
								$('#media_sitename').val(jsondata.metainfo['sitename']);
								$('#media_width').val(jsondata.metainfo['video_width']);
								$('#media_height').val(jsondata.metainfo['video_height']);
								var iframe=$('<iframe>').attr({
									src:jsondata.metainfo['video_secure_url'],
									width:250,
									height:160,
									frameborder:'no',
									});
									$('#embedSrc').append(iframe);
								var checkbox=$('<input/>')
								.attr({
									'type':'checkbox',
									'id':'saveMedia',
									'checked':'checked'
								});
								$('#embedSrc').append(checkbox);
								var span=$('<span/>').text(' Save Media');	
								$('#embedSrc').append(span);
							}
							
					}
					
					if (jsondata.imgdata != '') {
						$('#isphoto').val('1');
						$('#noimage').removeClass('icon-loading');
						$('#websiteService').html('');
						$('#websiteService').hide();

						this.imgSrc = jsondata.imgdata;
						this.imgMimeType = jsondata.mimetype;
						
						$('#imgsrc').val('');
						$('#imgmimetype').val('');

						$('#tmpkey').val(jsondata.tmp);
						$('#noimage').text(t('pinit', 'Drag Image Here!')).removeClass('icon-loading');
						
						this.editPhoto($('#photoId').val(), jsondata.tmp);

					} else {
						 if(Modus == 'screen'){
							$('#noimage').text(t('pinit', 'Generating Preview Website failed! Please try it later again!')).removeClass('icon-loading');
							
						}
						 if(Modus == 'meta' || Modus == 'pic'){
						 	$('#noimage').text(t('pinit', 'No Preview Image found!')).removeClass('icon-loading');
						 }
						 
						 $('#websiteService').html('');
							$('#websiteService').hide();
					}
				} else {
					alert(jsondata.message);
				}
			}.bind(this));
		} else {
			this.showMeldung(t('pinit','Please delete current Image!'));
		}
};

Pinit.prototype.filterPinColor = function(filter) {
	if(this.currentViewMode == 0){
		if (filter != 'all') {
			if ($('#pinlist .pinrow.' + filter).length > 0) {
				$('#pinlist .pinrow').hide();
				$('#pinlist .pinrow.' + filter).show();
			}
			this.adjustGrid('.pinrow.'+filter);
		} else {
			if (filter == 'all') {
				$('#pinlist .pinrow').show();
			}
			 $('#app-content').scrollTo(0);
			this.adjustGrid('.pinrow');
		}
		
		}
};

Pinit.prototype.DragElement = function(evt) {
	return $(this).clone().text($(this).attr('data-title'));
};

Pinit.prototype.movePin = function(wallId, pinId, oldwallId) {
	
	$.getJSON(OC.generateUrl('apps/pinit/movepin'), {
			wall_id : wallId,
			wall_old_id : oldwallId,
			pin_id : pinId
		}, function(jsondata) {
			if (jsondata.msglevel=='success') {
				var data = jsondata;
				
                $('div.pinrow[data-id="' + pinId + '"]').remove();
                this.adjustGrid('.pinrow');
				var currentCount = $('#pinWalls .wallcounter[data-counterid="count-' + oldwallId + '"]').text();
				$('#pinWalls .wallcounter[data-counterid="count-' + oldwallId + '"]').text((parseInt(currentCount) - 1));

				var newCount = $('#pinWalls .wallcounter[data-counterid="count-' + wallId + '"]').text();
				$('#pinWalls .wallcounter[data-counterid="count-' + wallId + '"]').text((parseInt(newCount) + 1));

				this.showMeldung(t('pinit', 'Pin moved!'));
			}
			if (jsondata.msglevel=='error') {
				this.showMeldung(jsondata.message);
			}
		}.bind(this));
};

Pinit.prototype.getPinWalls = function() {
	
	$.getJSON(OC.generateUrl('apps/pinit/pinwalls'), function(jsondata) {
			if (jsondata) {
				var data = jsondata;

				$.each(data, function(i, el) {

					this.aPinWalls[i] = this.loadPinWallRow(el);

				}.bind(this));

				$('#pinWalls').append(this.aPinWalls);

				if (this.firstLoading == true) {
					$("#pinWalls").sortable({
						items : "li",
						axis : "y",
						tolerance: "pointer",
						distance: 10,
						stop : function(evt, ui) {
							this.savePinWallOrder(ui.item.attr('data-wallmainid'), ui.item.index());
						}.bind(this)
					});

					this.getPins();
				}

			}
		}.bind(this));
};

Pinit.prototype.loadPinWallRow = function(element) {
	
	var $this=this;
	
	var li = $('<li/>').attr({
			'data-wallmainid' : element.id,
			'class' : 'dropcontainer'
		}).droppable({
			activeClass : "activeHover",
			hoverClass : "dropHover",
			accept : 'div.pinrow .pinrow-dragger',
			over : function(event, ui) {
			},
			drop : function(event, ui) {
				if (ui.draggable.attr('data-wallid') != $(this).attr('data-wallmainid')) {
					
					$this.movePin($(this).attr('data-wallmainid'), ui.draggable.attr('data-id'), ui.draggable.attr('data-wallid'));
				}
			}
		});
		var Shared = '';

		if (OC.currentUser != element.user_id) {
			var ShareUser = element.user_id;
			if (element.user_displayname != undefined) {
				ShareUser = element.user_displayname;
			}
			Shared = ' (' + t('pinit', 'Shared by ') + ShareUser + ')';
		}

		var span = $('<span/>').attr({
			'data-wallid' : element.id,
			'data-permissions' : element.permissions,
			'data-wallpaper' : element.wallbg,
			'class' : 'pinwall-row',
			'title' : element.displayname + Shared
		}).text(element.displayname + Shared).on('click', this.getPins.bind(this));
		li.append(span);

		if (element.permissions & OC.PERMISSION_SHARE) {
			var aShare = '<a href="#" class="share icon-share" data-title="Share Pinwall" data-item-type="pinwall" data-item="' + element.id + '" data-link="true"' + 'data-possible-permissions="' + element.permissions + '" data-eventname="Pinnwall"' + 'title="Share Pinwall"></a>';

			li.append($(aShare));
		}
           
		if (OC.currentUser == element.user_id) {
              
			var aEdit = $('<a/>').attr({
				'class' : 'icon-rename',
				'data-item-wallid' : element.id,
				'data-wallpaper' : element.wallbg,
				'data-name' : element.displayname,
				'title' : 'Edit Pinwall'
			}).on('click', this.editPinWall.bind(this));
			li.append(aEdit);
		}
		var CountPins = element.countPins;
		if (element.countPins == undefined) {
			CountPins = 0;
		}
		var sCount = $('<span/>').attr({
			'data-counterid' : 'count-' + element.id,
			'class' : 'wallcounter'
		}).text(CountPins);
		li.append(sCount);
		return li;
};

Pinit.prototype.adjustGrid = function(filter) {
	 var options ={
			srcNode: filter, // grid items (class, node)
			margin: '15px', // margin in pixel, default: 0px
			width: this.columnWidth+'px', // grid item width in pixel, default: 220px
			resizable: false, // re-layout if window resize
			transition: 'all 0.5s ease', // support transition for CSS3, default: all 0.5s ease
			};
			
			$('#pinlist').gridify(options);
};

Pinit.prototype.initPinsList = function(Timer) {
	   
	    this.latestPinIndex=0;
	    if(this.aPinsHtml.length> 0){
	    	this.loadRowPins();
	    }else{
	    	var span=$('<span/>').attr('class','no-pins').text(t('pinit','No Pins found! Add a (+ Pin) to your pinwall!'));
	    	 $('#pinlist').append(span);
	    }
        
         $('#pinlist').removeClass('icon-loading').css({'width':'auto','height':'auto'});
      

		$('#pinlist .avatarrow').each(function() {
			var element = $(this);
			element.avatar(element.data('user'), 64);
		});

		
};

Pinit.prototype.initMapList = function() {
	var attribution = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
	    if( this.mapObject == null){
		   this.mapObject = L.map('map').setView([51.505, -0.09], 2);
				L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
			    attribution:attribution,
			    maxZoom: 18,
			    subdomains : "1234"
		   }).addTo(this.mapObject);
		   
	      $('#mapPreview .previewNext').on('click',function(){
	       	   	this.nextPagePreview();
	       }.bind(this));
	       $('#mapPreview .previewPrevious').on('click',function(){
	       	   	this.previousPagePreview();
	       }.bind(this));
	       
	  }else{
	  	  this.mapObject.setView([51.505, -0.09], 2);
	  }
	  
	  
	 // this.layerMarker = L.layerGroup();
	 this.layerMarker = L.markerClusterGroup();
	    //showMapPin
	   var mapPreviewPins= [];
	   $('#mappinsInner').empty();
	   var counter=0;
	
	   $.each(this.aPinsMap,function(i,element){
	   	      var redMarker = L.AwesomeMarkers.icon({
				    icon: element.icon,
				    markerColor: element.markercolor
				  });
				 var popupContent='<span class="pinmap-title">'+element.title+'</span>'; 
				    
				      if(element.image!=''){
	   	               popupContent+='<br /><span class="pinmap-image"><img height="150" src="data:' + element.imageMimeType + ';base64,' + element.image+'"  /></span>';
	   	                 
	   	              }
	   	               popupContent+='<br /><span class="pinmap-link"><a href="#'+element.id+'">Details</a></span>';
				   	    this.mapObjectMarker[i] = L.pinMarker([element.lat, element.lon],{'title':element.title,pinId:element.id,icon:redMarker}).bindPopup(popupContent);
			            this.layerMarker.addLayer( this.mapObjectMarker[i]);
                      mapPreviewPins[counter] = element;
             counter++;
	   	   
	   }.bind(this));
	        
	        mapPreviewPins.reverse();
	        
	        $.each(mapPreviewPins,function(i,element){
	        	
	        	  if(element.image!=''){
	   	                
	   	                var divImg=$('<div/>').attr({
	   	                	'class':'mapDescr mapImg',
	   	                	'data-index':i,
	   	                	'title':element.title
	   	                })
	   	                .on('click',function(){
	   	                	this.showMapPin(element.lat,element.lon,16, this.mapObjectMarker[element.id]);
	   	                }.bind(this));
	   	                
	   	                var ImgMap=$('<img/>').attr({
	   	                	'height':80,
	   	                	'src':'data:' + element.imageMimeType + ';base64,' + element.image,
	   	                	'class':'mapPics'
	   	                });
	   	                divImg.append(ImgMap);
	   	                  $('#mappinsInner').append(divImg); 
	   	              }else{
	   	              	 var divtitle=$('<div/>').attr({
	   	                	'class':'mapDescr mapTitle',
	   	                	'data-index':i
	   	                }).on('click',function(){
	   	                	this.showMapPin(element.lat,element.lon,16, this.mapObjectMarker[element.id]);
	   	                }.bind(this));
	   	                
	   	              	var descrMapPin=$('<div/>').attr({
	   	              		'class':'mapTitleInner',
	   	              		'data-index':counter,
	   	              		'title':element.title
	   	              	})
	   	              	.css({
	   	              		'background-color':element.backgroundColor,
	   	              		'color':element.titlecolor
	   	              	})
	   	              	.text(element.title);
	   	              	divtitle.append(descrMapPin);
	   	              	$('#mappinsInner').append(divtitle);
	   	                
	   	              }
	        }.bind(this));
	        
	      //  $('#mappinsInner').append(mapPreviewPins);
	       
	        var Sides=($('#mappinsInner .mapDescr').length / this.calcMaxMarkerPerPage);
	       $('#mappins').width(this.calcMaxMarkerPerPage * 134);
	       $('#mappinsInner').width(this.calcMaxMarkerPerPage * 134 * (Sides + 1));
	       this.scrollToPreview(0);
	       
	       
	       
	           this.mapObject.addLayer(this.layerMarker);
               L.edgeMarker({'radius':20}).addTo(this.mapObject);
};

Pinit.prototype.nextPagePreview = function() {
	var mapPinsCount =$('#mappinsInner .mapDescr').length;
   

	if (mapPinsCount > this.currentMomIndex) {
		this.currentMomIndex +=  this.calcMaxMarkerPerPage ;
		if (mapPinsCount < this.currentMomIndex) {
			this.currentMomIndex-=this.calcMaxMarkerPerPage;
		}
	}
  
	this.scrollToPreview(this.currentMomIndex);

};

Pinit.prototype.previousPagePreview = function() {

	if (this.currentMomIndex > 0) {
		this.currentMomIndex -= this.calcMaxMarkerPerPage;
		if(this.currentMomIndex < 0){
			this.currentMomIndex=0;
		} 
	}
  
	this.scrollToPreview(this.currentMomIndex);

};

Pinit.prototype.scrollToPreview = function(index) {
	
		$('#mappins').scrollTo($('.mapDescr[data-index=' + index + ']'), 800);
	

};

Pinit.prototype.loadRowPins = function() {
	
	 var scroll = $('#app-content').scrollTop() + $(window).scrollTop();
	 if(scroll == 0) {
	 	scroll=$(window).height();
	 }
	 var targetHeight = ($(window).height()) + scroll;
	 
	var count=(this.latestPinIndex + this.PinMaxLoadonStart);
	if(this.aPinsHtml.length < count){
		count = this.aPinsHtml.length;
	}
		
	if(this.aPinsHtml.length > this.latestPinIndex && $('#pinlist').height() < targetHeight){
		this.PinMaxLoadonStart=this.maxImagesPerRow;
		
		var biggestHeight=0;
	    var i=this.latestPinIndex;
	     
	    for(i; i< count; i++){
			var pinRow=this.loadPinRow(this.aPinsHtml[i]);
			 $('#pinlist').append(pinRow);
			 if(pinRow.height() > biggestHeight){
	    		biggestHeight=pinRow.height();
	    	}
			
		}
		
		this.latestPinIndex=i;
		this.adjustGrid('.pinrow');
		this.updateCounterTags();
		if(this.aPinsHtml.length > count){
		   
			$('#pinlist').height(biggestHeight+$('#pinlist').height());
			this.loadRowPins();
		}else{
			this.showMeldung('all Pins loaded');
			return false;
		}
		
		
	}else{
		//this.showMeldung('all Pins loaded');
		return false;
	}
	//alert(this.latestPinIndex);
};

Pinit.prototype.getPins = function(evt) {
	var wallId = 0;
		$('#pinWalls li .pinwall-row').removeClass('isActiveWall');

		if (evt != undefined) {
			wallId = $(evt.target).attr('data-wallid');
			$(evt.target).addClass('isActiveWall');
			this.currentPinWall = wallId;
		} else {
			if (this.currentPinWall > 0) {
				wallId = this.currentPinWall;
				$('#pinWalls li .pinwall-row').removeClass('isActiveWall');
				$('#pinWalls li .pinwall-row[data-wallid="' + wallId + '"]').addClass('isActiveWall');
			} else {
				wallId = $('#pinWalls li:first-child span.pinwall-row').attr('data-wallid');
				$('#pinWalls li:first-child span.pinwall-row').addClass('isActiveWall');
				this.currentPinWall = wallId;
			}
		}
		
        
		
        if(this.firstLoading == false){
        	this.aPinsMap = null;
		    this.aPinsMap = {};
		   
		    this.aPinsHtml = null;
		    this.aPinsHtml = [];
		    $('#tagsFilter').tagit('reset');
			$('#pinlist').empty();
		}
		
		$('#pinlist').addClass('icon-loading').css({'width':'100%','height':'50%'});
		
		
      
		var PermissionsCreate = $('#pinWalls li span[data-wallid="' + wallId + '"]').attr('data-permissions');

		if (PermissionsCreate & OC.PERMISSION_CREATE) {
			$('#addPin').show();
		} else {
			$('#addPin').hide();
		}
		var Wallpaper = $('#pinWalls li span[data-wallid="' + wallId + '"]').attr('data-wallpaper');
		if (Wallpaper != '') {
			$('#app-content').css('background', 'url(' + OC.imagePath('pinit', 'bg/' + Wallpaper) + ') repeat');
		} else {
			$('#app-content').css('background', '');
		}
      $.getJSON(OC.generateUrl('apps/pinit/pins'), {
			wallId : wallId,
		}, function(jsondata) {
			if (jsondata) {
				
				var data = jsondata;
                 this.calcDimensionPins();
				$.each(data, function(i, el) {
					this.aPinsHtml[i] = el;
                   if(el.lon!='' && el.lat!=''){
                     	this.aPinsMap[el.id] = el;
                    }
				}.bind(this));
				
	           
				if (this.firstLoading) {
					this.checkShowEventHash();
					this.firstLoading = false;
				} 
				if(this.currentViewMode==0){
					this.initPinsList(500);
				}
				if(this.currentViewMode==1){
					this.mapObject.removeLayer(this.layerMarker);
					this.initMapList();
				}

			}
		}.bind(this));
};

Pinit.prototype.filterTagsChanged = function(evt) {
	if (this.firstLoading == false && this.currentViewMode==0) {

			if ($('#tagsFilter').tagit('tags').length > 0) {
				var filterArray = $('#tagsFilter').tagit('tags');
				$('#pinlist .pinrow').hide();
                $('#pinlist .pinrow').removeClass('activeFilter');
				$('.pinrow').each(function() {
					var element = $(this);
					var filterCounter = 0;
					$(filterArray).each(function(i, filter) {
						if (element.find('.pin-tag[data-tag="' + $.trim(filter.value) + '"]').length > 0) {
							filterCounter++;
						}
					});

					if (filterCounter == filterArray.length) {
						element.addClass('activeFilter');
						
						
					}
				});
				 $('#app-content').scrollTo(0);
				$('#pinlist .pinrow.activeFilter').show();
			   this.adjustGrid('.pinrow.activeFilter');
			  
			}

			if ($('#tagsFilter').tagit('tags').length == 0 && $('#pinlist .pinrow.activeFilter').length > 0) {
				$('#pinlist .pinrow').removeClass('activeFilter');
				$('#pinlist .pinrow').show();
				this.adjustGrid('.pinrow');
				
			}
		}
};

Pinit.prototype.initTagsList = function() {
	var liTags = [];
		$('#myTagList').empty();
		var $this=this;
		
		$(this.tagslist).each(function(i, el) {

			var li = $('<li/>').attr({
				'class' : 'tag-list-row'
			}).css({
				'background-color' : el.bgcolor,
				'color' : el.color
			});
			var span = $('<span/>').attr({
				'class' : 'tagname',
				'data-tag' : el.name
			}).text(el.name).on('click', function() {
				if($this.currentViewMode == 0){
					var counter = parseInt($(this).next('span.tagCount').text());
					if (counter > 0) {
						$('#tagsFilter').tagit('add', {
							label : $(this).attr('data-tag'),
							value : $(this).attr('data-tag')
						});
					}
				}
			});
			li.append(span);
			var spanCounter = $('<span/>').attr({
				'class' : 'tagCount'
			}).text('0');
			li.append(spanCounter);
			var spanDelete = $('<span/>').attr({
				'class' : 'icon-close',
				'data-tag' : el.name
			}).on('click', this.deleteTag.bind(this));
			li.append(spanDelete);
			liTags[i] = li;

		}.bind(this));
		$('#myTagList').append(liTags);
};

Pinit.prototype.updateCounterTags = function() {
	$('.tag-list-row .tagname').each(function() {
			var countTags = $('.pinrow .pin-tag[data-tag="' + $.trim($(this).attr('data-tag')) + '"]').length;
			// $(this).parent().hide();
			if (countTags > 0) {
				$(this).next('span.tagCount').text(countTags);
				//	$(this).parent().show();
			}else{
				$(this).next('span.tagCount').text('0');
			}
		});
};

Pinit.prototype.loadPinRow = function(element) {
	var filterDescr = 'none';
	
		if (element.pincolor != '') {
			filterDescr = element.pincolor;
		}

		var div = $('<div/>').attr({
			'data-id' : element.id,
			'class' : 'pinrow ' + filterDescr
		}).on('mouseenter', this.showPinOptions).on('mouseleave', this.hidePinOptions);
      
		div.css({
			'width' : (this.columnWidth) + 'px',
			'min-width' : (this.columnWidth) + 'px',
			'max-width' : (this.columnWidth) + 'px'
		});
		
		var divCard = $('<div/>').attr({
			'class' : 'card shadow'
		});
		div.append(divCard);
		var divFront = $('<div/>').attr({
			'class' : 'front face'
		});
		divCard.append(divFront);

		if (element.pincolor != '') {

			var divPinColor = $('<div/>').attr({
				'class' : 'pinstick'
			}).css('background', 'url(' + OC.imagePath('pinit', 'pins/' + element.pincolor + '.png') + ') no-repeat center');
			div.append(divPinColor);
		}
		
		if(element.newpin == 1){
      		var divPinNew = $('<div/>').attr({
				'class' : 'pinnew'
			}).css('background', 'url(' + OC.imagePath('pinit', 'new-red.png') + ') no-repeat center');
			div.append(divPinNew);
		}
			
		if (element.lon != '') {
          
			var divPinMarker = $('<div/>').attr({
				'class' : 'pinmarker'
			}).css('background', 'url(' + OC.imagePath('pinit', 'marker.png') + ') no-repeat center');
			div.append(divPinMarker);
		}
		
		if (element.image != '') {
			var imgWidth=(element.imageWidth - 4);
			var imgHeight=(element.imageHeight - 4);
			
			if(element.imageWidth > element.imageHeight || element.imageWidth >= this.columnWidth){
			   var ratio=(imgWidth/this.columnWidth);
			   ratio = Math.round(ratio * 100) / 100;
			   imgWidth=(imgWidth/ratio);
			   imgHeight=(imgHeight/ratio);
			  
			}else{
				//marginLeft=(this.columnWidth-imgWidth)/2;
				
			}
			
			var divA=$('<a/>')
			.attr({
				'class':'icon-loading img-div',
				'href':'#'+element.id,
				})
			.css({'display':'inline-block','width':(imgWidth-4)+'px','height':+(imgHeight-4)+'px','text-align':'center'});
			
			divFront.append(divA);
			
			
			var img = new Image();
			 $(img).hide();
			 $(img).load(function(){
			 	divA.removeClass('icon-loading');
			 	$(this).fadeIn(800);
			 	 $(img).width=imgWidth;
			 	 $(img).height=imgHeight;
			 	divA.css({'width':'auto','height':'auto'});
			 	
			 })
			.css({
				'max-width' : (this.columnWidth-4) + 'px',
				'width':(imgWidth-4)+'px',
			}).attr({
				'src' : 'data:' + element.imageMimeType + ';base64,' + element.image,
				'data-id' : element.id,
				'class' : 'pinimage',
				'width':imgWidth
			});
			divA.append(img);
			if (element.media_url != '') {
		 			var divPinMedia = $('<div/>').attr({
						'class' : 'pinmedia'
					}).css({
						'background': 'url(' + OC.imagePath('pinit', 'play.png') + ') no-repeat center',
						'left':((imgWidth / 2) -28)+'px',
						'top':((imgHeight / 2) -24)+'px',
						});
					divA.append(divPinMedia);
		   		}
		} else {
             var textShadow='1px 1px #000';
             if(element.titlecolor == '#000000'){
             	textShadow='1px 1px #FAFAFA';
             }
			var span0 = $('<a/>').css({
				'color' : element.titlecolor,
				'background-color' : element.backgroundColor,
				'width' : (this.columnWidth - 4) + 'px',
				'text-shadow':textShadow
			}).attr({
				'data-id' : element.id,
				'class' : 'pinrow-noimage',
				'href':'#'+element.id
			}).text(element.title);
			divFront.append(span0);
		}

		//Edit Options
		var ul = $('<ul>').attr('class', 'pintools');
		div.append(ul);
		

		var liDragger = $('<li>').attr({
			'data-id' : element.id,
			'data-wallid' : element.wall_id,
			'data-title' : element.title,
			'class' : 'svg icon-move pinrow-dragger toolTip',
			title : t('pinit', 'Drag Pin ')
		}).draggable({
			appendTo : "body",
			helper : this.DragElement,
			cursor : "move",
			delay : 500,
			start : function(event, ui) {
				ui.helper.addClass('draggingPin');
			}
		});
		ul.append(liDragger);
		/*
        var liBig = $('<li/>');
        var aBig = $('<a/>').attr({
			'class' : 'svg icon-details toolTip',
			'title' : t('pinit', 'Show Details'),
			'href': '#' +element.id
		});
		liBig.append(aBig);
		ul.append(liBig);
	
		var liReverse = $('<li/>').attr({
			'data-id' : element.id,
			'class' : 'svg icon-arrowright arrowmove toolTip',
			'title' : t('pinit', 'More info')
		}).on('click', this.switchToBackSide);
		ul.append(liReverse);
		*/
        var publicClass = 'icon-link';
		var publicTitle = t('pinit', 'Public Pin');
		if (element.isPublic == 0) {
			publicClass = 'icon-lock';
			publicTitle = t('pinit', 'Private Pin');
		}
		var li = $('<li/>').attr({
			'data-id' : element.id,
			'class' : publicClass + ' svg publicStatus toolTip',
			title : publicTitle
		}).on('click', this.changePublicPinStatus.bind(this));
		ul.append(li);

		if (element.permissions & OC.PERMISSION_UPDATE) {
			var li = $('<li/>').attr({
				'data-id' : element.id,
				'class' : 'svg icon-rename toolTip',
				'title' : t('pinit', 'Edit Pin')
			}).on('click', this.editPin.bind(this));
			ul.append(li);
		}
		if (element.permissions & OC.PERMISSION_DELETE) {
			var li1 = $('<li/>').attr({
				'data-id' : element.id,
				'class' : 'svg icon-delete toolTip',
				'title' : t('pinit', 'Delete Pin')
			}).on('click', this.deletePin.bind(this));
			ul.append(li1);
		}

		if (element.categories != '') {
			//var tagsPin = element.categories.split(',');
			var aTag = [];
			$(element.categories).each(function(i, el) {
				aTag[i] = $('<a/>').attr({
					'class' : 'pin-tag',
					'data-pinid' : element.id,
					'data-tag' : $.trim(el.name)
				}).css({
					'background-color' : el.bgcolor,
					'color' : el.color
				}).text(el.name);
			});
			var divAllTags = $('<span/>').attr({
				'class' : 'pin-tags-all'
			});
			divAllTags.append(aTag);
			divFront.append(divAllTags);
		}
		
		if (element.url != '' && element.image != '') {
			var span22 = $('<span/>').addClass('pinrow-url-domain').text(t('pinit', 'At')+' ' + element.domain+' '+t('pinit', 'found'));
			divFront.append(span22);
			var span2 = $('<span/>').addClass('pinrow-url-title');
			var aUrl=$('<a/>').attr({
				'class':'toolTip icon-link',
				'href':element.url,
				'title':element.url,
				'target':'_blank', 
			}).text(element.title);
			span2.append(aUrl);
			divFront.append(span2);
		}
		if (element.url != '' && element.image == '') {
			var span23 = $('<span/>').addClass('pinrow-url-domain').text(t('pinit', 'At')+' ' + element.domain+' '+t('pinit', 'found'));
			divFront.append(span23);
			var span2 = $('<span/>').addClass('pinrow-url');
			var aUrl=$('<a/>').attr({
				'class':'toolTip icon-link',
				'href':element.url,
				'title':element.url,
				'target':'_blank', 
			}).text(element.title);
			span2.append(aUrl);
			divFront.append(span2);
		}
		
		if (element.url == '' && element.image != '') {
			var span22 = $('<span/>').addClass('pinrow-url-domain').text(t('pinit', 'Uploaded of')+' ' +  element.userdisplayname);
			divFront.append(span22);
			var span21 = $('<span/>').addClass('pinrow-url-title').text(element.title);
			divFront.append(span21);
		}
		if (element.url == '' && element.image == '') {
			var span22 = $('<span/>').addClass('pinrow-url-domain').text(t('pinit', 'Published of')+' ' +element.userdisplayname);
			divFront.append(span22);
		}
		
	    /*
		var divBack = $('<div/>').attr({
			'data-id' : element.id,
			'class' : 'back face'
		}).on('click', this.switchToBackSide);
		divCard.append(divBack);
		var br1 = $('<br/>');
		divBack.append(br1);
		var spanBack0 = $('<span/>').addClass('pinrow-back-title').text(element.title);
		divBack.append(spanBack0);
		if (element.description != '') {
			var spanBack1 = $('<span/>').addClass('pinrow-descr').text(element.description);
			divBack.append(spanBack1);
		}

		var spanBack2 = $('<span/>').addClass('pinrow-added').text(t('pinit', 'Added: ') + relative_modified_date(element.addDate));
		divBack.append(spanBack2);
		var spanBack3 = $('<span/>').addClass('pinrow-mod').text(t('pinit', 'Modified: ') + relative_modified_date(element.modifiedDate));
		divBack.append(spanBack3);
		
		var spanBack4 = $('<span/>').addClass('pinrow-autor').html('<div style="height: 32px; width: 32px;" class="avatarrow" data-user="' + element.user_id + '"></div><div class="autor"><b>' + element.userdisplayname + '</b><br/>'+t('pinit', 'Autor')+'</div>');
		divBack.append(spanBack4);
		if (element.location != '') {
			//	locationInfo = '<img class="map toolTip" id="geoloc" title="'+element.location+'"  src="http://maps.google.com/maps/api/staticmap?zoom=15&size='+(this.columnWidth - 6)+'x200&maptype=terrain&sensor=false&center=' + element.location + '" />';
				var spanBack5 = $('<span/>').addClass('pinrow-map').text(element.location);
				divBack.append(spanBack5);
			}
		
      // $('#pinlist').append(div);*/
		return div;
};
Pinit.prototype.loadWallBg = function() {
	$.getJSON(OC.generateUrl('apps/pinit/getpinwallbg'),
		 function(jsondata) {
			if (jsondata) {
				this.aPinWallBackgrounds = jsondata;
				
				
				
			}
		}.bind(this));
};

Pinit.prototype.loadTags = function() {
	$.getJSON(OC.generateUrl('apps/pinit/loadtags'),
		 function(jsondata) {
			if (jsondata) {
				this.categories = jsondata.categories;
				this.tagslist = jsondata.tagslist;
				this.initTagsList();
				this.updateCounterTags();
				
			}
		}.bind(this));
};

Pinit.prototype.newTag = function() {
	var stringTag = '';
		var objTags = $('#newTag').tagit('tags');
		$(objTags).each(function(i, el) {
			if (stringTag == '') {
				stringTag = el.value;
			} else {
				stringTag += ',' + el.value;
			}
		});

		if (stringTag != '') {
			$.getJSON(OC.generateUrl('apps/pinit/addtag'), {
				'tag' : stringTag
			}, function(jsondata) {
				if (jsondata) {
					//categories,tagslist
					$('#newTag').tagit('reset');
					this.categories = jsondata.categories;
					this.tagslist = jsondata.tagslist;
					this.initTagsList();
					this.updateCounterTags();
				}
			}.bind(this));
		}
};

Pinit.prototype.deleteTag = function(evt) {
	var TagToDelete = $(evt.target).attr('data-tag');

		$("#dialogSmall").text('Delete Tag?');
        var $this=this;
		$("#dialogSmall").dialog({
			resizable : false,
			title : t('pinit', 'Delete Tag'),
			width : 300,
			height : 150,
			modal : true,
			buttons : [{
				text : t('core', 'Delete'),
				click : function() {

					var oDialog = $(this);
					$.getJSON(OC.generateUrl('apps/pinit/deletetag'), {
						'tag' : TagToDelete
					}, function(jsondata) {
						if (jsondata) {
							oDialog.dialog("close");
							$this.categories = jsondata.categories;
							$this.tagslist = jsondata.tagslist;
							$this.initTagsList();
							$this.updateCounterTags();

						} else {
							alert(jsondata.message);
						}
					});
				}
			}, {
				text : t('core', 'Cancel'),
				click : function() {
					$(this).dialog("close");
				}
			}],
		});

		return false;

};

Pinit.prototype.loadPhoto = function() {
	var refreshstr = '&refresh=' + Math.random();
		$('#phototools li a').tipsy('hide');
		$('#pin_details_photo').remove();

		var ImgSrc = '';
		if (this.imgSrc != false) {
			ImgSrc = this.imgSrc;
		}
		
		var newImg = $('<img>').attr('id', 'pin_details_photo').css({'width':'250px'}).attr('src', 'data:' + this.imgMimeType + ';base64,' + ImgSrc);
		newImg.prependTo($(' #pinPhoto'));

		$('#noimage').remove();

		$('#pinContainer').removeClass('forceOpen');
};

Pinit.prototype.deletePhoto = function() {
	
	if($('#edit-pin').length > 0){
		$.getJSON(OC.generateUrl('apps/pinit/deletephotopin'), {
				'id' : $('#edit-pin').attr('data-id')
			}, function(jsondata) {
				if (jsondata) {
					
					$('#isphoto').val('0');
					this.imgSrc = false;
					$('#pin_details_photo').remove();
					$('<div/>').attr('id', 'noimage').text(t('pinit', 'Drag Image Here!')).prependTo($(' #pinPhoto'));
					$('#imgsrc').val('');
					this.loadPhotoHandlers();
				}
			}.bind(this));
	}
	
	if($('#new-pin').length > 0){
		
		$('#isphoto').val('0');
		this.imgSrc = false;
		$('#pin_details_photo').remove();
		$('<div/>').attr('id', 'noimage').text(t('pinit', 'Drag Image Here!')).prependTo($(' #pinPhoto'));
		$('#imgsrc').val('');
		this.loadPhotoHandlers();
	}
};

Pinit.prototype.loadActionPhotoHandlers= function() {
	   var phototools = $('#phototools');
	   
	   phototools.find('.delete').click(function(evt) {
				$(this).tipsy('hide');
				$('#pinContainer').addClass('forceOpen');
				this.deletePhoto();
				$(this).hide();
			}.bind(this));

			phototools.find('.edit').click(function() {
				$(this).tipsy('hide');
				$('#pinContainer').addClass('forceOpen');
				this.editCurrentPhoto();
			}.bind(this));
			
		phototools.find('.upload').click(function() {
			$(this).tipsy('hide');
			$('#pinContainer').addClass('forceOpen');
			$('#pinphoto_fileupload').trigger('click');
		});

		phototools.find('.cloud').click(function() {
			$(this).tipsy('hide');
			$('#pinContainer').addClass('forceOpen');
			var mimeparts = ['image/jpeg', 'httpd/unix-directory'];
			OC.dialogs.filepicker(t('pinit', 'Select photo'), this.cloudPhotoSelected.bind(this));
		}.bind(this));
			
};

Pinit.prototype.loadPhotoHandlers = function() {
	var phototools = $('#phototools');
		phototools.find('li a').tipsy('hide');
		phototools.find('li a').tipsy();
			if ($('#isphoto').val() === '1') {
			phototools.find('.delete').show();
			phototools.find('.edit').show();
		} else {
			phototools.find('.delete').hide();
			phototools.find('.edit').hide();
		}

		phototools.find('.upload').show();
		phototools.find('.cloud').show();

};

Pinit.prototype.setMetaInfo = function(metaInfo) {
	if(metaInfo['title']!=''){
			$('#pname').val(metaInfo['title']);
		}
		if(metaInfo['description']!=''){
			$('#pdescr').val(metaInfo['description']);
		}
		var sLocation='';
		
		if(metaInfo['location']!=''){
			
			sLocation+=metaInfo['location'];
		}
		if(metaInfo['city']!=''){
			sLocation+=','+metaInfo['city'];
		}
		if(metaInfo['country']!=''){
			sLocation+=','+metaInfo['country'];
		}
		if(sLocation!=''){
			$('#plocation').val(sLocation);
		}
		if(metaInfo['latitude']!=''){
			$('#plat').val(metaInfo['latitude']);
			$('#plon').val(metaInfo['longitude']);
			
            $('#lonlatinfo').text('Lat: '+metaInfo['latitude']+', Lon: '+metaInfo['longitude']);
            $('#lonlatinfo').show();
            $('#additMarker').show();
               
		}
};

Pinit.prototype.cloudPhotoSelected = function(path) {
	$.getJSON(OC.generateUrl('apps/pinit/getimagefromcloud'), {
			'path' : path,
			'id' : $('#photoId').val()
		}, function(jsondata) {
			if (jsondata) {
				//alert(jsondata.data.page);
				this.setMetaInfo(jsondata);
				this.editPhoto(jsondata.id, jsondata.tmp);
				$('#tmpkey').val(jsondata.tmp);
				this.imgSrc = jsondata.imgdata;
				this.imgMimeType = jsondata.mimetype;

				$('#imgsrc').val(this.imgSrc);
				$('#imgmimetype').val(this.imgMimeType);
				$('#edit_photo_dialog_img').html(jsondata.page);
			} else {
				OC.dialogs.alert(jsondata.message, t('pinit', 'Error'));
			}
		}.bind(this));
};

Pinit.prototype.editCurrentPhoto = function() {
	this.editPhoto($('#photoId').val(), $('#tmpkey').val());
};


Pinit.prototype.showCoords= function (c) {
		$('#cropform input#x1').val(c.x);
		$('#cropform input#y1').val(c.y);
		$('#cropform input#x2').val(c.x2);
		$('#cropform input#y2').val(c.y2);
		$('#cropform input#w').val(c.w);
		$('#cropform input#h').val(c.h);
};



Pinit.prototype.editPhoto = function(id, tmpkey) {
	 $.ajax({
			type : 'POST',
			url : OC.generateUrl('apps/pinit/cropphoto'),
			data : {
				'tmpkey' : tmpkey,
				'id' : id,
			},
			success : function(data) {
				 $('#edit_photo_dialog_img').html(data);
				$('#cropbox').attr('src', 'data:' + this.imgMimeType + ';base64,' + this.imgSrc);
                //TODO SHOWCOORDS
                
				$('#cropbox').Jcrop({
					onChange : this.showCoords,
					onSelect : this.showCoords,
					minSize : [230, 140],
					maxSize : [500, 500],
					bgColor : 'black',
					bgOpacity : .4,
					boxWidth : 500,
					boxHeight : 500,
					setSelect : [100, 130, 50, 50]//,
					//aspectRatio: 0.8
				});
			}.bind(this)
			});
		
		if ($('#edit_photo_dialog').dialog('isOpen') == true) {
			$('#edit_photo_dialog').dialog('moveToTop');
		} else {
			$('#edit_photo_dialog').dialog('open');
		}
};

Pinit.prototype.savePhoto = function() {
	var target = $('#crop_target');
		var form = $('#cropform');
		var wrapper = $('#pin_details_photo_wrapper');
		var self = this;
		wrapper.addClass('wait');
		form.submit();
		target.load(function() {
            $('#noimage').text(t('pinit', 'Picture generating, wait ...')).addClass('icon-loading');
			var response = jQuery.parseJSON(target.contents().text());
			if (response != undefined) {
				$('#isphoto').val('1');

				this.imgSrc = response.dataimg;
				this.imgMimeType = response.mimetype;
				 $('#noimage').text('').removeClass('icon-loading');
				$('#imgsrc').val(this.imgSrc);
				$('#imgmimetype').val(this.imgMimeType);
				this.loadPhoto();
				this.loadPhotoHandlers();

			} else {
				OC.dialogs.alert(response.message, t('pinit', 'Error'));
				wrapper.removeClass('wait');
			}
		}.bind(this));
};

Pinit.prototype.SubmitForm = function(VALUE, FormId, UPDATEAREA,PINID) {
	actionFile = 'newpinsave';
		if (VALUE == 'new-pin') {
			actionFile = 'newpinsave';
		}
		if (VALUE == 'edit-pin') {
			actionFile = 'editpinsave';
		}
       
		$(FormId + ' input[name="hiddenfield"]').attr('value', VALUE);
		$(FormId + ' input[name="id"]').attr('value', PINID);
		$(FormId + ' input[name="wall_id"]').attr('value', this.currentPinWall);
		$.ajax({
			type : 'POST',
			url : OC.generateUrl('apps/pinit/'+actionFile),
			data :$(FormId).serialize(),
			success : function(data) {
				var newpin = data;
				if (VALUE == 'new-pin') {
					var newCountIndex=(this.aPinsHtml.length);
					this.aPinsHtml[newCountIndex] = newpin;
					if(newpin.lon != '' && newpin.lat !=''){
						this.aPinsMap[newpin.id] =newpin;
						if(this.currentViewMode == 1){
							this.mapObject.removeLayer(this.layerMarker);
							this.initMapList();
						}
					}
					if($('#pinlist span').hasClass('no-pins')){
						$('#pinlist').empty();
					}
					
					var tmp = this.loadPinRow(newpin);
					var newIndex=this.aPinsHtml.length;
					
					this.aPinsHtml[newIndex] =newpin;
					if(this.currentViewMode == 1 && $('#pinlist .pinrow').length > 0){
					 	tmp.prependTo($('#pinlist'));
					 	this.adjustGrid('.pinrow');
					}
					if(this.currentViewMode == 0){
						tmp.prependTo($('#pinlist'));
					 	this.adjustGrid('.pinrow');
					}
					 
					$('#pinContainer').dialog('close');
					$("#pinContainer").html('');
					$("#pinContainer").removeClass('isOpenDialog');
					
					
					$('div[data-id="' + newpin.id + '"] .avatarrow').avatar(newpin.user_id, 64);
					//{'data-counterid':'count-'+element.id,'class':'wallcounter'}
					var currentCount = $('#pinWalls .wallcounter[data-counterid="count-' + newpin.wall_id + '"]').text();
					$('#pinWalls .wallcounter[data-counterid="count-' + newpin.wall_id + '"]').text((parseInt(currentCount) + 1));
					
						
						this.updateCounterTags();
					
					$("#pinContainer").html('');
					this.showMeldung(t('pin', 'Pin creating success!'));
                   $('#pinlistBg').hide();
				}
				if (VALUE == 'edit-pin') {
					this.showMeldung(t('pinit', 'Pin update success!'));
						var newCountIndex=(this.aPinsHtml.length);
					this.aPinsHtml[(newCountIndex-1)] = newpin;
					
					if(newpin.lon != '' && newpin.lat !=''){
						this.aPinsMap[newpin.id] =newpin;
						
					}
					
					var tmp = this.loadPinRow(newpin);
					$('#pinlist div.pinrow[data-id="' + newpin.id + '"]').remove();
					$('#pinlist').prepend(tmp);
					this.adjustGrid('.pinrow');
					$('div[data-id="' + newpin.id + '"] .avatarrow').avatar(newpin.user_id, 64);
						this.updateCounterTags();
					
				}

			}.bind(this)
		});

};

Pinit.prototype.showMeldung = function(TXT) {
	var leftMove = ($(window).width() / 2) - 150;
		var myMeldungDiv = $('<div id="iMeldung" style="left:' + leftMove + 'px"></div>');
		$('#content').append(myMeldungDiv);
		$('#iMeldung').html(TXT);

		$('#iMeldung').animate({
			top : 0
		}).delay(2000).animate({
			top : '-300'
		}, function() {
			$('#iMeldung').remove();
		});
};

Pinit.prototype.checkShowEventHash = function() {
	var id = parseInt(window.location.hash.substr(1));
		
		if (id) {
			this.showPin(id);
		}
};

Pinit.prototype.validateURL = function(textval) {
	var urlregex = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
		return urlregex.test(textval);
};

Pinit.prototype.calcDimensionPins = function() {
	
	if ($('#app-content').width() >= 800 && $('#app-content').width() <= 1440) {
			this.maxImagesPerRow = 4;
		} else if ($('#app-content').width() > 1440) {
			this.maxImagesPerRow = 6;
		} else {
			this.maxImagesPerRow = 3;
			
			if ($('#app-content').width() <= 570){
				this.maxImagesPerRow = 2;
			} 
		}
		this.columnWidth = $('#app-content').width() / this.maxImagesPerRow;
		this.columnWidth = Math.round(this.columnWidth);
		this.columnWidth = (this.columnWidth - 20);
		//alert($('#pinlist').width());
};

var myPinit=null;

$(window).resize(_.throttle(function() {
	myPinit.calcDimensionPins();
	myPinit.calcMaxMarkerPerPage=Math.ceil(($('#app-content').width() - 120)/134);
	$('.pinrow').css({
		'width' : (myPinit.columnWidth) + 'px',
		'min-width' : (myPinit.columnWidth) + 'px'
	});
	$('.pinrow img.pinimage').css({
		'max-width' : (myPinit.columnWidth-4) + 'px'
	});
	
	$('.pinrow .img-div').css({
		'max-width' : (myPinit.columnWidth-4) + 'px'
	});
	
	 
	$('.pinrow .pinrow-noimage').css({
		'width' : (myPinit.columnWidth - 4) + 'px'
	});
	$('.pinrow .pinrow-map img.map').css({
		'width' : (myPinit.columnWidth - 6) + 'px'
	});
    if(myPinit.currentViewMode==0){
		myPinit.adjustGrid('.pinrow');
	}
	
}, 500));



$(document).ready(function() {
	
		  myPinit = new Pinit();
		  myPinit.init();

	$(document).on('click', 'a.share', function(event) {
		event.stopPropagation();

		$('#pinWalls #dropdown').css({
			'top' : $(event.target).offset().top + 40
		});
	});

	 $('#app-content').scroll(function() {
		if(myPinit.currentViewMode==0){
			myPinit.loadRowPins();
		}
	});
	
	OC.Share.loadIcons('pinwall');
    
});

$(window).bind('hashchange', function() {
	myPinit.checkShowEventHash();
	
});





