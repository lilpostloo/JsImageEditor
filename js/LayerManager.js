

var LayerManager = function(canvas){
	this.layers = new Array();	
}
LayerManager.prototype.createThumbnail = function(canvas){	
	canvas = canvasManager.getThumbImage(canvas,35,35);	
	return uiManager.addThumbnail(canvas.toDataURL());
}
LayerManager.prototype.newLayer = function(canvas){
	this.centerLayer(canvas);   
    $(canvas).addClass('layer').appendTo('body');    
    var $thumb = this.createThumbnail(canvas);
    obj = {'$thumb':$thumb,'layer':canvas};
    this.regNewLayer(obj);
	uiManager.triggerActiveLayer();	


    actionHistory.setAction({
    	ref:'Layer',
    	obj:obj,
    	undo:function(){
    		bin.redo(this.obj)
    	},
    	redo:function(){
    		bin.undo(this.obj)
    	}
    });   
    return obj;  
}
LayerManager.prototype.regNewLayer=function(obj){
    //obj = {'$thumb':$thumb,'layer':layer}
    this.layers.push(obj);
    //this.makeDraggable(obj.layer);    
    this.applyBindings(obj);
    drag.makeDraggable(obj);
    boundary.redraw();
}
LayerManager.prototype.applyBindings = function(obj) {
    var fn = function(e){
    	if( (e.button!==0) && (e.isTrigger===undefined) )return //not a left click or trigger
    	layerManager.removeActiveClass();
    	obj.active=true;
    	obj.$thumb.addClass('active');
    	$(obj.layer).addClass('active');
    	e.stopPropagation();   	    
    } 

    //bind thumb to click because mousedown taken by Sortable()
    //bind layer to mousedown because triggers before up, need for drag
    obj.$thumb.bind('click',fn); 
    //$(obj.layer).bind('mousedown',fn);  //moved to drag, bcoz conflicts with pencil

}

LayerManager.prototype.removeActiveClass=function(){
	layerManager.layers.map(function(o){o.active=false});
    $('canvas.layer.active').removeClass('active');
	$('ul#layerBar>img.active').removeClass('active');
}
LayerManager.prototype.centerLayer = function(canvas){   
	viewCenterW = $(window).width()/2;
	viewCenterH = $(window).height()/2;
	canvasCenterW = canvas.width/2;
	canvasCenterH = canvas.height/2;

	canvas.style.left = viewCenterW - canvasCenterW;
	canvas.style.top = viewCenterH - canvasCenterH;

}

LayerManager.prototype.getActiveObj=function(){
	obj = false;
	layerManager.layers.some(function(o){ 
		if(o.active){
			obj = o;
			return true;
		}
	});
	return obj;
}
LayerManager.prototype.deleteActiveObj=function(){
	i = false;
	layerManager.layers.some(function(o,j){ 
		if(o.active){
			i = j;
			return true;
		}
	});


	if(i!==false)delete layerManager.layers[i];
}
LayerManager.prototype.updateLayering=function(){
	layerManager.layers.map(function(o,j){
  		var i = o.$thumb.index(); 
  		o.layer.style.zIndex = 1000-i;
  		o.$thumb.attr('id',i);
  		$(o.layer).attr('id',i);
  	})
}



var layerManager = new LayerManager();
