var comp = require('./Compositer');

/* filechooser unit */

comp.Unit.prototype.types['filechooser'] = function (object) {
    this.childs = [];
    
    this.html = document.createElement('input');
    this.html.type = 'file';
    
    this.init(object);
    this.prepare(object);
};

comp.Unit.prototype.types['filechooser'].prototype = new comp.Unit(undefined, undefined);

comp.Unit.prototype.types['filechooser'].prototype.init = function (object) {
    if (typeof object.label === 'string') {
        this.html.label = object.label;
    }
};

comp.Compositer.prototype.filechooser_create = function(info, options){
    var unit = new comp.Unit('filechooser', info);
    
    unit.id(comp.Unit.pool.put(unit));

    return {
	id : unit.id(null),
	on_choose : function(callback){
	    unit.html.onchange = function(){ 
		var context = {};
		context.name = unit.html.files[0].name;
		context.data = URL.createObjectURL(unit.html.files[0]);
		callback(context); 
	    };
	}
    };
};
