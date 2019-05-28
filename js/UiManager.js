
var uiColor = {	bgBlue:'#315177',
				iconBlue:'#A5C0E1',
				barBlue:'#19294A',
				handleGrey:'#333'};

var UIManager = function(){
	this.activeTool = false;	
}
var uiManager = new UIManager();
UIManager.prototype.initialize = function(){
	this.buildToolBars();
}
UIManager.prototype.buildToolBars = function(){
	
	this.toolbar_doc = new ToolbarMaker(46,'',20,20)
	.addHandle(0).assign(upload).assign(save).insertDivider(0)
	.assign(backgroundColor).insertDivider(0)	
	.assign(undo).assign(redo).assign(bin);
	

	this.toolbar_edit = new ToolbarMaker('',46,80,20)
	.addHandle(1).assign(drag).assign(pencil).assign(arrow)
	.assign(text)
	//.assign(smudge).assign(text).assign(zoom).assign(crop)
	//.assign(resize).assign(shapes)
	.assign(colorPicker);	



	this.toolbar_sizePicker = new ToolbarMaker('',46,80,70)
	.addHandle(1).drawInput().drawSizers();
	this.toolbar_sizePicker.bar.hide();


}
UIManager.prototype.draw = function(){	
	$(this.toolbar_doc.bar).appendTo('body');
	$(this.toolbar_edit.bar).appendTo('body');
	$(this.toolbar_sizePicker.bar).appendTo('body');

}
UIManager.prototype.addThumbnail = function(thumb){	
	if(this.toolbar_layer==undefined){
		this.toolbar_layer = new ToolbarMaker('',46,80,80);
		this.toolbar_layer.addHandle(1);
		this.toolbar_layer.addSortWrapper();
		$(this.toolbar_layer.bar).prependTo('body');
	}

	$thumb = this.toolbar_layer.addThumbnail(thumb);

	$('#layerBar').sortable({
	  items: '> img',
	  containment: 'parent',
	  update:function(){
	  	layerManager.updateLayering();
	  }
	});
	$('#layerBar').disableSelection();
	return $thumb;
}
UIManager.prototype.triggerActiveLayer=function(){
	$('#layerBar>img').first().trigger('click');
}
UIManager.prototype.deleteEmptyLayerBar=function(){
	if($('#layerBar>img').first().length == 0){
		this.toolbar_layer.bar.remove();
		delete this.toolbar_layer;
	}
}
UIManager.prototype.domReady=function(){
}


var ToolbarMaker = function(h,w,y,x){
	
	/*
		h = height
		w = width
		y = top pos		
		x = left pos		
	*/
	h=h||'auto';
	w=w||'auto';

	//create the toolbar
	this.bar = $('<div>').addClass('toolbar')
	.css({'height':h,'width':w,'left':x,'top':y,'position':'fixed','cursor':'default'});

	return this;

}
ToolbarMaker.prototype.addHandle = function(o){
	// o = orientation | 0 = horizontal, 1 = vertical

	//add a handlebar
	var handle = (o==0) ? 'images/toolbar_handle_v.png' : 'images/toolbar_handle_h.png';
	$handle = $('<img>').attr('src',handle).addClass('handle').appendTo(this.bar);	
	


	//make draggable 
	$(this.bar).draggable({ handle:'.handle' });

	$(this.bar).bind('mousedown',function(e){
		e.stopPropagation();
	});

	return this;
}
ToolbarMaker.prototype.addIcon = function(icon){
	var icon = $('<img>').attr('src',icon).addClass('icon').appendTo(this.bar)
	.mouseover(function(){$(this).addClass('mouseover')})
	.mouseleave(function(){$(this).removeClass('mouseover')});
	return icon;
}
ToolbarMaker.prototype.addSortWrapper = function(thumb){
	this.sortWrapper = $('<ul>').attr('id','layerBar').appendTo(this.bar);
}
ToolbarMaker.prototype.addThumbnail = function(thumb){
	return $('<img>').attr('src',thumb).addClass('thumb').prependTo(this.sortWrapper);
}
ToolbarMaker.prototype.assign = function(tool){	
	tool.$icon = this.addIcon(tool.iconUrl);	
	this.setMousedownEvent(tool);
	if(tool.title !== undefined){tool.$icon.attr('title',tool.title)}
	if(tool.init !== undefined){tool.init()}
	if(tool.domReady !== undefined){
		//register domReady functions from tools, stack them for running
		uiManager.domReady = (function(old){
			return function(){
				old();
				tool.domReady();
			}
		})(uiManager.domReady);
	}
	return this;
}
ToolbarMaker.prototype.setMousedownEvent=function(tool){
	tool.$icon.bind('mousedown',function(e){
		if( (e.button!==0) && (e.isTrigger===undefined) )return

		if( (tool.noSetActive!==undefined)&&(tool.noSetActive===1)){
			//when icon of tool doesn't require an active state when pressed, eg colors
			tool.start();
			e.stopPropagation();	
			return;
		} 	

		//run prev active tool stop
		if(uiManager.activeTool){
			uiManager.activeTool.stop();
			uiManager.activeTool.$icon.removeClass('active');
		}

		//set this tool as active
		//set cursor
		//run start function		
		uiManager.activeTool = tool;
		tool.$icon.addClass('active');
		cursor = (tool.cursor !== undefined) ? 'url('+tool.cursor+'), default' : 'default';	
		$('body').css('cursor',cursor);			
		tool.start();
		e.stopPropagation();		
	});
}
ToolbarMaker.prototype.insertDivider = function(o){
	// o = orientation | 0 = horizontal, 1 = vertical	
	var img = (o==0) ? 'images/toolbar_divider_v.png' : 'images/toolbar_divider_h.png';
	this.addIcon(img).attr('class','divider');
	return this;
}
ToolbarMaker.prototype.drawInput = function(){

	this.size = 5;
	css = {	'width':38,
			'height':20,
			'margin':4,
			'color':'#A5C0E1',
			'backgroundColor': uiColor.handleGrey,
			'text-align':'center',
			'vertical-align':'middle',
			'border':'none'};
	$b = $('<input>').attr('id','sizeText').css(css).val(this.size+'px').appendTo(this.bar);
	$b.change(function(){
		size = parseInt(this.value, 10)
		uiManager.toolbar_sizePicker.size = size;
		$('#sizeText').val(size+'px');

	});

	return this;
}
ToolbarMaker.prototype.drawSizers = function(){

	//loop 8 times, +10 w and h
		//create canvas box - same width as toolbar
		//draw circle 
		//assign mousedown

	h = -2;
	w = 38;
	padding = 3;
	margin = 4;
	for (var i = 0; i < 8; i++){
		h = h+3;
		x = w/2;
		y = h/2+padding; 
		canvas = document.createElement('canvas');
		canvas.height = h+(padding*2);
		canvas.width = w;
		context = canvas.getContext('2d');
		context.strokeStyle = '#A5C0E1';
		context.fillStyle = '#A5C0E1';
		context.lineWidth = 0;
		context.lineCap= 'round';
		context.lineJoin = 'round';
		context.arc(x,y,h/2,0,2*Math.PI);
    	context.stroke();
    	context.fill();

		canvas.style.margin = margin;


		canvas.size = h;		
		$b = $(canvas).addClass('sizer').appendTo(this.bar);
		
		$b.bind('mousedown',function(e){
			uiManager.toolbar_sizePicker.size = this.size;
			$('#sizeText').val(this.size+'px');
			$('.sizer').removeClass('active');
			$(this).addClass('active');

			e.stopPropagation();		
		});


	
	}

	return this;

}


