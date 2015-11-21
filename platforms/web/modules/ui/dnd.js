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

exports.dnd_source = dnd_source;

//motion, leave, data, drop
function catcher_on(event, callback){
    if(callback){
    unit.html.addEventListener('dragenter', function(e){
				   e.stopPropagation();
				   e.preventDefault();					   
			       }, false);
    
	switch(event){
	case 'motion' :
	    unit.html.addEventListener('dragover',function(e){
					   var context = {
					   };
					   callback(context);
					   e.stopPropagation();
					   e.preventDefault();
				       }, false);
	    break;
	    
	case 'leave' : 
	    unit.html.addEventListener('dragleave', function(e){
					   var context = {
					   };
					   callback(context, x, y);
					   e.stopPropagation();
					   e.preventDefault();
				       }, false);
	    break;
	    
	case 'drop':
	    unit.html.addEventListener('drop', function(e){
					   e.stopPropagation();
					   e.preventDefault();
					   var context = {
					       
					   };
					   //					       callback(context);
					   var dt = e.dataTransfer;
					   var files = dt.files;
					   
					   for(ind in files){
					       var file = files[ind];
					       
					       context.file = new tfile(URL.createObjectURL(file));
					       this.emit('data', context);
					   }
				       });
	    break;
	    
	case 'data' : 
	    return true;
	}	
    } // else FIXME нужно убирать установленный callback
    return false;
}

function dnd_dest(info, options, target_list, action_after){
    if(!tfile)
	tfile = require('types/file');

    this.html = document.createElement('div');
    this.catch_on(['motion', 'leave', 'drop', 'data'], catcher_on);
    if (typeof info.color === 'string') {
        this.html.style.backgroundColor = info.color;
    }
    
    this.prepare(info);
};

dnd_dest.prototype = new comp.unit();

exports.dnd_dest = dnd_dest;
