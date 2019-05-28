var ColorPicker = function(){
	this.title = 'ColorPicker Tool';
	this.iconUrl = 'images/tool_color.png';
	this.color = '#fff';
	this.noSetActive = 1;
}
ColorPicker.prototype.domReady = function(){
	$(this.$icon).spectrum({
	    color: "#315177",
	    showButtons: false,
	    showInput: true,
	    //showAlpha:true,
	    //chooseText: 'OK',
	    containerClassName: 'yesname',
	    className: "full-spectrum",
	    showInitial: true,
	    //showPalette: true,
	    //showSelectionPalette: false,
	    clickoutFiresChange: true,
	    //maxPaletteSize: 10,
	    preferredFormat: "hex",
	    localStorageKey: "spectrum.demo",
	    move: function (color) {
	    	colorPicker.color = color.toHexString();
	    },
	    show: function () {
			var c = $(this).spectrum('container');
			c.css('background','#19294a');
			c.css('border','none');

			$('.sp-input').css('background','#19294a');
			$('.sp-input').css('color','#7AABE4');
			$('.sp-picker-container').css('border','none');
	    },
	    beforeShow: function(c){},
	    hide: function(c){},
	    change: function(c){}
	});

}
ColorPicker.prototype.start = function(){}
ColorPicker.prototype.stop = function(){}
var colorPicker = new ColorPicker();