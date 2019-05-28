var ObjectManager = function()
{
	this.init = function()
	{
		this.paste = new PasteMachine(false);

		this.initControls();

		this.uploadQueue = new Array();
		this.imgur = new ImgurManager();

		this.undoRedo = new UndoRedo();
		this.screensCounter = -1;

		if(typeof this.color=='undefined'){this.color="#fff"}
		

		this.recycleBin = new RecycleBin();	
		this.templates = new Templates();
		this.preRender = new PreRender();
	}
	this.initControls = function()
	{
		this.controls = new Controls();
		
		this.pencil = new Pencil();
		this.text = new Text();
		this.arrow = new Arrow();
		this.blur = new Blur();
		this.crop = new Crop();
		this.note = new Note();

		this.save = new Save();
		this.saveAs = new SaveAs();			
	}
	this.getNextScreenId = function()
	{
		this.screensCounter++;
		return this.screensCounter;
	}
}
var Controls = function()
{
	this.init = function()
	{
		$('#tool_draw').on('click',function(){			
			objManager.controls.resetActiveTool();
			objManager.pencil.init();
		});
		$('#tool_text').on('click',function(){
			objManager.controls.resetActiveTool();
			objManager.text.init();
		});
		$('#tool_arrow').on('click',function(){
			objManager.controls.resetActiveTool();
			objManager.arrow.init();				
		});
		$('#tool_blur').on('click',function(){
			objManager.controls.resetActiveTool();
			objManager.blur.init();
		});
		$('#tool_crop').on('click',function(){
			objManager.controls.resetActiveTool();
			objManager.crop.init();
		});	
		$('#tool_note').on('click',function(){
			objManager.controls.resetActiveTool();
			objManager.note.init();
		});					
		$('#tool_save').on('click',function(){			
			objManager.controls.resetActiveTool();
			objManager.save.init();
		});	

		$('#continueEditting').on('click',function(){
			$('#uploadProgress').slideUp('fast');
			$('#uploadComplete').slideUp('fast');
			$('#uploadPercentage').html('');
			$('#progressBar').css('width','0%');
			$('#feedbackBar').html('');
			$('#tool_save').css('opacity','1');
			$('#tool_save').on('click',function(){			
				objManager.controls.resetActiveTool();
				objManager.uploadQueue = new Array();
				objManager.save = new Save();
				objManager.imgur = new ImgurManager();	
				objManager.save.init();
			});	
		});
	}	

	this.resetActiveTool = function()
	{
		$('#secondaryTools').html('');
		if(typeof this.activeTool != 'undefined'){this.activeTool.disabled();}			
		objManager.undoRedo.resetQueue();
	}	

	this.setActiveTool = function(tool)
	{
		this.activeTool = tool;			
		$('.sp-preview-inner').html('');
		$('<img>').attr('src',tool.cursor).on('load',function(){$(this).appendTo('.sp-preview-inner')});
		//$('#tools').slideUp('fast');
		objManager.preRender.assignPreRendered();										
	}
	this.reEnableActive=function()
	{
		$('.screenHolder>img').css('cursor','url('+this.activeTool.cursor+'), auto');			
		this.activeTool.enabled();
	}		
}
var RecycleBin=function()
{
	this.hashData = new Array();
	this.addHash = function(data)
	{
		this.deleteCount = 0;			
		this.hashData = data;
		this.enabled();
	}
	this.enabled = function()
	{
		
		$('#binTool').show();
		$('#binTool').off('click');
		$('#binTool').on('click',function()
		{
			
			var confirm = $('<div id="dialog" title="Delete All Screens?"></div>').html('<p>After deletion all screens will be unrecoverable.</p>');
			confirm.dialog({
			  dialogClass: "no-close",
			  buttons: [
			    {
			      text: "Delete",
			      click: function() {
			        objManager.recycleBin.processDeletion();				        
			        $('.delDialog .ui-button-text:contains(Delete)').html('<img src="http://i.imgur.com/CJY8Avi.gif"/>');
			        $('.delDialog .ui-button-text:contains(Cancel)').prop('disabled', true).parent().attr('disabled','disabled').css('opacity','0.3');
			        $('.delDialog .ui-dialog-title').text('Deleting...');
			      }
			    },
			    {
			      text: "Cancel",
			      click: function() {
			        $( this ).dialog( "close" );
			      }
			    }				    
			  ],
			  position: { my: "right bottom", at: "left bottom", of: "#binTool" },
			  open:function(){
				  	$(document).on("mousedown.dialog", function(e) 
				  	{ 
				  		if($(e.target).closest('.ui-dialog').length > 0){ return;}
				  		confirm.dialog('close');
				  	});				  	
			  },
			  close:function(){$(document).off("mousedown.dialog");},
			  dialogClass: "delDialog no-close"
			});
		

		});

	}
	this.processDeletion=function()
	{
		var data = this.hashData;
		for (var i = 0; i < data.length; i++) 
		{			
			src = 'https://api.imgur.com/3/image/'+data[i];
			this.ajaxbaby(src);
		}				
	}
	this.ajaxbaby=function(url)
	{
		$.ajax({ 				
		    url: url,
		    headers: {
		        'Authorization': 'Client-ID b15a848494e5477'
		    },
		    type: 'DELETE',
		    success: function(data) 
		    {	
		    	if(data.success)
		    	{
		    		objManager.recycleBin.updateDeleteProgress();
				}    
			},			 	
 		 	tryCount : 0,
 		 	retryLimit : 5,
 		 	error : function(xhr, textStatus, errorThrown ) 
 		 	{
 		 		this.tryCount++;
 	 	        if (this.tryCount <= this.retryLimit) {
 	 	            //$.ajax(this);
 	 	            setTimeout(function(x){$.ajax(x)},1000,this);
 	 	            return;
 	 	        }            	 	     
 		 	}				 	
		});				
	}
	this.updateDeleteProgress =function()
	{
		this.deleteCount++;
		var total = this.hashData.length;
		$('#dialog>p').html('Deleting Image '+this.deleteCount+'/'+total);

		if(this.deleteCount==total)
		{
			$('#dialog>p').html('All screens deleted.');

			(function refresh(x){

				$('#dialog>p').html('All screens deleted. Refreshing page in '+x);

				if(x<=0)
				{
					//location.reload(true);
					 window.location = window.location+'&d=1';
					//window.location = 'http://www.easyprintscreen.com/?s='+id;
				return;
				}else{
					setTimeout(function(){refresh(--x)},1000);
				}
			})(3);					
		}

	}
}
var UndoRedo = function()
{
	this.queueIndex = 0;
	this.queue = new Array();
	//this.undoState = 'disabled'; not used
	this.redoState = 'disabled';
	this.addTo = function(el)
	{
		if(this.redoState == 'enabled')//user has clicked undo and adding new edits after, so we reset previous undo queue
		{
			this.resetQueue();
			this.redoDisabled();
		}

		var id = 'editID'+this.getQueueIndex();
		$(el).attr('id',id);
		this.queue.push(id);
		this.undoEnabled();
	}
	this.undoEnabled = function()
	{
		$('#tool_undo').css('opacity',1);
		$('#tool_undo').off('mouseover mousedown');
		$('#tool_undo').on({
			mousedown:function(){
				$.each(objManager.undoRedo.queue, function(i,v){			
					var el = $('#'+v);	
					if(!(el.length>0)){return;}
					var tag = el.prop("tagName");

					if((tag=='TEXTAREA')||(tag=='CANVAS')){el.hide();}						
					if(tag=='IMG'){el.siblings('img:first').show();el.hide();}							
				});
				objManager.undoRedo.undoDisabled();
				objManager.undoRedo.redoEnabled();	
			},
			mouseover:function(){}
		});
	}
	this.undoDisabled = function()
	{
		$('#tool_undo').css('opacity',0.2);
		$('#tool_undo').off('mouseover mousedown');
	}
	this.redoEnabled = function()
	{
		this.redoState = 'enabled';
		$('#tool_redo').css('opacity',1);
		$('#tool_redo').off('mouseover mousedown');
		$('#tool_redo').on({
			mousedown:function(){

				$.each(objManager.undoRedo.queue, function(i,v){			
					var el = $('#'+v);	
					if(!(el.length>0)){return;}
					var tag = el.prop("tagName");

					if(tag=='TEXTAREA'){el.show();}		
					if(tag=='CANVAS'){el.css('display','');}						
					if(tag=='IMG'){el.siblings('img').hide();el.show();}							
				});
				$(this).off('mousedown');

				objManager.undoRedo.undoEnabled();	
				objManager.undoRedo.redoDisabled();	

			},
			mouseover:function(){}
		});			
	}
	this.redoDisabled = function()
	{
		this.redoState = 'disabled';
		$('#tool_redo').css('opacity',0.2);
		$('#tool_redo').off('mouseover mousedown');
	}	
	this.resetQueue = function()
	{	
		$('.screenHolder').children().each(function(){
			if($(this).css('display')=='none')
			{
				$(this).remove();
			}
		});


		this.undoDisabled();
		this.redoDisabled();
		this.queue = new Array();
	}
	this.getQueueIndex = function()
	{
		return this.queueIndex++;
	}
} 
var LoadScreens =function()
{
	this.init=function()
	{
		this.screens = new Array();
		if(this.getURLParameter('d')!=null)
		{
			this.useNoCache = true;
		}
		if(this.getURLParameter('s')!=null)
		{
			$('.shortcutTextMain').html('Loading screens..');
			$('.shortcutPicMain').attr('src','http://i.imgur.com/CJY8Avi.gif');
			var data = this.getURLParameter('s').split(",");

			this.loadTheScreens(data);
		}

		var hash = new Array();
		if(this.getURLParameter('h')!=null)
		{
			var data = this.getURLParameter('h').split(",");


			objManager.recycleBin.addHash(data);
		}			
	}
	this.getURLParameter=function(name) {
	    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
	}
	this.getJson=function(id)
	{
		var self = this;
		$.ajax({ 
		    url: 'http://localhost/easyprintscreen.com/getJson.php',
		    dataType: "json",
		    data: {
		        'id': id
		    },
		    self : self,
		    success: function(data) 
		    {
		    	self.loadTheScreens(data);
		 	},
 		 	tryCount : 0,
 		 	retryLimit : 3,
 		 	error : function(xhr, textStatus, errorThrown ) 
 		 	{
 		 		this.tryCount++;
 	 	        if (this.tryCount <= this.retryLimit) {
 	 	            $.ajax(this);
 	 	            return;
 	 	        }            	 	     
 		 	}				 	
		});		
	}
	this.loadTheScreens=function(data)
	{
		var cacheString = (this.useNoCache) ? '?' + (new Date()).getTime() : '';
		for (var i = 0; i < data.length; i++) 
		{			
			src = 'http://i.imgur.com/'+data[i]+'.jpg' + cacheString;
			this.loadImage(src);
		}		
	}		
	this.loadImage=function(src)
	{
		var id = objManager.getNextScreenId();


		var div = $('<div id="screen'+id+'" screenId="'+id+'" class="screenHolder">').append(objManager.templates.getScreenOptionsMenu()).appendTo($('.container'));
		var thumb = $('<div></div>').appendTo($('.thumbnails'));

		var image = new Image();
		image.crossOrigin = "Anonymous";
		image.onload=function()
		{

			/*
			var minHeight = 800;
			var minWidth = 1000;
			var w = image.width;
			var h = image.height;
	    	if((w<minWidth)&&(h<minHeight)) //if smaller than minh and minw
			{
				if(w>h)
				{
					scale = 1/(w/minWidth);
				}else{						
					scale = 1/(h/minHeight);	
				}

				newH = h*scale;
				newW = w*scale;

	    		var enlargeIt = new CanvasObj();
	    		enlargeIt.createNew();
	    		enlargeIt.setDimensions(newW,newH);		    	
		    	enlargeIt._context.drawImage(image,0,0,w,h,0,0,newW,newH);
		    	image_data = enlargeIt._canvas.toDataURL('image/jpeg',1);	

		    	$('<img src="'+image_data+'">').on('load',function(){$(this).appendTo(image.div);$('#tool_draw').click();});
		    	$('<img src="'+image_data+'" id="revert'+image.ID+'">').on('load',function(){$(this).appendTo('#revertHolder')});
			}else{				
				$(image.cloneNode(true)).appendTo(image.div);
				$(image.cloneNode(true)).attr('id','revert'+image.ID).appendTo('#revertHolder');
				$('#tool_draw').click();
			}
			*/

			$(image.div).css('width',image.width).css('height',image.height);
			$(image.cloneNode(true)).appendTo(image.div);
			$(image.cloneNode(true)).attr('id','revert'+image.ID).appendTo('#revertHolder');
			$('#tool_draw').click();


			var ratio = 1;
			if(image.width > 100)
			    ratio = 100 / image.width;
			else if(image.height > 100)
			    ratio = 100 / image.height;

			var thumbvas = new CanvasObj();
			thumbvas.createNew();
			var canvas = thumbvas._canvas;
			var ctx = thumbvas._context;
			canvas.width=image.width*ratio;
			canvas.height=image.height*ratio;
			ctx.drawImage(image,0,0,image.width,image.height,0,0,canvas.width,canvas.height);


			image_data = canvas.toDataURL('image/jpeg',1);
			var thumb = $('<img>').attr('src',image_data)
			$(image.thumb).replaceWith(thumb);
			thumb.attr('id','thumb'+image.ID);


			$(thumb).on('click',function(){
				$('html, body').animate({
                        scrollTop: $("#screen"+id).offset().top
                    }, 500);			
			});	
							
			$('#pasteKeys').hide();
			$('#sidebar').show();
			$('#pasteMore').show();
			$('#feedbackLink').show();				
		}
		image.thumb = thumb;
		image.div = div;
		image.ID = id;
		image.src = src;		
	}	
}
var Templates = function()
{
	this.getScreenOptionsMenu=function()
	{
		var saveAs = $('<img src="http://i.imgur.com/296GrNp.png" title="Download Screen" class="options">').on({
						'click':function(e){
							var screenHolder = $(this).parent().parent();
							objManager.saveAs.screenId = screenHolder.attr('screenId');			
							objManager.preRender.renderAllForSaving(objManager.saveAs.save);								
						}});
		var remove = $('<img src="http://i.imgur.com/x2cAlc8.png" title="Remove" class="options">').on({
							'click':function(e){
								var id = $(this).parent().parent().attr('screenId');
								$(this).parent().parent().remove();
								$('#thumb'+id).remove();
								$('#revert'+id).remove();							
							}
						});
		var revert = $('<img src="http://i.imgur.com/XcKjmZ4.png" title="Revert Changes" class="options">').on({
							'click':function(e){
								var $screenHolder = $(this).parent().parent();
								var id = $screenHolder.attr('screenId');

								$screenHolder.children('img,textarea,canvas').remove();							
								$('#revert'+id).clone().appendTo($screenHolder);
								$('#thumb'+id).replaceWith($('#revert'+id).clone());
								objManager.undoRedo.resetQueue();
								objManager.controls.reEnableActive();
							}
						});
		var template = $('<div style="position:absolute; bottom:-26px; right:0px"></div>').append(revert).append(saveAs).append(remove);
		return template;			
	}
}
var Pencil = function()
{	
	this.cursor='http://i.imgur.com/jwrlNlJ.png';
	this.pensize = 10;
	this.init=function(){
		this.initSlider();
		objManager.controls.setActiveTool(this);				
	}
	this.assignACanvasToThisImage=function(image)
	{
		if( (typeof image.markings =='undefined') || ($(image.markings._canvas).css('display')=='none') ) 
		{
			var markings = new CanvasObj(); 
			markings.createNew(); 
			markings.setDimensions(image.naturalWidth,image.naturalHeight); 
			markings.clear();
			markings.lineWidth(this.pensize); 
			
			markings._context.lineCap = 'round';
			markings._context.lineJoin = 'round';
			markings.appendCanvasTo($(image).parent());
			image.markings = markings;							
		}
	}
	this.enabled = function()
	{
		this.disabled();
		var self = this;
		$('.screenHolder>img').bind({
		    mousedown: function(e)
		    {			    	
		 		  
		    	self.assignACanvasToThisImage(this);
		    	objManager.undoRedo.addTo(this.markings._canvas);	

		    	/*
		    	var markings = new CanvasObj(); 
		    	markings.createNew(); 
		    	markings.setDimensions(this.naturalWidth,this.naturalHeight); 
		    	markings.lineWidth(self.pensize); 
		    	
		    	markings._context.lineCap = 'round';
		    	markings._context.lineJoin = 'round';
		    	markings.appendCanvasTo($(this).parent());
		    	this.markings = markings;
				
		    	objManager.undoRedo.addTo(markings._canvas);							
				*/
				this.markings.strokeColor(objManager.color); 
				this.markings.lineWidth(self.pensize); 			    	

		    	var x = e.originalEvent.pageX - $(this).offset().left;
				var y = e.originalEvent.pageY - $(this).offset().top; 

				var x = x* (this.naturalWidth/this.width);
				var y = y* (this.naturalHeight/this.height);
			

		      	this.lastDragXY = [x,y];
		      	this.markings.beginPath(); 
		      	this.markings.lineTo(x,y);
		      	this.markings.lineTo(x+1,y+1);
		      	this.markings.stroke();	

				$(this).on('mousemove.Pencil',function(e)
				{

	    	    	var x = e.originalEvent.pageX - $(this).offset().left;
	    			var y = e.originalEvent.pageY - $(this).offset().top; 

	    			var x = x*(this.naturalWidth/this.width);
	    			var y = y*(this.naturalHeight/this.height);

	    			posX = this.lastDragXY[0] - x;
	    			posY = this.lastDragXY[1] - y;
	    			range = 10;
			    	
			    
		        	if( ( Math.abs(posX) >range ) || ( Math.abs(posY) >range ) )
		        	{
		        		this.lastDragXY = [x,y]; 	
			    		this.markings.lineTo(x,y);		    		
			    		this.markings.stroke();		   
		        	}					   
			    });

		      	var image = this;
				$(document).on('mouseup.Pencil',function(e)
				{
					$(image).off('mousemove.Pencil');
					$(this).off('mouseup.Pencil');
				 	setTimeout(function(){objManager.preRender.render(image)},0);
				 });


		    },
		    dragstart:function(e){
		    	e.originalEvent.preventDefault();
		    	e.originalEvent.stopPropagation();
		    }
		});					
	}
    this.initSlider = function(){
    	var template = '<div id="penSizeSlider" style="height:100px; width:40px; margin:auto; border:none;" class="ui-slider ui-slider-vertical ui-widget ui-widget-content " aria-disabled="false">'+
				'<img src="http://i.imgur.com/ycf3wjP.png" style="width:40px; height:100px; position:absolute;top:0;">'+
				'<a class="ui-slider-handle ui-state-default " href="#"></a>'+
				'</div>';	

		$('#secondaryTools').html('');
		$(template).appendTo('#secondaryTools');

		var self = this;
		$('#penSizeSlider').slider({
			min: 1,
			max: 50,	
			step: 1,
			orientation: "vertical",
			value: 10,
		  slide: function( event, ui ) {
		  	self.pensize = ui.value;
		  },
		  stop: function( event, ui ) {			    			  	
		  	self.pensize = ui.value;
		  }
		});		
    }		
	this.disabled = function()
	{
		$('.screenHolder>img').each(function(){
			delete this.markings;
		});
		$('.screenHolder>img').unbind("dragstart mousemove mousedown");	
	}	
}
var Text = function()
{
	this.cursor='http://i.imgur.com/RIhhhjp.png';		
	this.init=function(){
		this.initSlider();
		objManager.controls.setActiveTool(this);	
	}
	this.enabled=function()
	{
		var self = this;
		this.disabled();
		$('.screenHolder>textarea').css('pointer-events','auto');
		$('.screenHolder>img').bind({
		    mousedown: function(e)
		    {

    	    	var x = e.originalEvent.pageX - $(this).offset().left;
    			var y = e.originalEvent.pageY - $(this).offset().top; 


		    	var textarea = $('<textarea rows="4" spellcheck="false" cols="50">');	
		    	$(textarea).css({
								'position':'absolute',
								'z-index':'12', //CODETHIS
								'height':'38px',
								'width':'36px',
								'border':'none',
								'top':y+'px',
								'left':x+'px',
								'background':'none',
								'font-size':self.textsize+'px',
								'line-height':self.textsize+'px',
								'font-family':'monospace',
								'pointer-events':'none',									
								'text-align':'center',
								'overflow':'hidden',	    	
								'opacity':'1',
								'resize':'none',										
								'color':objManager.color
								});


		    	$(textarea).bind({

		    		keydown:function(e)
		    		{
		    			$(this).css('width',parseInt($(this).css('width'),10)+(3*parseInt($(this).css('font-size'),10)+"px"));
		    			$(this).triggerHandler("resizeGhost");
		    		},
		    		keyup: function(e)
		    		{
		    			$(this).triggerHandler("resizeGhost");	    			
		    		},			    		
		    		focusin: function(e)
		    		{			    						    			
		    			$(this).triggerHandler("initGhost");	
		    			$(this).triggerHandler("showDragHandle",this);			
		    			objManager.paste.disabled();
		    		
		    		},
		    		focusout:function(e)
		    		{
		    			$(this).triggerHandler("hideDragHandle");			
		    			
	    			    setTimeout(function(selfTextArea) 
	    			    {	
	    			    		    			    	
	    			    	if($(document.activeElement).is('.ui-slider-handle')){self.setActiveTextarea(selfTextArea); return;} //is handle
	    			    	if($(document.activeElement).closest('#textSizeSlider').length > 0) //is near handle
	    			    	{
	    			    		$(selfTextArea).focus();
	    			    		return;
	    			    	}

	    			    	self.setActiveTextarea('undefined');
	    			    	//$(selfTextArea.slider).remove();
	    			    	$(selfTextArea.ghost).remove();
	    			    	delete selfTextArea.ghost;

	    			    	$(selfTextArea.dragger).remove();
	    			    	delete selfTextArea.dragger;
	    			    	clearTimeout(selfTextArea.dragTimeout);

	    			    	if($(selfTextArea).val().length==0){$(selfTextArea).remove();}

	    			    	if($(document.activeElement).is("textarea")){return;}//incase the select another textarea
	    			    	objManager.paste.enabled();
	    			    	

	    			    	setTimeout(function(){objManager.preRender.render($(selfTextArea).siblings('img'))},0);

	    			    },0,this);
		    		},
		    		initGhost:function()
		    		{
		    			if(typeof this.ghost != "undefined"){return;}
		    			var span = $('<pre contenteditable="true" style="display:inline-block">').css({
												    					'font-size':$(this).css('font-size'),
												    					'line-height':$(this).css('line-height'),
																		'font-family':$(this).css('font-family'),
																		'position':'absolute', 
																		'top':$(this).css('top'),
																		'border':'none',
																		'left':$(this).css('left'),
																		'color':'#ccc',
																		'text-align':'center',
																		'opacity':'0'
																		}).appendTo($(this).parent());
		    			this.ghost = span;

		    		},
		    		resizeGhost:function()
		    		{
		    			var maxWidth = $(this).parent().width();
		    			var maxHeight = $(this).parent().height();

		    			var ghost = this.ghost;		
		    			$(ghost).css('width',"auto");
		    			$(ghost).css('max-width',maxWidth+'px');			    			
		    			$(ghost).css('height',"auto");
		    			$(ghost).css('max-height',maxHeight+'px');	
		    			$(ghost).html($(this).val())


		    			if( ($(ghost).width()>maxWidth) || ($(ghost).height()>maxHeight) ) 
		    			{
		    				//tooo big
		    				return;
		    			}

						if($(ghost).width()+parseInt($(ghost).css('left'),10)+parseInt($(ghost).css('font-size'),10) > maxWidth)
						{
							var x = $(ghost).width()+parseInt($(ghost).css('left'),10) + parseInt($(ghost).css('font-size'),10) - maxWidth;
							var x = parseInt($(ghost).css('left'),10) - x;

							if(x<0){x=0;}

							$(ghost).css('left',x+'px');	
							$(this).css('left',x+'px');										
						}	

						if($(ghost).height()+parseInt($(ghost).css('top'),10) > maxHeight)
						{
							var y = $(ghost).height()+parseInt($(ghost).css('top'),10) - maxHeight;
							var y = parseInt($(ghost).css('top'),10) - y;

							if(y<0){y=0;}

							$(ghost).css('top',y+'px');	
							$(this).css('top',y+'px');										
						}													

						var width = $(ghost).width()+parseInt($(ghost).css('font-size'),10);
						var height = $(ghost).height()+parseInt($(ghost).css('font-size'),10);

						//if(height+parseInt($(ghost).css('top'),10)+parseInt($(ghost).css('font-size'),10) > maxHeight){height=$(ghost).height();}

						if(width>maxWidth){width=maxWidth}
						if(height>maxHeight){height=maxHeight}


						if(width==0){width=parseInt($(ghost).css('font-size'),10);}	
						if(height==0){height=parseInt($(ghost).css('font-size'),10);}	


						$(ghost).css('width',width+"px");
		    			$(this).css('width',width+"px");
		    			$(this).css('height',height+"px");	

		    			if(typeof this.dragHandle != 'undefined')
		    			{
		    				$(this.dragHandle).css({
								'top':parseInt($(this).css('top'),10)+'px',
								'left':parseInt($(this).css('left'),10)-16+'px',
								});
		    			}
		    		},
		    		showDragHandle:function(e,txtarea)
		    		{					
						var dragThing = $('<img src="http://i.imgur.com/m9bZzMr.png">')
    					.css({	'position':'absolute',
								'top':parseInt($(this).css('top'),10)+'px',
								'left':parseInt($(this).css('left'),10)-16+'px',
								'height':'16px',
								'width':'16px',
								'cursor':'move',
								'opacity':'0.6'	
						}).draggable({drag:function(e,ui){

							if((ui.offset.top<$(txtarea).parent().offset().top)||(ui.offset.left<$(txtarea).parent().offset().left))return;
							if((ui.offset.top>this.maxY)||(ui.offset.left>this.maxX))return;


							$(txtarea).offset({'top':ui.offset.top+16,'left':ui.offset.left+16});
						},start:function(e,ui){	

							this.maxX = $(txtarea).parent().width() - $(txtarea).width() + $(txtarea).parent().offset().left;
							this.maxY = $(txtarea).parent().height() - $(txtarea).height() + $(txtarea).parent().offset().top;
							$(this).css('opacity','0');	    			
						},stop:function(e,ui){
		
							$(this).css({
								'top':parseInt($(txtarea).css('top'),10)+'px',
								'left':parseInt($(txtarea).css('left'),10)-16+'px',
								'opacity':'0.6'});
								}	  
						}).appendTo($(this).parent());

						this.dragHandle = dragThing;				    			
		    		},
		    		hideDragHandle:function()
		    		{
		    			$(this.dragHandle).remove();
		    		}

		    	});
	
	
				$(textarea).appendTo($(this).parent());
				objManager.undoRedo.addTo(textarea);

				var img = this;
				$(document).on('mouseup.Text',function(e){
					$(textarea).focus();
		    		$('textarea').css('pointer-events','auto');	
					$(this).off('mouseup.Text');
				 });						

		    },
		    dragstart:function(e){
		    	e.originalEvent.preventDefault();
		    	e.originalEvent.stopPropagation();
		    }
		});	
	
		
	}
    this.initSlider = function(){
    	this.textsize = 30;
    	var template = '<div id="textSizeSlider" style="height:100px; width:40px; margin:auto; border:none;" class="ui-slider ui-slider-vertical ui-widget ui-widget-content " aria-disabled="false">'+
				'<img src="http://i.imgur.com/JyRMWiB.png" style="width:40px; height:100px; position:absolute;top:0;">'+
				'<a class="ui-slider-handle ui-state-default " href="#"></a>'+
				'</div>';	
		$('#secondaryTools').html('');
		$(template).appendTo('#secondaryTools');

		var self = this;
		$('#textSizeSlider').slider({
			min: 10,
			max: 100,	
			step: 1,
			orientation: "vertical",
			value: 30,
		  slide: function( event, ui ) {
		  	self.textsize = ui.value;
		  	if(typeof self.activeTextarea != 'undefined')
		  	{
		  		self.resizeActiveTextarea(ui);
		  	}
		  },
		  stop: function( event, ui ) {			    			  	
		  	self.textsize = ui.value;
		  }
		});		
    }
    this.setActiveTextarea = function(textarea)
    {
    	this.activeTextarea = textarea;
    }
    this.resizeActiveTextarea = function(ui)
    {
    	var selfTextArea = this.activeTextarea;
    	$(selfTextArea.ghost).css('font-size',ui.value+"px").css('line-height',ui.value+"px");
    	$(selfTextArea).css('font-size',ui.value+"px").css('line-height',ui.value+"px");
    	$(selfTextArea).triggerHandler("resizeGhost");	    	
    }
	this.disabled = function()
	{
		$('.screenHolder>img').unbind("mousedown dragstart");
		$('.screenHolder>textarea').css("pointer-events","none");
	}
	this.compileToCanvasAll = function()
	{
		$('.screenHolder>textarea').each(function(i){

			objManager.text.compileToCanvas.call(this);
			
		});
	}
	this.compileToCanvas = function()
	{

		var canvas = new CanvasObj();
		canvas.createNew();
		canvas.setDimensions($(this).parent().width(),$(this).parent().height());
		canvas.appendCanvasTo($(this).parent());

		var ctx = canvas._context;
		ctx.font = $(this).css('font-size')+" "+$(this).css('font-family');
		ctx.fillStyle = $(this).css('color');
		ctx.textBaseline="top"; 

		var x = parseInt($(this).css('left'),10);
		var y = parseInt($(this).css('top'),10); //CODETHIS chrome only bug where text shifts down a few pixels on compile

		//ctx.rect(x,y,$(this).width(),$(this).height());
		ctx.stroke();

		//text-align center
		ctx.textAlign="center"; 
		var x = x + Math.ceil($(this).width() * 0.5);		

		var text = $(this).val().split('\n');

		

		var newlineCount = 0;
		for (var i = 0; i < text.length; i++) {
			var txt = text[i];

			var y2 = y + ( i * parseInt($(this).css('line-height'),10) );
			var ctx = canvas._context;
		

			function wrapLetters(context, text, x, y, maxWidth, lineHeight) 
			{
			  var letters = text.split('');
			  var line = '';
			  var newLines = 0;

			  for(var n = 0; n < letters.length; n++) {
			    var testLine = line.concat(letters[n]);
			    var metrics = context.measureText(testLine);
			    var testWidth = metrics.width;
			    if (testWidth > maxWidth && n > 0) {
			      context.fillText($.trim(line), x, y);
			      line = letters[n];
			      y += lineHeight;
			      newLines++;
			    }
			    else {
			      line = testLine;
			    }
			  }
			  //context.fillText($.trim(line), x, y);
			  //newLines++;
			  return [newLines,line,y];
			}


			function wrapText(context, text, x, y, maxWidth, lineHeight) 
			{
			  var words = text.split(' ');
			  var line = '';
			  var newLines = 0;

			  words.push('');

			  for(var n = 0; n < words.length; n++) 
			  {
			    var testLine = line +' '+ words[n];
			    if(n==0){testLine=words[n]}


			    var metrics = context.measureText(testLine+' ');
			    var testWidth = metrics.width;


			    if (testWidth > maxWidth && n > 0) 
			    {
			    	if(context.measureText(line).width > maxWidth )
			    	{
			    		txt = line;
						var newlines2 = 0;	
						var result = wrapLetters(context, txt, x, y, maxWidth, lineHeight); 
						newlines2 = result[0];							
						newlines += newlines2;					    	
						y = result[2];
						line = result[1]+' '+words[n];
			    	}else{
				      context.fillText($.trim(line), x, y);
				      line = words[n];
				      y += lineHeight;
				      newLines++;
				  	}
			    }else {
			    	//catch letters here
			    	if(testWidth > maxWidth )
			    	{	
			    		txt = testLine;
						var newlines2 = 0;	
						var result = wrapLetters(context, txt, x, y, maxWidth, lineHeight); 
						newlines2 = result[0];							
						newlines += newlines2;					    	
						y = result[2];
						line = result[1];
					}else{
						line = testLine;
					}
			      
			    }
			  }
			  context.fillText($.trim(line), x, y);
			  newLines++;
			  return newLines;
			}

			var newlines = 0;	
			newLines = wrapText(ctx, txt, x, y2, $(this).width(), parseInt($(this).css('line-height'),10)); 

			//ctx.fillText(txt,x,y2);
			newlineCount += newLines;
							
		}
		
		var img = $(this).parent().children('img').get(0);

		var canvas2 = new CanvasObj();
		canvas2.createNew();
		canvas2.setDimensions(img.naturalWidth,img.naturalHeight);
		var ctx = canvas2._context;
		ctx.drawImage(canvas._canvas,0,0,canvas._canvas.width,canvas._canvas.height,0,0,img.naturalWidth,img.naturalHeight);
		canvas2.appendCanvasTo($(this).parent());

		$(canvas._canvas).remove();
		$(this).remove();			
	}
	this.render = function()
	{			
		var canvas = new CanvasObj();
		canvas.createNew();
		canvas.setDimensions($(this).parent().width(),$(this).parent().height());
		//canvas.appendCanvasTo($('#preRenderedText'));

		var ctx = canvas._context;
		ctx.font = $(this).css('font-size')+" "+$(this).css('font-family');
		ctx.fillStyle = $(this).css('color');
		ctx.textBaseline="top"; 

		var x = parseInt($(this).css('left'),10);
		var y = parseInt($(this).css('top'),10); //CODETHIS chrome only bug where text shifts down a few pixels on compile

		//ctx.rect(x,y,$(this).width(),$(this).height());
		ctx.stroke();

		//text-align center
		ctx.textAlign="center"; 
		var x = x + Math.ceil($(this).width() * 0.5);		

		var text = $(this).val().split('\n');

		

		var newlineCount = 0;
		for (var i = 0; i < text.length; i++) {
			var txt = text[i];

			var y2 = y + ( i * parseInt($(this).css('line-height'),10) );
			var ctx = canvas._context;
		

			function wrapLetters(context, text, x, y, maxWidth, lineHeight) 
			{
			  var letters = text.split('');
			  var line = '';
			  var newLines = 0;

			  for(var n = 0; n < letters.length; n++) {
			    var testLine = line.concat(letters[n]);
			    var metrics = context.measureText(testLine);
			    var testWidth = metrics.width;
			    if (testWidth > maxWidth && n > 0) {
			      context.fillText($.trim(line), x, y);
			      line = letters[n];
			      y += lineHeight;
			      newLines++;
			    }
			    else {
			      line = testLine;
			    }
			  }
			  //context.fillText($.trim(line), x, y);
			  //newLines++;
			  return [newLines,line,y];
			}


			function wrapText(context, text, x, y, maxWidth, lineHeight) 
			{
			  var words = text.split(' ');
			  var line = '';
			  var newLines = 0;

			  words.push('');

			  for(var n = 0; n < words.length; n++) 
			  {
			    var testLine = line +' '+ words[n];
			    if(n==0){testLine=words[n]}


			    var metrics = context.measureText(testLine+' ');
			    var testWidth = metrics.width;


			    if (testWidth > maxWidth && n > 0) 
			    {
			    	if(context.measureText(line).width > maxWidth )
			    	{
			    		txt = line;
						var newlines2 = 0;	
						var result = wrapLetters(context, txt, x, y, maxWidth, lineHeight); 
						newlines2 = result[0];							
						newlines += newlines2;					    	
						y = result[2];
						line = result[1]+' '+words[n];
			    	}else{
				      context.fillText($.trim(line), x, y);
				      line = words[n];
				      y += lineHeight;
				      newLines++;
				  	}
			    }else {
			    	//catch letters here
			    	if(testWidth > maxWidth )
			    	{	
			    		txt = testLine;
						var newlines2 = 0;	
						var result = wrapLetters(context, txt, x, y, maxWidth, lineHeight); 
						newlines2 = result[0];							
						newlines += newlines2;					    	
						y = result[2];
						line = result[1];
					}else{
						line = testLine;
					}
			      
			    }
			  }
			  context.fillText($.trim(line), x, y);
			  newLines++;
			  return newLines;
			}

			var newlines = 0;	
			newLines = wrapText(ctx, txt, x, y2, $(this).width(), parseInt($(this).css('line-height'),10)); 

			//ctx.fillText(txt,x,y2);
			newlineCount += newLines;
							
		}
		
		var img = $(this).parent().children('img').get(0);

		var canvas2 = new CanvasObj();
		canvas2.createNew();
		canvas2.setDimensions(img.naturalWidth,img.naturalHeight);
		var ctx = canvas2._context;
		ctx.drawImage(canvas._canvas,0,0,canvas._canvas.width,canvas._canvas.height,0,0,img.naturalWidth,img.naturalHeight);
		
		return canvas2._canvas;	
	}		
}
var Arrow = function()
{
	this.cursor='http://i.imgur.com/bDJEiXZ.png';		
	this.init=function(){
		objManager.controls.setActiveTool(this);	
	}
	this.enabled=function()
	{
		this.disabled();
		$('.screenHolder>img').bind({
		    mousedown: function(e)
		    {
    	    	var x = e.originalEvent.pageX - $(this).offset().left;
    			var y = e.originalEvent.pageY - $(this).offset().top; 

				this.x1 = x* (this.naturalWidth/this.width);
				this.y1 = y* (this.naturalHeight/this.height);

    			var canvas = new CanvasObj();
    			canvas.createNew();
    			canvas.setDimensions(this.naturalWidth,this.naturalHeight);	    		
    			canvas.appendCanvasTo($(this).parent());
    			this.context = canvas._context;


    			objManager.undoRedo.addTo(canvas._canvas);


    			$(this).on('mousemove.Arrow',function(e){
			    	var x = e.originalEvent.pageX - $(this).offset().left;
					var y = e.originalEvent.pageY - $(this).offset().top; 

					this.x2 = x* (this.naturalWidth/this.width);
					this.y2 = y* (this.naturalHeight/this.height);
					
					canvas.clear();
					$(this).triggerHandler("drawArrow");
					
    			});



    			var img = this;
    			$(document).on('mouseup.Arrow',function(e){

			    	var x = e.originalEvent.pageX - $(img).offset().left;
					var y = e.originalEvent.pageY - $(img).offset().top; 

					img.x2 = x* (img.naturalWidth/img.width);
					img.y2 = y* (img.naturalHeight/img.height);

					canvas.clear();
					$(img).triggerHandler("drawArrow",true);


			       $(img).off('mousemove.Arrow');
			       $(this).off('mouseup.Arrow');
    			});				

		    },
		    dragstart:function(e){
		    	e.originalEvent.preventDefault();
		    	e.originalEvent.stopPropagation();
		    },
		    drawArrow:function(e,render)
		    {
		    	

		    	function Line(x1,y1,x2,y2){
		    	    this.x1=x1;
		    	    this.y1=y1;
		    	    this.x2=x2;
		    	    this.y2=y2;
		    	}
		    	Line.prototype.drawWithArrowheads=function(ctx){
		    	    
		    	    var distance = Math.sqrt( Math.pow((this.x1-this.x2),2) + Math.pow((this.y1-this.y2),2) );

		    	    
		    	    // arbitrary styling
		    	    ctx.strokeStyle=objManager.color;
		    	    ctx.fillStyle=objManager.color;
		    	    ctx.lineWidth=Math.round(distance*0.04);
		    	   
		    	   ctx.lineCap="round";
		    	   ctx.lineJoin="round";
		    	    // draw the line
		    	    ctx.beginPath();
		    	    ctx.moveTo(this.x1,this.y1);
		    	    ctx.lineTo(this.x2,this.y2);
		    	    //ctx.bezierCurveTo(this.x1,this.y1,this.x2*0.8,this.y2*.8,this.x2,this.y2);
		    	    ctx.stroke();

		    	      
		    	    
		    	    // draw the starting arrowhead
		    	    var startRadians=Math.atan((this.y2-this.y1)/(this.x2-this.x1));
		    	    startRadians+=((this.x2>=this.x1)?-90:90)*Math.PI/180;
		    	    this.drawArrowhead(ctx,this.x1,this.y1,startRadians,distance);
		    	    // draw the ending arrowhead
		    	    var endRadians=Math.atan((this.y2-this.y1)/(this.x2-this.x1));
		    	    endRadians+=((this.x2>=this.x1)?90:-90)*Math.PI/180;
		    	    //this.drawArrowhead(ctx,this.x2,this.y2,endRadians);
		    	    
		    	}
		    	Line.prototype.drawArrowhead=function(ctx,x,y,radians,d){
		    	    ctx.save();
		    	    
		    	    var arrow_width = d*.10;
		    	    var arrow_height = d*.20;
		    	    ctx.beginPath();
		    	    ctx.translate(x,y);
		    	    ctx.rotate(radians);
		    	    ctx.moveTo(0,0);
		    	    ctx.bezierCurveTo(0,0,arrow_width*0.1,arrow_height*.4,arrow_width,arrow_height);
		    	    //ctx.lineTo(arrow_width,arrow_height);
		    	    ctx.bezierCurveTo(0+(arrow_width*.4),arrow_height*.6,
		    	                      0-(arrow_width*.4),arrow_height*.6,
		    	                      0-arrow_width,arrow_height);   
		    	    ctx.moveTo(0,0);
		    	    ctx.bezierCurveTo(0,0,arrow_width*0.1,arrow_height*.1,0-arrow_width,arrow_height);
		    	    //ctx.lineTo(0-arrow_width,arrow_height);
		    	    //ctx.closePath();
		    	    
		
		    	    ctx.fill();
		    	    /*	bendy arrow
		    	    ctx.moveTo(0,0);
		    	    ctx.bezierCurveTo(	0,0,
		    	    					0+(arrow_width*.7),d-(arrow_height*1),
		    	    					0,d);
		    	    */				    	    
		    	    ctx.stroke();
		    	    ctx.restore();
		    	    
		    	}

		    	// create a new line object
		    	var line=new Line(this.x1,this.y1,this.x2,this.y2);
		    	// draw the line
		    	line.drawWithArrowheads(this.context);

		    	if(render)
		    	{
		    		var image = this;
					setTimeout(function(){objManager.preRender.render(image)},0);
		    	}
		    }

		});	
	}
	this.disabled=function()
	{
		$('.screenHolder>img').unbind('mousedown dragstart drawArrow');
	}
}
var Note = function()
{
	this.cursor='http://i.imgur.com/bDJEiXZ.png';		
	this.init=function(){
		objManager.controls.setActiveTool(this);	
	}
	this.enabled=function()
	{
		this.disabled();
		$('.screenHolder>img').bind({
		    mousedown: function(e)
		    {

    	    	var x = e.originalEvent.pageX - $(this).offset().left;
    			var y = e.originalEvent.pageY - $(this).offset().top; 

				this.x1 = x* (this.naturalWidth/this.width);
				this.y1 = y* (this.naturalHeight/this.height);

    			var canvas = new CanvasObj();
    			canvas.createNew();
    			canvas.setDimensions(this.naturalWidth,this.naturalHeight);	    		
    			canvas.appendCanvasTo($(this).parent());
    			this.context = canvas._context;


    			objManager.undoRedo.addTo(canvas._canvas);


    			$(this).on('mousemove.Note',function(e){
			    	var x = e.originalEvent.pageX - $(this).offset().left;
					var y = e.originalEvent.pageY - $(this).offset().top; 

					this.x2 = x* (this.naturalWidth/this.width);
					this.y2 = y* (this.naturalHeight/this.height);
					
					canvas.clear();
					$(this).triggerHandler("drawNote");
					
    			});



    			var img = this;
    			$(document).on('mouseup.Note',function(e){

			    	var x = e.originalEvent.pageX - $(img).offset().left;
					var y = e.originalEvent.pageY - $(img).offset().top; 

					img.x2 = x* (img.naturalWidth/img.width);
					img.y2 = y* (img.naturalHeight/img.height);

					canvas.clear();
					$(img).triggerHandler("drawNote");


			       $(img).off('mousemove.Note');
			       $(this).off('mouseup.Note');
    			});				

		    },
		    dragstart:function(e){
		    	e.originalEvent.preventDefault();
		    	e.originalEvent.stopPropagation();
		    },
		    drawNote:function()
		    {
		    	

				var x = Math.min(this.x1,this.x2);
				var y = Math.min(this.y1,this.y2);
				var w = Math.abs(this.x1-this.x2);
				var h = Math.abs(this.y1-this.y2);


		    	//stickyNote(this.context,x,y,sqr,sqr);
		    	stickyNote(this.context,x,y,w,h);

			    function stickyNote(ctx,x,y,w,h)
			    {
			    	ctx.save();

			    	ctx.fillStyle="#ccc";

			    	ctx.beginPath();
			    	

					var sqr = Math.max(w,h);

			    	var x2 = x+w;
			    	var y2 = y+h;


			    	ctx.restore();

			    	ctx.beginPath();
			    	ctx.moveTo(x,y);
			    	ctx.bezierCurveTo(x,y,x+5,y2-5,x+5,y2-5);
			    	ctx.bezierCurveTo(x+10,y2-10,x2,y2,x2,y2);
			    	ctx.bezierCurveTo(x2,y2,x2,y,x2,y);
			    	ctx.bezierCurveTo(x2,y,x,y,x,y);




			    	var grd=ctx.createLinearGradient(x,y2,x+300,y2-300);
			    	grd.addColorStop(0,"yellow");
			    	grd.addColorStop(0.05,"#fffaaf");
			    	grd.addColorStop(0.4,"yellow");

			    	ctx.fillStyle=grd;
			    	ctx.fill();

			    	ctx.restore();

			    	ctx.shadowBlur=8;
			    	ctx.shadowOffsetY=2;
			    	ctx.shadowOffsetX=-2;
			    	ctx.shadowColor="#999";

			    	var grd=ctx.createRadialGradient(x+(w/2),y+10,1,5+(x+(w/2)),y+10,20);
			    	grd.addColorStop(0,"red");
			    	grd.addColorStop(0.9,"white");
			    	grd.addColorStop(1,"red");


			    	ctx.beginPath();
			    	ctx.fillStyle=grd;
			    	ctx.arc(x+(w/2),y+10,8,0,2*Math.PI);
			    	ctx.fill();
			    }	

		    }

		});	
	}
	this.disabled=function()
	{
		$('.screenHolder>img').unbind('mousedown dragstart drawNote');
	}
}	
var Blur = function()
{	
	
	this.cursor='http://i.imgur.com/JkNl9iQ.png';		
	this.init=function(){
		this.initSlider();	
		objManager.controls.setActiveTool(this);		
	}
	this.enabled = function()
	{
		this.disabled();
		var self = this;
		$('.screenHolder>img').bind({
		    mousedown: function(e)
		    {			    	
		   		
		   		var canvas = new CanvasObj();
		    	canvas.createNew(); 
		    	canvas.setDimensions(this.naturalWidth,this.naturalHeight); 
		    	canvas.lineWidth(self.blursize); 
		    
		    	canvas._context.lineCap = 'round';
		    	canvas._context.lineJoin = 'round';
		    	canvas.appendCanvasTo($(this).parent());
				//canvas.strokeColor(objManager.color); 
		    	

				var pattern = document.createElement('canvas');
				pattern.width = 8;
				pattern.height = 8;
				var pctx = pattern.getContext('2d');
				pctx.fillStyle = "#ccc";
				pctx.fillRect(0,0,8,8);
				pctx.beginPath();
				pctx.moveTo(0, 0);
				pctx.lineTo(0, 4);
				pctx.lineTo(4, 4);
				pctx.lineTo(4, 0);
				pctx.closePath();
				pctx.fillStyle = "#fff";
				pctx.fill();




				var pattern = canvas._context.createPattern(pattern, "repeat");
		    	canvas._context.strokeStyle = pattern;	    	

				
		    	var x = e.originalEvent.pageX - $(this).offset().left;
				var y = e.originalEvent.pageY - $(this).offset().top; 
			
				var x = x* (this.naturalWidth/this.width);
				var y = y* (this.naturalHeight/this.height);

		      	this.lastDragXY = [x,y];
		      	canvas.beginPath(); 
		      	canvas.lineTo(x,y);
		      	canvas.lineTo(x+1,y+1);
		      	canvas.stroke();	

		      	this.canvas = null;
				this.canvas = canvas;

				$(this).on('mousemove.Blur',function(e)
				{

	    	    	var x = e.originalEvent.pageX - $(this).offset().left;
	    			var y = e.originalEvent.pageY - $(this).offset().top; 

	    			var x = x*(this.naturalWidth/this.width);
	    			var y = y*(this.naturalHeight/this.height);

	    			posX = this.lastDragXY[0] - x;
	    			posY = this.lastDragXY[1] - y;
	    			range = 10;
			    					    	
		        	if( ( Math.abs(posX) >range ) || ( Math.abs(posY) >range ) )
		        	{
		        		this.lastDragXY = [x,y]; 	
			    		
			    		canvas.lineTo(x,y);		    		
			    		canvas.stroke();		   
		        	}
				});

		      	var image = this;
				$(document).on('mouseup.Blur',function(e){
					$(image).off("mousemove.Blur");
					$(image).trigger("pixelate",{'f':'tets'});						
					$(this).off('mouseup.Blur');
				 });						

		    },
		    pixelate:function(e)
		    {

		    	var img = this;
		    	var canvas = this.canvas;
		    	var ctx = canvas._context;

		    	var iw = img.naturalWidth;
		    	var ih = img.naturalHeight;
		    	var w = Math.round((10/self.blursize)*iw); 
		    	var h = Math.round((10/self.blursize)*ih);


    			ctx.mozImageSmoothingEnabled = false;
		    	ctx.imageSmoothingEnabled = false;
		    	ctx.imageSmoothingEnabled = false;
		    		


		    	ctx.globalCompositeOperation = 'source-in';
		    	ctx.drawImage(img, 0, 0, iw, ih, 0, 0, iw, ih);   //paste img onto drawn path
		    	

				var sCanvas = new CanvasObj();
				sCanvas.createNew();
				sCanvas.setDimensions(iw,ih);
				var ctx = sCanvas._context;
    			ctx.mozImageSmoothingEnabled = false;
		    	ctx.imageSmoothingEnabled = false;
		    	ctx.imageSmoothingEnabled = false;					
		    	ctx.drawImage(canvas._canvas, 0, 0, w, h);  //draw a small version


		    	if(typeof this.blurCanvas == 'undefined')
		    	{
					var bCanvas = new CanvasObj();
					bCanvas.createNew();
					bCanvas.setDimensions(iw,ih);
					this.blurCanvas = bCanvas;
				}else{
					bCanvas = this.blurCanvas;
				}
				var ctx = bCanvas._context;
    			ctx.mozImageSmoothingEnabled = false;
		    	ctx.imageSmoothingEnabled = false;
		    	ctx.imageSmoothingEnabled = false;					
		    	ctx.drawImage(sCanvas._canvas, 0, 0, w, h, 0, 0, iw, ih); //draw a big version
		    	bCanvas.appendCanvasTo($(this).parent());

		    	objManager.undoRedo.addTo(bCanvas._canvas);	

		
		    	$(sCanvas._canvas).remove();
		    	$(canvas._canvas).remove();
		    	//$(this).css('opacity','0.2');
		    	setTimeout(function(){objManager.preRender.render(img)},0);
		    },			    
		    dragstart:function(e){
		    	e.originalEvent.preventDefault();
		    	e.originalEvent.stopPropagation();
		    }
		});	
		
	}
    this.initSlider = function(){
    	this.blursize = 30;
    	var template = '<div id="blurSizeSlider" style="height:100px; width:40px; margin:auto; border:none;" class="ui-slider ui-slider-vertical ui-widget ui-widget-content " aria-disabled="false">'+
				'<img src="http://i.imgur.com/QxON0tb.png" style="width:40px; height:100px; position:absolute;top:0;">'+
				'<a class="ui-slider-handle ui-state-default " href="#"></a>'+
				'</div>';	
		$('#secondaryTools').html('');
		$(template).appendTo('#secondaryTools');

		var self = this;
		$('#blurSizeSlider').slider({
			min: 10,
			max: 50,	
			step: 1,
			orientation: "vertical",
			value: 30,
		  slide: function( event, ui ) {
		  	self.blursize = ui.value;
		  },
		  stop: function( event, ui ) {			    			  	
		  	self.blursize = ui.value;
		  }
		});		
    }		
	this.disabled = function()
	{
		$('.screenHolder>img').unbind("dragstart mousemove mousedown");	
	}			
}
var Crop = function()
{
	this.cursor='http://i.imgur.com/OztbQBF.png';		
	this.init=function(){
		objManager.controls.setActiveTool(this);	
	}
	this.enabled=function()
	{
		this.disabled();
		$('.screenHolder>img').bind({
		    mousedown: function(e)
		    {

    	    	var x = e.originalEvent.pageX - $(this).offset().left;
    			var y = e.originalEvent.pageY - $(this).offset().top; 	    	
    			var x1 = x*(this.naturalWidth/this.width);
    			var y1 = y*(this.naturalHeight/this.height);



		    	dashedLine = function (x1, y1, x2, y2, dashLen, ctx) {
		    	    if (dashLen == undefined) dashLen = 2;
		    	    ctx.moveTo(x1, y1);

		    	    var dX = x2 - x1;
		    	    var dY = y2 - y1;
		    	    var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
		    	    var dashX = dX / dashes;
		    	    var dashY = dY / dashes;

		    	    var q = 0;
		    	    while (q++ < dashes) {
		    	        x1 += dashX;
		    	        y1 += dashY;
		    	        ctx[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
		    	    }
		    	    ctx[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);
		    	};
		    	//And you can use this as 
		    	
		    	drawDashedRect = function(x1,x2,y1,y2,lineWidth,ctx){
		    		var w = x2 - x1;
		    		var h = y2 - y1;

					dashedLine(x1, y1, x1+w, y1, lineWidth, ctx);
					dashedLine(x1+w, y1, x1+w, y1+h, lineWidth, ctx);
					dashedLine(x1+w, y1+h, x1, y1+h, lineWidth, ctx);
					dashedLine(x1, y1+h, x1, y1, lineWidth, ctx);						
		    	}


    			var canvas = new CanvasObj();
    			canvas.createNew();
    			canvas.setDimensions(this.naturalWidth,this.naturalHeight);
    			canvas.appendCanvasTo($(this).parent());	

    			var ctx = canvas._context;
    			ctx.rect(x1,y1,10,10);
    			ctx.stroke();	    				    			





    			var img = this;
    			$(document).on('mousemove.Crop',function(e){
			    	var x = e.originalEvent.pageX - $(img).offset().left;
					var y = e.originalEvent.pageY - $(img).offset().top; 
					
					if(x>img.width){x=img.width}
					if(y>img.height){y=img.height}
					if(x<0){x=0}
					if(y<0){y=0}							

					var x2 = x*(img.naturalWidth/img.width);
					var y2 = y*(img.naturalHeight/img.height);



					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.clearRect(0,0,img.naturalWidth,img.naturalHeight);
					ctx.beginPath();


					ctx.strokeRect(x1,y1,x2-x1,y2-y1);
					ctx.save();
					ctx.strokeStyle="#fff";
					drawDashedRect(x1,x2,y1,y2,8,ctx);
					ctx.stroke();	
					ctx.restore();	
										
    			});


    			
    			$(document).on('mouseup.Crop',function(e){	
    				$(canvas._canvas).remove();


			    	var x = e.originalEvent.pageX - $(img).offset().left;
					var y = e.originalEvent.pageY - $(img).offset().top; 
					
					if(x>img.width){x=img.width}
					if(y>img.height){y=img.height}
					if(x<0){x=0}
					if(y<0){y=0}		

					var x2 = x*(img.naturalWidth/img.width);
					var y2 = y*(img.naturalHeight/img.height);			

					img.x1 = Math.min(x1,x2);
					img.y1 = Math.min(y1,y2);  
					
					img.x2 = Math.max(x1,x2);
					img.y2 = Math.max(y1,y2);						
												

			        $(this).off('mousemove.Crop');
			        $(this).off('mouseup.Crop');

			        if(img.x1==img.x2){return}
			        if(img.y1==img.y2){return}
			        $(img).triggerHandler("crop");
    			});				

		    },
		    dragstart:function(e){
		    	e.originalEvent.preventDefault();
		    	e.originalEvent.stopPropagation();
		    },
		    crop:function()
		    {

		    	var pImage = this;

		    	var image = new Image();
		    	
		    	image.onload = function()
		    	{
		    		var w = w2 = Math.round(1*(pImage.x2-pImage.x1));
		    		var h = h2 = Math.round(1*(pImage.y2-pImage.y1));



		    		var startX = Math.round(Math.min(pImage.x1,pImage.x2));
		    		var startY = Math.round(Math.min(pImage.y1,pImage.y2));

		    		var container = $(pImage).parent();



		    		var cropped = new CanvasObj();
		    		cropped.createNew();
		    		
		    		//cropped.setImage(image);
		    		

		    		/*
			    	var minHeight = $(container).parent().height();
			    	var minWidth = $(container).parent().width();

			    	

			    	if((w<minWidth)&&(h<minHeight)) //if smaller than minh and minw
					{
						if(w>h)
						{
							scale = 1/(w/minWidth);
						}else{						
							scale = 1/(h/minHeight);	
						}

						var h2 = h*scale;
						var w2 = w*scale;


					}

					*/


					cropped.setDimensions(w2,h2);
					cropped._context.drawImage(image,startX,startY,w,h,0,0,w2,h2);	
					image_data = cropped._canvas.toDataURL('image/jpeg',1);
					
					objManager.paste.imageHandler(image_data);


					/*		    		
					var el = $("<img>").attr('src',image_data);
		    		el.appendTo($(container));
		    		objManager.undoRedo.addTo(el);
	
					objManager.controls.reEnableActive();

		    		$(pImage).hide();
					
					setTimeout(function(){objManager.preRender.render(el)},0);
					*/
		    	}


		    	var src = $(this).attr('src');
		    	if(src.indexOf('http://')!=-1)
		    	{
		    		image.crossOrigin = "Anonymous"; 
		    	}			
		    	image.src = src;
		  
		    }

		});	
	}
	this.disabled=function()
	{
		$('.screenHolder>img').unbind('mousedown dragstart drawArrow crop');
	}		
}
var Save = function()
{
	this.init=function()
	{
		$('#tool_save').css('opacity','0.2').off('click');
		$('#feedbackBar').html("Saving screens...");
		$('#uploadProgress').slideDown("fast",function(){
			objManager.preRender.renderAllForSaving(objManager.save.combineEdits);
		});	
	}
	this.updateProgress=function()
	{	
		if(objManager.uploadQueue.length==$('.screenHolder').length)
		{
			$('#feedbackBar').html("Uploading Image 1/"+objManager.uploadQueue.length);
			objManager.imgur.init();
		}
	}
	this.combineEdits =function()
	{		
		$('.screenHolder').each(function(i){
			var image = new Image();
			 
			image.onload = function()
			{
				var pScreen = new CanvasObj();
				pScreen.createNew();
				pScreen.setDimensions(image.width,image.height);
				pScreen.setImage(image);					
				objManager.uploadQueue.push({'index':image.index,"data":pScreen._canvas.toDataURL('image/jpeg',1).replace('data:image/jpeg;base64,','')});
				objManager.save.updateProgress();
			}	
			image.index = i;
			var src = $(this).children('img:visible').attr('src');
			if(src.indexOf('http://')!=-1)
			{
				image.crossOrigin = "Anonymous"; //if loaded from img?
			}			
			image.src = src;

		});											
	}
}
var ImgurManager = function()
{
	this.init=function()
	{
		this.imageIDs = new Array();
		this.imageProgress = new Array(objManager.uploadQueue.length);
		this.token='';
		this.tokenTime();
		//this.upload();

		//id: 2155eeeb7688121
		//sec: 9e31f8a2ad10657f25976904cad74f48a6adb369
		//https://imgur.com/?state=APPLICATION_STATE#
		//access_token=14aa824deda70fec4404fb1b134067dca8d7d766&
		//expires_in=2419200&
		//token_type=bearer&
		//refresh_token=907a76d40e05a65fd8e70c49f390a20bf6af16d3
		//&account_username=coding852&account_id=34279801
	}
	this.tokenTime=function(){

		$.ajax({ 		
			    url: 'https://api.imgur.com/oauth2/token',
			    headers: {
			        'Authorization': 'Client-ID 2155eeeb7688121'
			    },
			    type: 'POST',
			    data: {
			    	'client_id':'2155eeeb7688121',
			    	'refresh_token':'907a76d40e05a65fd8e70c49f390a20bf6af16d3',
			    	'client_secret':'9e31f8a2ad10657f25976904cad74f48a6adb369',
			    	'grant_type':'refresh_token'
			    },
			    success: function(data) 
			    {					    	
			    	objManager.imgur.token = data.access_token;
			    	objManager.imgur.upload(); 
			    		//console.log(data.access_token);
			 	},			 	
	 		 	tryCount : 0,
	 		 	retryLimit : 5,
	 		 	error : function(xhr, textStatus, errorThrown ) 
	 		 	{
	 		 		this.tryCount++;
	 	 	        if (this.tryCount <= this.retryLimit) {
	 	 	            //$.ajax(this);
	 	 	            setTimeout(function(x){$.ajax(x)},1000,this);
	 	 	            return;
	 	 	        }            	 	     
	 		 	}				 	
			});
	}
	this.upload=function()
	{
		var Q = objManager.uploadQueue;
		for(i=0;i<Q.length;i++)
		{
			var image_data = Q[i].data;	
			var index = Q[i].index;		
			$.ajax({ 
				xhr: function() {
				    var xhr = jQuery.ajaxSettings.xhr();
				    if(xhr instanceof window.XMLHttpRequest) {
				    	var self = this;
				        xhr.upload.addEventListener('progress', function(event)
				        {
					        	var percent = 0;
					        	var position = event.loaded || event.position; /*event.position is deprecated*/
					        	var total = event.total;
		
					        	objManager.imgur.updateProgressBars(self.index,position,total);			        	
				        }, false);
				    }
				    return xhr;
				},				
			    url: 'https://api.imgur.com/3/image',
			    headers: {
			        'Authorization': 'Bearer '+objManager.imgur.token
			    },
			    type: 'POST',
			    data: {
			        'image': image_data
			    },
			    index: index,
			    success: function(data) 
			    {					    	
			    	objManager.imgur.imageIDs.push({index:this.index,id:data.data.id,deleteHash:data.data.deletehash});			     	
			     	objManager.imgur.updateProgress();			    
			 	},			 	
	 		 	tryCount : 0,
	 		 	retryLimit : 5,
	 		 	error : function(xhr, textStatus, errorThrown ) 
	 		 	{
	 		 		this.tryCount++;
	 	 	        if (this.tryCount <= this.retryLimit) {
	 	 	            //$.ajax(this);
	 	 	            setTimeout(function(x){$.ajax(x)},1000,this);
	 	 	            return;
	 	 	        }            	 	     
	 		 	}				 	
			});	
		}
	}
	this.updateProgressBars=function(index,pos,total)
	{
		this.imageProgress[index] = {};
		this.imageProgress[index].pos = pos;
		this.imageProgress[index].total = total;

		var position =0;
		var total = 0;
		$.each(this.imageProgress,function(i,v){
			if(typeof v =='undefined'){return;}
			position += v.pos;
			total += v.total;
		});

		
		percent = Math.ceil(position / total * 100) + '%';
		

		$('#progressBar').css('width',percent);
		$('#uploadPercentage').html(percent);			
	}	
	this.updateProgress =function()
	{
		var upped = this.imageIDs.length;
		var total = objManager.uploadQueue.length;
		$('#feedbackBar').html("Uploading Image "+(upped+1)+"/"+total);

		if(upped==total)
		{
			this.updateDB();
		}
	}
	this.updateDB = function()
	{
		//var data = JSON.stringify(this.imageIDs); 

		var orderedIDs = new Array();
		var delHash = new Array();
		for (var i = this.imageIDs.length - 1; i >= 0; i--) 
		{
			orderedIDs[this.imageIDs[i].index] = this.imageIDs[i].id;
			delHash[this.imageIDs[i].index] = this.imageIDs[i].deleteHash;
		}

		var ids = orderedIDs.join(',');
		var hash = delHash.join(',')
		
		var path = window.location.href;
		var path = path.substring(0, path.lastIndexOf('/'));
		var url = path+'/?s='+ids;
		var delUrl = path+'/?s='+ids+'&h='+hash;


		$('#feedbackBar').html("Success! Upload Complete.");

		$('#clipboard_textarea1').val(url);
		$('#clipboard_textarea2').val(delUrl);
		$('#goToLink1').attr('href',url);
		$('#goToLink2').attr('href',delUrl);

		$('#uploadComplete').slideDown('fast');		
	}				
}
var PasteMachine=function(showConsole)
{
	this.outputAs;
	this.createNew=function() {
		
		
		$('<div>').css({
						'height':'1px',
						'width':'1px',
						'opacity':'0',
						'top':'0',
						'line-height':'1px',
						'overflow':'hidden',
						'position':'fixed'
					}).attr({
						'id':'pasteCatcher',
						'contenteditable':'true'
					}).appendTo($('body'));
	
		this.enabled();

	}
	this.enabled=function()
	{
		var pm = this;


		$(document).on('paste.pasteMachine',function(e)
		{
			if(pm.pastedOne){return;}
	
			if($('#pasteCatcher').not(':focus'))					
			{				
				$('#pasteCatcher').focus();
			}
			pm.pastedOne = true;
			pm.handlepaste(e.originalEvent);
			
			$(this).on('keyup.pasteMachine',function(){
				pm.pastedOne = false;
				$(this).off('keyup.pasteMachine');	
			});			
		});

		$('#pasteCatcher').focus();

		$('#pasteCatcher').focusout(function() {
		    setTimeout(function() {
		    	if($(document.activeElement).is("textarea")){return;}// incase its a textarea then dont refocus
		        $('#pasteCatcher').focus();
		    }, 0);
		});

		/*
		$(document).on('mousedown.pasteMachine',function(){
		    setTimeout(function() {
		    	if($(document.activeElement).is("textarea")){return;}// incase its a textarea then dont refocus
		    	if($(document.activeElement).is('.ui-slider-handle')){return} //is slider handle
		    	if($(document.activeElement).closest('#textSizeSlider').length > 0){return} //is near slider

		        $('#pasteCatcher').focus();
				console.log('mfocusin');
		    }, 0);				
			
		});*/				
	}
	this.disabled = function()
	{
		$(document).off('paste.pasteMachine');	
		$('#pasteCatcher').unbind('focusout');
	}
	this.handlepaste=function(e)
	{	
	    log('handlepaste');
		if (e.clipboardData) //for croOS specifically but also catches othes CR + browsers
		{
			var pm = this;
			var items = e.clipboardData.items;
			if (items) 
			{
				for (var i = 0; i < items.length; i++) 
				{
	    			if (items[i].type.indexOf("image") !== -1) 
	    			{
	    				var blob = items[i].getAsFile();
	    				var reader = new FileReader();
	                    reader.onload = function(event)
	                    {
	                    	log('call imageHandler from clipboardData.items');
	    		    		pm.imageHandler(event.target.result);
	                    }; 
	    	            reader.readAsDataURL(blob);
	    			}
				}
				return;
			}
		} 

	    if (e && e.clipboardData && e.clipboardData.getData) //works on FF, chromes(windows), safari
	    { 
	    	log('call waitforpastedata route 1');
	    	this.waitforpastedata();
	        return false;
	    }
	    else {
	    	log('call waitforpastedata route 2');
	        this.waitforpastedata();
	        return true;
	    }
		
	}
	this.waitforpastedata=function() 
	{
		var pm = this;
		(function retry(x)
		{
			log('wait for image. retry: '+x);
			if ($('#pasteCatcher').children() && $('#pasteCatcher').children().length > 0) 
			{
				log('pasteCatcher recieved image, call processpaste');
			    pm.processPaste();
			    return;
			}

			if($('#pasteCatcher').html()!=""){
				log('text was pasted?');
				$('#pasteCatcher').html("");
				return;
			}

			if(x){x--;}else{return;}		
			setTimeout(function(x){retry(x)},20,x);			
		})(50); //retry 100 times at 20 intervals (1s)

	}	
	this.processPaste=function() 
	{
	    pasteddata = $('#pasteCatcher').html();
	    src = $('<div>').append(pasteddata).find('img').attr('src');
	    log('call imageHandler src:'+src);
	    this.imageHandler(src);
	}
	this.imageHandler=function(image_data)
	{
		var pm = this;
	    var image = new Image();
		//image.crossOrigin = "Anonymous";	    
	    image.onload=function()
	    {	    	
	    	log('imageHandler loaded image');

			var id = objManager.getNextScreenId();



	    	
	    	if(pm.outputAs=='canvas')
	    	{	
	    		log('appending as canvas.');
		    	var canvas = new CanvasObj();
		    	canvas.createNew();
		    	canvas.setDimensions(image.width,image.height);
		    	canvas.draw(image);
		    	canvas.appendCanvasTo(pm.outputTo);
				$('#pasteCatcher').html('');		    	
		    	return;
		    }
	    	if(pm.outputAs=='image')
	    	{	

				var canvas = new CanvasObj();
				canvas.createNew();
				canvas.setDimensions(image.width,image.height);
				canvas.setImage(image);
				var src = canvas._canvas.toDataURL('image/jpeg',1);	

				$('<img src="'+src+'"/>').on('load',function(){

					var $out = $('<div class="screenHolder" id="screen'+id+'" screenId="'+id+'" style="width:'+image.width+'px; height:'+image.height+'px">');
					$out.append(objManager.templates.getScreenOptionsMenu()).appendTo($('.container'));

					$(this).appendTo($out);						
					pm.success();
					$('html, body').animate({scrollTop: $("#screen"+id).offset().top}, 500);
				});

				$('#pasteCatcher').html('');

				
				$('<img src="'+src+'" id="revert'+id+'">').on('load',function(){
					$(this).appendTo('#revertHolder');
				});



				var ratio = 1;
				if(image.width > 100)
				    ratio = 100 / image.width;
				else if(image.height > 100)
				    ratio = 100 / image.height;


				canvas._context.scale(ratio,ratio);
				image_data = canvas._canvas.toDataURL('image/jpeg',1);

				$('<img id="thumb'+id+'"" src="'+image_data+'">').on('load',function(){
			
					$(this).appendTo('.thumbnails');
				}).on('click',function(){
					$('html, body').animate({scrollTop: $("#screen"+id).offset().top}, 500);				
				});	

	
		    }		    
	    	log('no output type specified. Choices are image or canvas');

	    }
	    image.onerror=function(){
	    	log('erorr loading image :(');
	    }

	    if(typeof image_data=='undefined'){console.log('image data undefined');return;}

		if(image_data.indexOf('http://')!=-1)
		{
			image.crossOrigin = "Anonymous"; //if loaded from img
		}
	    image.src = image_data;
	}
	var CanvasObj=function()
	{
		var _canvas;
		var _context;

		this.createNew=function()
		{
			_canvas = document.createElement('canvas');
			_context = _canvas.getContext("2d");
			this._canvas = _canvas;
			this._context = _context;
		}
		this.appendCanvasTo =function(el)
		{
			$(el).append(_canvas);
		}
		this.setDimensions=function(w,h)
		{
			_canvas.width = w;
			_canvas.height = h;
		}
		this.draw=function(image)
		{
			_context.drawImage(image,0,0,_canvas.width,_canvas.height);
		}
		this.setImage = function(image)
		{
			_context.drawImage(image, 0, 0, _canvas.width, _canvas.height); 	
		}		
	}
	var log = function(s)
	{
		if(!showConsole){return}
		console.log(s);
	} 		
}
var CanvasObj=function()
{
	var _canvas;
	var _context;
	var _pixelArray;

	this.createNew=function()
	{
		_canvas = document.createElement('canvas');
		_context = _canvas.getContext("2d");
		_context.lineWidth = 2;

		this._canvas = _canvas;
		this._context = _context;

		this._context.imageSmoothingEnabled = false;

	}
	this.getHeight = function()
	{
		return _canvas.height;
	}
	this.getWidth = function()
	{
		return _canvas.width;
	}	
	this.setDimensions=function(w,h)
	{
		_canvas.width = w;
		_canvas.height = h;
	}
	this.setImage = function(canvas)
	{			
		//_context.clearRect(0, 0, _canvas.width, _canvas.height);
		if((canvas.width==0)||(canvas.height==0)){console.log('no w or h return');return;}
		_context.drawImage(canvas, 0, 0, _canvas.width, _canvas.height); 	
		//a = _context.getImageData(0,0,_canvas.width,_canvas.width);
		//b = _canvas.toDataURL();
		//$('body').append('<img src="'+b+'">');
		//_context.putImageData(a,0,0);
	}	
	this.beginPath = function()
	{	
		_context.lineCap="round";
		_context.beginPath();
	}
	this.strokeColor=function(color)
	{
		_context.strokeStyle = color;
	}
	this.lineTo = function(x,y)
	{
		_context.lineTo(x,y);
	}
	this.lineWidth = function(w)
	{
		_context.lineWidth = w;
	}
	this.stroke = function()
	{
		_context.stroke();
	}
	this.getPixelColor = function(x,y)
	{
		x = Math.round(x);
		y = Math.round(y);		
		var i = (x*4)+(y*_canvas.width*4);
		return [ _pixelArray[i], _pixelArray[i+1], _pixelArray[i+2], _pixelArray[i+3] ];
	}
	this.setPixelArray = function()
	{
		_pixelArray = _context.getImageData(0, 0, _canvas.width, _canvas.height).data;		
	}
	this.combineCanvas = function(canvas)
	{
		_context.drawImage(canvas, 0, 0,_canvas.width, _canvas.height); 
	}
	this.getCanvas = function()
	{
		return _canvas;
	}
	this.dataOut = function()
	{
		return _canvas.toDataURL();
	}
	this.appendCanvasTo =function(el)
	{
		$(el).append(_canvas);
	}
	this.clear = function()
	{
		_context.clearRect(0,0,_canvas.width,_canvas.height);
	}
}
var PreRender = function()
{
	this.render=function(scrImg,trackProgress)
	{

		var count = 0;
		count += $(scrImg).siblings('textarea').length;
		count += $(scrImg).siblings('canvas').length;
		count += $(scrImg).siblings('img').length;

		if(count==0)
		{
			if(typeof trackProgress!='undefined')
			{	
				objManager.preRender.trackProgress();					
			}
			return;
		}

		var edits = new CanvasObj();
		edits.createNew();
		edits.setDimensions($(scrImg).get(0).naturalWidth,$(scrImg).get(0).naturalHeight);


		if($(scrImg).siblings('textarea').length>0)
		{
			$(scrImg).siblings('textarea').each(function(i){
				if($(this).val().length==0){return;}
				canvas = objManager.text.render.call(this);
				edits.setImage(canvas);	
			});
		}



		if($(scrImg).siblings('canvas').length>0)
		{
			$(scrImg).siblings('canvas').each(function(i){
				edits.setImage(this);
			});
		}



		if($(scrImg).siblings('img:visible').length>0)
		{
			var src = $(scrImg).siblings('img:visible').attr('src');
		}else{
			var src = $(scrImg).attr('src');
		}



		var image = new Image()
		image.onload=function()
		{
			var rendered = new CanvasObj();
			rendered.createNew();
			rendered.setDimensions(image.width,image.height);
			rendered.setImage(image);
			rendered.setImage(edits._canvas);
			image_data = rendered._canvas.toDataURL('image/jpeg',1);

			var img = $('<img src="'+image_data+'" id="rendered'+image.ID+'">').on('load',function(){$(this).appendTo('#preRendered')});
			$('#rendered'+image.ID).replaceWith(img);

			if(typeof trackProgress!='undefined')
			{
				objManager.preRender.trackProgress();
			}
			

		}

		image.ID = $(scrImg).parent().attr('screenId');
		
		if(src.indexOf('http://')!=-1)
		{
			image.crossOrigin = "Anonymous"; //if loaded from img?
		}			
		image.src = src;		


		//render text
		//render canvases
		//assign to #preRendered
	}
	this.assignPreRendered=function()
	{
		//if(!this.checkForNewEdits()){return;}
		$('.screenHolder').each(function(i){
			var count = 0;
			count += $(this).children('textarea').length;
			count += $(this).children('canvas').length;
			
			if(count==0)
			{					
				return;
			}

			var id = $(this).attr('screenId');
			$(this).children('textarea').remove();
			$(this).children('canvas').remove();
			$(this).children('img').remove(); //hidden for ON PASTE? //none hidden because we need to remove it to replace it with rendered				
			var el = $('#rendered'+id).clone().removeAttr('id');
			$('#rendered'+id).remove();
			el.appendTo(this);
		});

		objManager.controls.reEnableActive();			
	}
	this.checkForNewEdits=function()
	{
		var count = 0;
		count += $('.screenHolder>textarea').length;
		count += $('.screenHolder>canvas').length;
		
		if(count==0)
		{
			objManager.controls.reEnableActive();
			return false;
		}
		if($('.screenHolder>textarea').length>0)
		{
			objManager.text.compileToCanvasAll();
		}
		return true;
	}
	this.renderAllForSaving = function(callback)
	{
		this.callback = callback;
		this.totalRendered = 0;
		var self = this;
		$('.screenHolder>img:visible').each(function(i){
			self.render(this,true);
		});
	}
	this.trackProgress = function()
	{
		this.totalRendered++;
		if(this.totalRendered==$('.screenHolder>img:visible').length)
		{
			this.assignPreRendered();
			this.callback();
		}
	}			
}	
var SaveAs = function()
{
	this.init=function()
	{
		(function(view) {
		"use strict";
		var
		          Uint8Array = view.Uint8Array
		        , HTMLCanvasElement = view.HTMLCanvasElement
		        , is_base64_regex = /\s*;\s*base64\s*(?:;|$)/i
		        , base64_ranks
		        , decode_base64 = function(base64) {
		                var
		                          len = base64.length
		                        , buffer = new Uint8Array(len / 4 * 3 | 0)
		                        , i = 0
		                        , outptr = 0
		                        , last = [0, 0]
		                        , state = 0
		                        , save = 0
		                        , rank
		                        , code
		                        , undef
		                ;
		                while (len--) {
		                        code = base64.charCodeAt(i++);
		                        rank = base64_ranks[code-43];
		                        if (rank !== 255 && rank !== undef) {
		                                last[1] = last[0];
		                                last[0] = code;
		                                save = (save << 6) | rank;
		                                state++;
		                                if (state === 4) {
		                                        buffer[outptr++] = save >>> 16;
		                                        if (last[1] !== 61 /* padding character */) {
		                                                buffer[outptr++] = save >>> 8;
		                                        }
		                                        if (last[0] !== 61 /* padding character */) {
		                                                buffer[outptr++] = save;
		                                        }
		                                        state = 0;
		                                }
		                        }
		                }
		                // 2/3 chance there's going to be some null bytes at the end, but that
		                // doesn't really matter with most image formats.
		                // If it somehow matters for you, truncate the buffer up outptr.
		                return buffer;
		        }
		;
		if (Uint8Array) {
		        base64_ranks = new Uint8Array([
		                  62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1
		                , -1, -1,  0, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9
		                , 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
		                , -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
		                , 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
		        ]);
		}
		if (HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlob) {
		        HTMLCanvasElement.prototype.toBlob = function(callback, type /*, ...args*/) {
		                  if (!type) {
		                        type = "image/png";
		                } if (this.mozGetAsFile) {
		                        callback(this.mozGetAsFile("canvas", type));
		                        return;
		                }
		                var
		                          args = Array.prototype.slice.call(arguments, 1)
		                        , dataURI = this.toDataURL.apply(this, args)
		                        , header_end = dataURI.indexOf(",")
		                        , data = dataURI.substring(header_end + 1)
		                        , is_base64 = is_base64_regex.test(dataURI.substring(0, header_end))
		                        , blob
		                ;
		                if (Blob.fake) {
		                        // no reason to decode a data: URI that's just going to become a data URI again
		                        blob = new Blob
		                        if (is_base64) {
		                                blob.encoding = "base64";
		                        } else {
		                                blob.encoding = "URI";
		                        }
		                        blob.data = data;
		                        blob.size = data.length;
		                } else if (Uint8Array) {
		                        if (is_base64) {
		                                blob = new Blob([decode_base64(data)], {type: type});
		                        } else {
		                                blob = new Blob([decodeURIComponent(data)], {type: type});
		                        }
		                }
		                callback(blob);
		        };
		}
		}(self));	
	}
	this.srcToFile=function(src,filename)
	{	
		this.init();
	    var image = new Image();
	    image.onload=function(){
			_canvas = document.createElement('canvas');
			_context = _canvas.getContext("2d");
	        _canvas.width = image.width;
	        _canvas.height = image.height;
	        _context.drawImage(image, 0, 0, _canvas.width, _canvas.height); 
	        _canvas.toBlob(function(blob){
	            
	            var a = document.createElement('a');
	        	a.href = window.URL.createObjectURL(blob);
	        	a.download = filename;
	        	a.style.display = 'none';
	        	document.body.appendChild(a);
	        	a.click(); //this is probably the key - simulating a click on a download link
	        	delete a;// we don't need this anymore        	

	        },"image/jpeg", 0.95);
	    }
	    if(src.indexOf('http://')!=-1)
	    {
	    	image.crossOrigin = "Anonymous"; 
	    }			
	    image.src = src;
	    
	}
	this.save=function(id)
	{

		var id = objManager.saveAs.screenId;
		var src = $('#screen'+id).children('img:visible').attr('src');			
		var currentDate = new Date();
	    var day = currentDate.getDate();
	    var month = currentDate.getMonth() + 1;
	    var year = currentDate.getFullYear();
	    var i = parseInt(id)+1;
		

	    objManager.saveAs.srcToFile(src,'printscreen'+i+'_'+year+'_'+month+'_'+day+'.jpg');	
	}
}

function loadColorPicker()
{
	$("#colorFullPicker").spectrum({
	    color: "#fff",
	    showInput: false,
	    chooseText: 'OK',
	    className: "full-spectrum",
	    showInitial: true,
	    showPalette: true,
	    showSelectionPalette: false,
	    clickoutFiresChange: true,
	    maxPaletteSize: 10,
	    preferredFormat: "hex",
	    localStorageKey: "spectrum.demo",
	    move: function (color) {
	        objManager.color = color.toHexString();
	    },
	    show: function () {
			var c = $(this).spectrum('container');
			c.css('left', (parseFloat(c.css('left')) + 50) + 'px');
			c.css('top', (parseFloat(c.css('top')) - 45) + 'px');
	    },
	    beforeShow: function () {
	    
	    },
	    hide: function (color) {
	        objManager.color = color.toHexString();	    
	        //$('#tools').slideUp('fast');	
	    },
	    change: function(color) {		    	
	        objManager.color = color.toHexString();
	    },	
	    palette: [
	        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
	        "rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
	        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
	        "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], 
	        ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", 
	        "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", 
	        "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", 
	        "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", 
	        "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", 
	        "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
	        "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
	        "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
	        "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", 
	        "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
	    ]
	});

	$('.sp-preview').on('mousedown',function(){
		
		//$('#tools').slideDown('fast');

	});
}

