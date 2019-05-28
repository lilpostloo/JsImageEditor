
var Drag = function(){
	this.title = 'Drag';	
	this.iconUrl = 'images/tool_drag.png';
	this.cursor = 'images/tool_drag.png';
}
Drag.prototype.init = function(){
	//var self = this;
}
Drag.prototype.start = function(){

	layerManager.layers.map(function(o){
		$(o.layer).draggable('enable');

		$(o.layer).bind('mousedown.Drag',function(e){
			if( (e.button!==0) && (e.isTrigger===undefined) )return //not a left click or trigger
			layerManager.removeActiveClass();
			o.active=true;
			o.$thumb.addClass('active');
			$(o.layer).addClass('active');
			e.stopPropagation(); 
		}); 
	});

}


Drag.prototype.stop = function(){
	layerManager.layers.map(function(o){
		$(o.layer).draggable('disable');
		$(o.layer).unbind('mousedown.Drag');
	});
}
Drag.prototype.makeDraggable = function(o){
	//called from layerManager on create of new layer
	$(obj.layer).draggable({
	    start:function(){
	        this.startXY=[this.style.left,this.style.top]; 
	    },
	    drag:function(){
	        boundary.redraw();
	    },
	    stop:function(){
	        this.stopXY=[this.style.left,this.style.top];
	        boundary.redraw();
	        actionHistory.setAction({
	            ref:'Drag',
	            layer:this,
	            startXY:this.startXY,
	            stopXY:this.stopXY,
	            undo:function(){        
	                this.layer.style.left = this.startXY[0];
	                this.layer.style.top = this.startXY[1];
	            },
	            redo:function(){
	                this.layer.style.left = this.stopXY[0];
	                this.layer.style.top = this.stopXY[1];

	            }
	        });         
	    },
	    disabled: true
	});

}


var drag= new Drag();
