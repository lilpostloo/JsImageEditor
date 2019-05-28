/*

UI.initialize

on Document ready
	App initialize




*/

uiManager.initialize();


var App = function(){}
var app = new App();

App.prototype.initialize = function(){

	uiManager.draw();
	uiManager.domReady();
	fileDropManager.init();
	pasteManager.enablePasting();

	$(document.body).bind('mousedown',function(e){
		if(e.button!=0)return 
		layerManager.removeActiveClass();
		e.stopPropagation();
	});
	//create toolbars
		//add icons
	//create workspace
	// /console.log(1);
	//


}


$(document).ready(function()
{

	app.initialize();


});


//---------------------playtime --------------

// create toolbars obj - fns: add icon | params: dimension, pos, col 
// "background:#19294a; position:fixed;
//	height:50px; width:500px; ; left:20px; top:20px;"
/*


<div id="toolbar_docTools" style="background:#19294a; height:50px; width:500px; position:fixed; left:20px; top:20px;">
	<img class='handle' src='images/toolbar_handle_v.png' style="padding:13px;">

	
</div>

<div id="toolbar_editTools" style="background:#19294a; width:50px; position:fixed; left:20px; top:80px;">
	<img class='handle' src='images/toolbar_handle_h.png' style="padding:13px;">

</div>

<div id="toolbar_brushSize" style="background:#19294a; height:150px; width:50px; position:fixed; left:80px; top:80px;">
	
</div>



<div id="workspace" style="background:#333; position:absolute; top:100px; left:200px; height:100px; width:300px;">
	<img class='tool' id='tool_arrow' src='images/tool_arrow.png' title='Arrow'/>
</div>
*/