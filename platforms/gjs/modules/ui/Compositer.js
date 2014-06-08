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
				     var color = new Clutter.Color();
				     color.alpha = 200;
				     color.blue = Math.random() * 255;
				     color.red = Math.random() * 255;
				     color.green = Math.random() * 255;
				     element.actor.set_background_color(color);
				     return elements.put(element);
				 },
				 destroy : function(id){
				     var element = elements.free(id);
				 },
				 add : function(parent_id, child_id){
				     var child = elements.take(child_id);
				     var parent = elements.take(parent_id);
				     parent.childs.push(child);
				     child.parent = parent;
				     parent.actor.add_actor(child.actor);
				     child.props_manager.apply_all();
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
				     element.apply_all();
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

function event(){
    return new element_proto('event', {
				 register : function(element_id, event_name){
				 },
				 unregister : function(element_id, event_name){
				 }
			     });
}

function element_proto(name, props){
    this.name = name;
    this.props = props;    
}

function props_manager(element){
    var types = {
	x : {
	    set : function(value){
		if(typeof value == undefined)
		    value = 0;

		element.props.x = value;
	    },
	    apply : function(){
		var value = element.props.x;
		//проверяем не в процентах ли, конвертируем
		var percent_result = /^(\d{0,2})%/.exec(value);
		if(percent_result != null){
		    value = element.parent.props.width / 100 * percent_result[1];		    
		}
		element.actor.set_x(value);
	    }
	},
	y : {
	    set : function(value){
		if(typeof value == undefined)
		    value = 0;
		element.props.y = value;
	    },
	    apply : function(){
		var value = element.props.y;
		//проверяем не в процентах ли, конвертируем
		var percent_result = /^(\d{0,2})%/.exec(value);
		if(percent_result != null){
		    value = element.parent.props.height / 100 * percent_result[1];		    
		}
		element.actor.set_y(value);
	    }
	},
	width : {
	    set : function(value){
		if(typeof value == undefined)
		    value = 0;
		element.props.width = value;
	    },
	    apply : function(){
		var value = element.props.width;
		//проверяем не в процентах ли, конвертируем
		var percent_result = /^(\d{0,2})%/.exec(value);
		if(percent_result != null && percent_result.length == 2){
		    value = element.parent.props.width / 100 * percent_result[1];		    
		}
		element.actor.set_width(value);
	    }
	},
	height : {
	    set : function(value){
		if(typeof value == undefined)
		    value = 0;
		element.props.height = value;
	    },
	    apply : function(){
		var value = element.props.height;
		//проверяем не в процентах ли, конвертируем
		var percent_result = /^(\d{0,2})%/.exec(value);
		if(percent_result != null && percent_result.length == 2){
		    value = element.parent.props.height / 100 * percent_result[1];		    
		}
		element.actor.set_height(value);
	    }
	},
	opacity : {
	    set : function(value){
		if(typeof value == undefined)
		    value = 1;
		element.props.opacity = value;
	    },
	    apply : function(){
		element.actor.set_opacity(element.props.opacity * 255);
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

    this.apply_all = function(){
	for(prop in element.props){
	    types[prop].apply();
	}
    };
}

function element_obj_proto(actor, info){
    this.actor = actor; //Clutter actor
    this.props_manager = new props_manager(this);
    this.props = {};
    this.props_manager.set_all(info, true);
}

//Pool implementation has been taked from web Compositer by freeze
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
manager.add(element);
manager.add(animation);
manager.add(event);

function comp(){
    manager.assemble(this);

    this.root = new Gtk.Window({ type : Gtk.WindowType.TOPLEVEL });
    this.root.title = 'GJS compositer prototype';
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
    this.frame_create({ x : 50, y : 50, width : 400, height : 300, opacity : 0.9 });
    var element = elements.take(0);
    element.props_manager.apply_all();
    this.root_actor.add_actor(element.actor);

    var timeline = new Clutter.Timeline({duration : 1000});
    var rotation = 0;

    timeline.connect('new-frame', function() {
			 rotation += 0.3;
			 element.actor.set_rotation(Clutter.RotateAxis.Z_AXIS, rotation, 200,0,0);
		     });
    timeline.set_loop(true);
    timeline.start();

//    print(JSON.stringify(this));
}

exports.elements = elements;

exports.manager = manager;

exports.create = function(){
    return new comp();
}