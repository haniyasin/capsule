var comp = require('./Compositer'),
    tfile;

/* dnd_source unit */

comp.Unit.prototype.types['dnd_source'] = function (object) {
    this.childs = [];
    
    this.html = document.createElement('div');
    
    this.init(object);
    this.prepare(object);
};

comp.Unit.prototype.types['dnd_source'].prototype = new comp.Unit(undefined, undefined);

comp.Unit.prototype.types['dnd_source'].prototype.init = function (object) {
    if (typeof object.color === 'string') {
        this.html.style.backgroundColor = object.color;
    }
    this.html.ondragstart = function(){ return false; };
};

/* dnd_dest unit */

comp.Unit.prototype.types['dnd_dest'] = function (object) {
    this.childs = [];
    
    this.html = document.createElement('div');
    
    this.init(object);
    this.prepare(object);
};

comp.Unit.prototype.types['dnd_dest'].prototype = new comp.Unit(undefined, undefined);

comp.Unit.prototype.types['dnd_dest'].prototype.init = function (object) {
        if (typeof object.color === 'string') {
            this.html.style.backgroundColor = object.color;
        }
//    this.html.ondragstart = function(){ return false; };
};

comp.Compositer.prototype.dnd_source_create = function(info, options, target_list, action_after){
    
};

comp.Compositer.prototype.dnd_destination_create = function(info, options, target_list, action_after){
    if(!tfile)
	tfile = require('types/file');

    var unit = new comp.Unit('dnd_dest', info);
    
    unit.id(comp.Unit.pool.put(unit));
    var ondata;
    return {
	id : unit.id(null),
 	//motion, leave, data, drop
	on : function(event, callback){
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
					       var context = {
						   
					       };
//					       callback(context);
					       var dt = e.dataTransfer;
					       var files = dt.files;
					       
					       for(ind in files){
						   var file = files[ind];
						   
						   context.file = new tfile(URL.createObjectURL(file));
						   ondata(context);

					       }
					       e.stopPropagation();
					       e.preventDefault();
			       });
		break;
		
	    case 'data' : 
		ondata = callback;
		break;
	    }
	},
	destroy : function(){
	    comp.Unit.pool.free(this.id);
	}
    };
};
