
KeyPressManager = function(){
	this.enableNudging();
	this.bin();
	this.shiftDown = false;
}

KeyPressManager.prototype.bin = function(){

	var kpm = this;
	$(document).bind('keydown.bin',function(e){


		if((e.keyCode==8)||(e.keyCode==46)){
			bin.start();
		}
		
			

	});

}
KeyPressManager.prototype.enableNudging=function(){


	$(document).bind('keyup.nudging',function(e){
		
		/*
		var stopXY=[layer.style.left,layer.style.top]; 

		actionHistory.setAction({
			ref:'Nudge',
			layer:layer,
			startXY:startXY,
			stopXY:stopXY,
			undo:function(){    	
				this.layer.style.left = this.startXY[0];
				this.layer.style.top = this.startXY[1];
			},
			redo:function(){
				this.layer.style.left = this.stopXY[0];
				this.layer.style.top = this.stopXY[1];
			}
		}); 

		*/	

	});	
	
	$(document).bind('keydown.nudging',function(e){

		obj = layerManager.getActiveObj();
		if(!obj)return
		layer = obj.layer;

		//shift key control for lengthier nudge			
		if(e.shiftKey){
			keyPressManager.shiftDown = true;
			$(document).bind('keyup.shiftKey',function(e){
				if(e.keyCode==16){
					$(document).unbind('keyup.shiftKey');
					keyPressManager.shiftDown = false;
				}
			});
		}
		var x = (keyPressManager.shiftDown) ? 10 : 1;

		var startXY=[layer.style.left,layer.style.top]; 

		if(e.keyCode==38){
			layer.style.top = parseInt(layer.style.top)-x;	
		}
		if(e.keyCode==37){
			layer.style.left = parseInt(layer.style.left)-x;
		}
		if(e.keyCode==40){
			layer.style.top = parseInt(layer.style.top)+x;			
		}
		if(e.keyCode==39){
			layer.style.left = parseInt(layer.style.left)+x;			
		}	

        boundary.redraw();

		
	});
}
keyPressManager = new KeyPressManager();