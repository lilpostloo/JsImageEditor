var Text = function(){
	this.title = 'Text Tool';
	this.iconUrl = 'images/tool_text.png';	
	this.cursor = 'images/tool_text.png';
}
Text.prototype.init = function(){}
Text.prototype.start = function(){

	self = this;
	$(document.body).bind('mousedown.Text',function(e){
		if(e.button!==0)return;
    	var x = e.originalEvent.pageX - $(this).offset().left;
		var y = e.originalEvent.pageY - $(this).offset().top; 


		$input = self.getTextArea(x,y);

		$input.appendTo('body');

		$(document).on('mouseup.Text',function(e){
			$input.focus();
    		$input.css('pointer-events','auto');	
			$(this).off('mouseup.Text');
		 });


	});

}
Text.prototype.stop = function(){}
Text.prototype.getTextArea = function(x,y){

	var $input = $('<input size="2">').css({
					'position':'absolute',
					'z-index':'1200',
					'height':'18px',
					'border':'none',
					'top':y+'px',
					'left':x+'px',
					'background':'none',
					'font-size':'15px',
					'line-height':'20px',
					'font-family':'Courier',
					'pointer-events':'none',									
					'text-align':'left',
					'opacity':'1',
					'color':colorPicker.color
					});

	$input.bind({

		keydown:function(e)
		{
			this.size = ( this.value.length+1 > 2 ) ? this.value.length+1 : 2;
		},
		keyup: function(e)
		{
		},			    		
		focusin: function(e)
		{			    						    			
		},
		focusout:function(e)
		{
		},
		showDragHandle:function()
		{					
		},
		hideDragHandle:function()
		{
		}

	});

	return $input
}

var text = new Text();

