var CanvasManager = function(){}
var canvasManager = new CanvasManager();
CanvasManager.prototype.fn = function(){}
CanvasManager.prototype.putOnCanvas = function (source,h,w)
{
	h=h||source.height;
	w=w||source.width;

	//create a canvas
	canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;

	//apply image source to canvas
	context = canvas.getContext("2d");
	context.drawImage(source,0,0,w,h); 
	
	return canvas;
}
CanvasManager.prototype.getThumbImage = function (source,h,w){

	canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;

	//adjust w/h ratio of thumb
	r = source.height/ source.width;
	x=0;
	y=0;
	_h=h;
	_w=w;
	if(r>1){_w=w/r;x=(w-_w)/2;}else{_h=h*r;y=(h-_h)/2;}
	//return canvasManager.putOnCanvas(canvas,h,w);	
	context = canvas.getContext("2d");
	context.drawImage(source,x,y,_w,_h); 
	return canvas;

}
CanvasManager.prototype.createBoundary = function (top,left,bottom,right){
	canvas = document.createElement('canvas');
	h = bottom-top;
	w = right-left;
	canvas.height = h;
	canvas.width = w;


	context = canvas.getContext("2d");
	//context.beginPath();
	//context.lineWidth="1";
	//context.strokeStyle="red";
	context.rect(0,0,w,h);
	//context.stroke();

	canvas.style.top = top;
	canvas.style.left = left;
	return canvas;	

}