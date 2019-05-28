
//pensize +toolbar
//layering
//resizing canvas if drawing is smaller
//undo redo
//colors

var Pencil = function(){
	this.title = 'Pencil';
	this.iconUrl = 'images/tool_pencil.png';	
	this.cursor = 'images/tool_pencil.png';
}
Pencil.prototype.init = function(){}
Pencil.prototype.start = function(){
	uiManager.toolbar_sizePicker.bar.show();	
	this.layerHolder = layerManager.newLayer(this.getCanvas());	 	
	this.canvas = this.layerHolder.layer;
	this.$thumb = this.layerHolder.$thumb;
	self = this;
	$(document.body).bind('mousedown.Pencil',function(e){
		if(e.button!==0)return;
    	var x = e.originalEvent.pageX - $(this).offset().left;
		var y = e.originalEvent.pageY - $(this).offset().top; 

		self.isWindowSameSize();

		context = self.canvas.getContext("2d");
		self.applyStlye(context);
		context.beginPath(); 
		context.lineTo(x,y);
		context.lineTo(x+1,y+1);
		context.stroke();			
		self.$thumb.attr('src',self.canvas.toDataURL());
		$(this).bind('mousemove.Pencil',function(e)
		{
	    	var x = e.originalEvent.pageX - $(this).offset().left;
			var y = e.originalEvent.pageY - $(this).offset().top; 

    		context.lineTo(x,y);		    		
    		context.stroke();
			self.$thumb.attr('src',self.canvas.toDataURL());

	    });	    
	}).bind('dragstart.Pencil',function(e){
		if(e.button!==0)return;
    	e.originalEvent.preventDefault();
    	e.originalEvent.stopPropagation();
	}).bind('mouseup.Pencil',function(e){
		if(e.button!==0)return;		
		$(this).unbind('mousemove.Pencil');		
	});
}
Pencil.prototype.stop = function(){
	$(document.body).unbind('mousedown.Pencil mouseup.Pencil dragstart.Pencil');
	uiManager.toolbar_sizePicker.bar.hide();
}
Pencil.prototype.applyStlye = function(ctx){
	context.strokeStyle = colorPicker.color;
	context.lineWidth = uiManager.toolbar_sizePicker.size;
	context.lineCap="round";
	context.lineJoin = 'round';
}
Pencil.prototype.getCanvas = function(i){
	canvas = document.createElement('canvas');
	canvas.width = $(window).width();
	canvas.height = $(window).height();

	context = canvas.getContext("2d");
	return canvas;
}
Pencil.prototype.isWindowSameSize = function(){
	//do nothing if same size, else redraw canvas 
	if((this.canvas.width===$(window).width())&&(this.canvas.height===$(window).height()))return;

	canvas = this.getCanvas();
	canvas.getContext("2d").drawImage(this.canvas, 0, 0);

	this.canvas.width = $(window).width();
	this.canvas.height = $(window).height();
	context = this.canvas.getContext("2d");
	context.drawImage(canvas, 0, 0);
	$(canvas).remove();	

}
var pencil = new Pencil();





