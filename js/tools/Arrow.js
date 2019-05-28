var Arrow = function(){
	this.title = 'Arrow Tool';
	this.iconUrl = 'images/tool_arrow.png';	
	this.cursor = 'images/tool_arrow.png';
}
Arrow.prototype.domReady = function(){
}
Arrow.prototype.start = function(){
	this.layerHolder = layerManager.newLayer(this.getCanvas());	 	
	this.canvas = this.layerHolder.layer;
	this.$thumb = this.layerHolder.$thumb;
	self = this;
	$(document.body).bind('mousedown.Arrow',function(e){
		if(e.button!==0)return;
		self.x1 = e.originalEvent.pageX - $(this).offset().left;
		self.y1 = e.originalEvent.pageY - $(this).offset().top; 



		self.isWindowSameSize();

		context = self.canvas.getContext("2d");
				
		self.$thumb.attr('src',self.canvas.toDataURL());
		$(this).bind('mousemove.Arrow',function(e)
		{
	    	self.x2 = e.originalEvent.pageX - $(this).offset().left;
			self.y2 = e.originalEvent.pageY - $(this).offset().top; 

			context.clearRect(0,0,self.canvas.width,self.canvas.height);
			self.drawArrow(context);

			//context.lineTo(x,y);		    		
			//context.stroke();
			self.$thumb.attr('src',self.canvas.toDataURL());

	    });	    
	}).bind('dragstart.Arrow',function(e){
		if(e.button!==0)return;
		e.originalEvent.preventDefault();
		e.originalEvent.stopPropagation();
	}).bind('mouseup.Arrow',function(e){
		if(e.button!==0)return;		
		$(this).unbind('mousemove.Arrow');		
	});

}
Arrow.prototype.drawArrow=function(ctx){
    
    var distance = Math.sqrt( Math.pow((this.x1-this.x2),2) + Math.pow((this.y1-this.y2),2) );

    // arbitrary styling
    ctx.strokeStyle=colorPicker.color;
    ctx.fillStyle=colorPicker.color;
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
Arrow.prototype.drawArrowhead=function(ctx,x,y,radians,d){
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
Arrow.prototype.stop = function(){
	$(document.body).unbind('mousedown.Arrow mouseup.Arrow dragstart.Arrow');	
}
Arrow.prototype.getCanvas = function(i){
	canvas = document.createElement('canvas');
	canvas.width = $(window).width();
	canvas.height = $(window).height();

	context = canvas.getContext("2d");
	this.applyStlye(context);
	return canvas;
}
Arrow.prototype.applyStlye = function(ctx){
	context.strokeStyle = '#fff';
	context.lineWidth = 5;
	context.lineCap="round";
	context.lineJoin = 'round';
}
Arrow.prototype.isWindowSameSize = function(){
	//do nothing if same size, else redraw canvas 
	if((this.canvas.width===$(window).width())&&(this.canvas.height===$(window).height()))return;

	canvas = this.getCanvas();
	canvas.getContext("2d").drawImage(this.canvas, 0, 0);

	this.canvas.width = $(window).width();
	this.canvas.height = $(window).height();
	context = this.canvas.getContext("2d");
	context.drawImage(canvas, 0, 0);
	this.applyStlye(context);
	$(canvas).remove();	
}
var arrow = new Arrow();


