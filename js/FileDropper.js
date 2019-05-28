


var FileDropManager = function(){}
var fileDropManager = new FileDropManager();
FileDropManager.prototype.init  = function()
{
    var filename = '';
    var image_data = '';

    $.event.props.push('dataTransfer');

    var self = this;
    $('body').on({
        dragenter: function(e) {
        },
        dragleave: function(e) {
        },
        dragover:function(e){
        	e.preventDefault();
        },
        drop: function(e){self.processDrop(e)}   
    });
}
FileDropManager.prototype.processDrop = function(e)
{
 	e.preventDefault();
    e.stopPropagation();

   	for(i=0;i<e.dataTransfer.files.length;i++)
   	{
   		var file = e.dataTransfer.files[i];
   		var fileReader = new FileReader();

        fileReader.onload = (function(file)
        {
            return function(event)
            {
                var filename = file.name;
                image_data = event.target.result;

                var image = new Image();                               
                image.src = image_data;
                image.onload=function()
                {
                	var canvas = canvasManager.putOnCanvas(image);
                	layerManager.newLayer(canvas);
                    drag.icon.trigger('mousedown');
                }
            };
        })(file);

   		fileReader.readAsDataURL(file); 
   	}	
}