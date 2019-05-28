var Boundary = function(){
	//redraw on drag/nudge

}
Boundary.prototype.redraw = function(){

	var top;
	var left;
	var bottom;
	var right;

	layerManager.layers.map(function(o){
		//find boundaries

		var t = parseInt(o.layer.style.top);		
		var l = parseInt(o.layer.style.left);
		var b = t + o.layer.height;
		var r = l + o.layer.width;

		if(!top||(top>t))top = t;
		if(!left||(left>l))left = l;
		if(!bottom||(bottom<b))bottom = b;
		if(!right||(right<r))right = r; 
		
	});

	$('.boundary').remove();
	$('.dimensionW').remove();
	$('.dimensionH').remove();

	canvas = canvasManager.createBoundary(top,left,bottom,right);
	$(canvas).addClass('boundary').appendTo('body').fadeOut("slow");

	//add dimension indicators
	var $d = $('<div>').css({left:right,top:bottom}).html(bottom-top)
	.addClass('dimensionH').appendTo('body');
	$d.css('top',bottom-$d.height()).fadeOut("slow");

	var $d = $('<div>').css({left:right,top:bottom}).html(right-left)
	.addClass('dimensionW').appendTo('body');
	$d.css('left',right-$d.width()).fadeOut("slow");



}
var boundary = new Boundary();
