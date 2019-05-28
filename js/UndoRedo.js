

var Undo = function(){
	this.title = 'Undo';
	this.iconUrl = 'images/tool_undo.png';
	this.cursor = '';	
}
Undo.prototype.init = function(){}
Undo.prototype.start = function(){actionHistory.undo()}
Undo.prototype.stop = function(){}
var undo = new Undo();





var Redo = function(){
	this.title = 'Redo';
	this.iconUrl = 'images/tool_redo.png';
	this.cursor = '';
}
Redo.prototype.init = function(){}
Redo.prototype.start = function(){actionHistory.redo()}
Redo.prototype.stop = function(){}
var redo = new Redo();