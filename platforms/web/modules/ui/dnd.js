var comp = require('./Compositer'),
    tfile;

function dnd_source(info){
    this.html = document.createElement('div');
    
    if (typeof info.color === 'string') {
        this.html.style.backgroundColor = info.color;
    }
    this.html.ondragstart = function(){ return false; };

    this.prepare(info);
};

dnd_source.prototype = new comp.unit();

//motion, leave, data, drop
function catcher_on(event, callback){
    var self = this;
    if(callback){
	this.html.addEventListener('dragenter', function(e){
				       e.stopPropagation();
				       e.preventDefault();		   
				   }, false);
    
	switch(event){
	case 'drag-motion' :
	    this.html.addEventListener('dragover',function(e){
					   var context = (comp.process_mouse_event(self, e))[0];
					   callback(context);
					   e.stopPropagation();
					   e.preventDefault();
				       }, false);
	    break;
	    
	case 'drag-leave' : 
	    this.html.addEventListener('dragleave', function(e){
					   var context = {
					   };
					   callback(context);
					   e.stopPropagation();
					   e.preventDefault();
				       }, false);
	    break;
	    
	case 'drag-drop':
	    this.html.addEventListener('drop', function(e){
					   e.stopPropagation();
					   e.preventDefault();
					   var context = {
					       
					   };
					   //					       callback(context);
					   var dt = e.dataTransfer;
					   var files = dt.files;
					   
					   for(ind in files){
					       var file = files[ind];
					       
//					       context.file = new tfile(URL.createObjectURL(file));
					       self.emit('data', context);
					   }
				       });
	    break;
	    
	case 'drag-data' : 
	    return true;
	}	
    } // else FIXME нужно убирать установленный callback
    return false;
}

function dnd_dest_activate(element, info, options){
    if(!tfile)
	tfile = require('types/file');

    element.catch_on(['drag-motion', 'drag-leave', 'drag-drop', 'drag-data'], catcher_on);
};

comp.ui.prototype.dnd_dest_activate = dnd_dest_activate;
