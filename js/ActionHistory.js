

ActionHistory = function(){
	this.pointer = 0;
	this.actions = new Array();
	this.setAction = function(obj){
		this.removeOldRedoActions();		 
		actionHistory.actions.push({'ID':++actionHistory.pointer,'obj':obj});
		this.updateCounters();	
	}	
	this.removeOldRedoActions=function(){
		if(actionHistory.actions.length>this.pointer){
			console.log('removed forward history')
			actionHistory.actions = actionHistory.actions.slice(0,actionHistory.pointer);
		}	
	}
	this.undo=function(){
		i = Number(actionHistory.pointer);
		if(i===0)return;						
		i--;
		a = actionHistory.actions[i];
		console.log('undo', a.obj.ref , i);

		a.obj.undo();
		actionHistory.pointer--;	
		this.updateCounters();
	}
	this.redo=function(){
		i = Number(actionHistory.pointer);
		if(i===actionHistory.actions.length)return;	
		a = actionHistory.actions[i];
		console.log('redo ',a.obj.ref,i);				

		a.obj.redo();
		actionHistory.pointer++;
		this.updateCounters();
	}
	this.updateCounters=function(){
		undoCount = actionHistory.pointer;
		redoCount = actionHistory.actions.length - actionHistory.pointer;
		$('.counter').remove();
		$('<div>').addClass('undoCounter counter').html(undoCount).appendTo(uiManager.toolbar_doc.bar);
		$('<div>').addClass('redoCounter counter').html(redoCount).appendTo(uiManager.toolbar_doc.bar);		
	}
}

actionHistory = new ActionHistory();