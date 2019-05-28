

var PasteManager = function(){
	this.log = function(log){
		//console.log(log);
	}
}
var pasteManager = new PasteManager(); 
PasteManager.prototype.castPasteCatcher=function(){
	this.$pasteCatcher = $('<div>').css({
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

	//this.enabled();
}
PasteManager.prototype.enablePasting = function(){
	this.castPasteCatcher();
	this.setListener();
	this.maintainFocus();
}
PasteManager.prototype.maintainFocus=function(){
	this.$pasteCatcher.focus();

	this.$pasteCatcher.focusout(function() {
	    setTimeout(function() {
	    	if($(document.activeElement).is("textarea")){return;}// incase its a textarea then dont refocus
	    	if($(document.activeElement).is("input")){return;}// incase its a input then dont refocus
	        
	        $('#pasteCatcher').focus();
	    }, 0);
	});
}
PasteManager.prototype.setListener=function(){
	var self = this
	$(document).bind('paste.pasteManager',function(e)
	{
		if(self.pastedOne){return;}
	
		if(self.$pasteCatcher.not(':focus'))					
		{				
			self.$pasteCatcher.focus();
		}
		self.pastedOne = true;
		self.handlePaste(e.originalEvent);
		
		$(this).on('keyup.pasteManager',function(){
			self.pastedOne = false;
			$(this).off('keyup.pasteManager');	
		});			
	});
}
PasteManager.prototype.handlePaste=function(e){
    this.log('handlepaste');
	if (e.clipboardData) //for croOS specifically but also catches othes CR + browsers
	{
		var self= this;
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
                    	self.log('call imageHandler from clipboardData.items');
    		    		self.imageHandler(event.target.result);
                    }; 
    	            reader.readAsDataURL(blob);
    			}else{
    				self.log('not an image?');
    			}
			}
			return;
		}
	} 

    if (e && e.clipboardData && e.clipboardData.getData) //works on FF, chromes(windows), safari
    { 
    	this.log('call waitforpastedata route 1');
    	this.waitForPasteData();
        return false;
    }
    else {
    	this.log('call waitForPasteData route 2');
        this.waitforpastedata();
        return true;
    }
}
PasteManager.prototype.waitForPasteData=function(){
	var self = this;
	(function retry(x)
	{
		self.log('wait for image. retry: '+x);
		if (self.$pasteCatcher.children() && self.$pasteCatcher.children().length > 0) 
		{
			self.log('pasteCatcher recieved image, call processpaste');
		    self.processPaste();
		    return;
		}

		if(self.$pasteCatcher.html()!=""){
			self.log('text was pasted?');
			self.$pasteCatcher.html("");
			return;
		}

		if(x){x--;}else{return;}		
		setTimeout(function(x){retry(x)},20,x);			
	})(50); //retry 100 times at 20 intervals (1s)
}	
PasteManager.prototype.processPaste=function(){
    this.log('processPaste');	
    pasteddata = this.$pasteCatcher.html();
    src = $('<div>').append(pasteddata).find('img').attr('src');
    this.imageHandler(src);
}
PasteManager.prototype.imageHandler=function(image_data){
	var self = this;
    var image = new Image();
	//image.crossOrigin = "Anonymous";	    
    image.onload=function()
    {	    	
    	var canvas = canvasManager.putOnCanvas(image);
    	layerManager.newLayer(canvas);
    	//drag.icon.trigger('mousedown');
    }
    image.onerror=function(){
    	self.log('erorr loading image :(');
    }

    if(typeof image_data=='undefined'){self.log('Not a valid image? Is it text?');return;}

	if(image_data.indexOf('http://')!=-1)
	{
		image.crossOrigin = "Anonymous"; //if loaded from img
	}
    image.src = image_data;
}
