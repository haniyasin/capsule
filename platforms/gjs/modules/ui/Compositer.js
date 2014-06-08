/*
 * gjs platform Compositer module based on modern gnome technologies - mix of clutter and gtk+
 * author Nikita Zaharov aka ix(ix@2du.ru)
 */

const Gtk = imports.gi.Gtk;
const Clutter = imports.gi.Clutter;
const GtkClutter = imports.gi.GtkClutter;
function frame(){
    return new element_proto('frame', {
				 create : function(info){
				     var element = new element_obj_proto(new Clutter.Actor(), info);
				     element.childs = [];
				     element.actor.show();
				     return elements.put(element);
				 },
				 destroy : function(id){
				     var element = elements.free(id);
				 },
				 add : function(parent_id, child_id){
				     var child = elements.take(child_id);
				     if(!parent_id)
					 this.root_actor.add_actor(child.actor);
				     else {
					 var parent = elements.take(parent_id);
					 parent.childs.push(child);
					 child.parent = parent;
				     }
				 }
			     });
}

function image(){
    return  new element_proto('image', {
				  create : function(info){
				      var element = new element_obj_proto(new Clutter.Actor(), info);
				      element.actor.show();
				      var color = new Clutter.Color();
				      color.alpha = 200;
				      color.blue = Math.random() * 255;
				      color.red = Math.random() * 255;
				      color.green = Math.random() * 255;
				      element.actor.set_background_color(color);
				      return elements.put(element);
				  },
				  destroy : function(id){
				  }
			      });
}

function text(){
    return new element_proto('text', {
				 create : function(info){
				 },
				 destroy : function(id){
				 }
			     });
}

function button(){
    return new element_proto('button', {
				 create : function(info){
				 },
				 destroy : function(id){
				 }
			     });
}

function entry(){
    return new element_proto('entry', {
				 create : function(info){
				 },
				 destroy : function(id){
				 }
			     });
}

function element(){
    return new element_proto('elemement', {
				 change_props : function(id, info){
				     var element = elements.take(id);
				     element.set_all(info);
				 }
			     });
}

function animation(){
    var animations = new Pool();
    return new element_proto('anim', {
				 create : function(animation){
				 },
				 destroy : function(anim_id){
				 },
				 bind : function(anim_id){
				 },
				 unbind : function(binded_id){
				 }
			     });
}

function element_proto(name, props){
    this.name = name;
    this.props = props;    
}

function elem_obj_props(element){
    var types = {
	x : {
	    set : function(value){
		if(typeof value == undefined)
		    value = 0;
		//проверяем не в процентах ли, конвертируем
		element.actor.set_x(value);
	    }
	},
	y : {
	    set : function(value){
		if(typeof value == undefined)
		    value = 0;
		element.actor.set_y(value);
	    }
	},
	width : {
	    set : function(value){
		if(typeof value == undefined)
		    value = 0;
		element.actor.set_width(value);
	    }
	},
	height : {
	    set : function(value){
		if(typeof value == undefined)
		    value = 0;
		element.actor.set_height(value);
	    }
	},
	opacity : {
	    set : function(value){
		if(typeof value == undefined)
		    value = 1;
		element.actor.set_opacity(value * 255);
	    }
	}
    };

    this.set_all = function(info, init){
	for(type in types){
	    if(info.hasOwnProperty(type))
		types[type].set(info[type]);
	    else if(typeof init != undefined)
		types[type].set();
	}
    };
}

function element_obj_proto(actor, info){
    this.actor = actor; //Clutter actor
    this.props = new elem_obj_props(this);
    this.props.set_all(info, true);
}

var Pool = function () {
    this.pool = []; this.available = []; this.count = 0;
    
    return undefined;
};

Pool.prototype.put = function (data) {
    var id = this.available.shift();
    
    if (id === undefined) {
        id = this.pool.push();
    }
    
    this.pool[id] = data;
    this.count++;
    
    return id;
};

Pool.prototype.take = function (id) {
    return this.pool[id];
};

Pool.prototype.free = function (id) {
    delete this.pool[id];
    
    this.available.push(id);
    this.count--;
    
    return undefined;
};

var elements = new Pool();

var manager = {
    'modules' : [],
    'add' : function(element_constructor){
	this.modules.push(element_constructor());
    },
    'assemble' : function(comp){
	for(module in this.modules){
	    var module = this.modules[module],
	        name = module.name,
	        props = module.props;
	    for(prop in props){
		comp[name + '_' + prop] = props[prop];		
	    }
	}
    }
};

manager.add(frame);
manager.add(image);
manager.add(text);
manager.add(button);
manager.add(entry);

function comp(){
    manager.assemble(this);

    this.root = new Gtk.Window({ type : Gtk.WindowType.TOPLEVEL });
    this.root.title = 'GJS compositer module prototype';
    this.root.show();

    var actor = new GtkClutter.Embed();
    actor.show();
    actor.set_size_request(800, 400);
    this.root.add(actor);
    var stage = this.root_actor  = actor.get_stage();
    var color = new Clutter.Color();
    color.alpha = 200;
    color.blue = 150;
    color.red = 240;
    color.green = 250;
    stage.set_background_color(color);
//    print(JSON.stringify(this));
}

exports.elements = elements;

exports.manager = manager;

exports.create = function(){
    return new comp();
}