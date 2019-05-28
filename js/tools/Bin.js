
var Bin = function(){
	this.title = "Recycle Bin";
	this.iconUrl = 'images/tool_bin.png';
	this.cursor = '';
}
Bin.prototype.init = function(){

}
Bin.prototype.start= function(){
	obj = layerManager.getActiveObj();

	if(!obj)return
	actionHistory.setAction({
		ref:'Bin',
		obj:obj,
		undo:function(){
			Bin.prototype.undo(this.obj);
		},
		redo:function(){
			Bin.prototype.redo(this.obj);
		}
	});

	Bin.prototype.redo(obj);
}
Bin.prototype.stop = function(){}
Bin.prototype.undo = function(obj){
	
	$(obj.layer).addClass('imgLayer').appendTo('body');
	obj.$thumb = uiManager.addThumbnail(obj.$thumb.attr('src'));
	newObj = layerManager.regNewLayer(obj);
	uiManager.triggerActiveLayer();	
	
}
Bin.prototype.redo = function(obj){
	obj.layer.remove();
	obj.$thumb.remove();
	obj.active=true;	
	layerManager.deleteActiveObj();	
	uiManager.triggerActiveLayer();	
	uiManager.deleteEmptyLayerBar();

}
var bin = new Bin();