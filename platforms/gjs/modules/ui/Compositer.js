/*
 * Compositer module based on modern gnome technologies - mix of clutter and gtk+
 * author Nikita Zaharov aka ix(ix@2du.ru)
 */

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Cogl = imports.gi.Cogl;
const Clutter = imports.gi.Clutter;
const GtkClutter = imports.gi.GtkClutter;
const ClutterGst = imports.gi.ClutterGst;
const Gst = imports.gi.Gst;

var error = require('parts/error.js');

var bba = require('parts/bb_allocator'),
    id_allocator = new bba.allocator(bba.id_allocator);

function set_random_background(actor){
    var color = new Clutter.Color();
    color.alpha = 200;
    color.blue = Math.random() * 255;
    color.red = Math.random() * 255;
    color.green = Math.random() * 255;
    actor.set_background_color(color);    
}

function element(){
    this.event_callbacks = {};
}

element.prototype.init = function(actor, info){
    this.id = id_allocator.alloc();
    this.props_manager = new props_manager(this);
    this.actor = actor; //Clutter actor
    this.props_manager.set_all(info, true);
};

element.prototype.on = function(event_name, callback){
    var listened_elems = this.comp._listened_elems;
    print(this.comp);
    if(callback !== 'undefined'){
	//register callback
	if(!listened_elems.hasOwnProperty(this.id))
	    listened_elems[this.id] = this;
	this.event_callbacks[event_name] = callback;
	this.actor.reactive = true;
	var mouse_handler = new _event_mouse_handler(listened_elems, this, event_name);
	switch(event_name){
	case 'pointer_down' :
	    element.actor.connect('button-press-event', mouse_handler.handle);
	    break;
	    
	case 'pointer_up' : 
	    element.actor.connect('button-release-event', mouse_handler.handle);
	    break;
	    
	case 'pointer_in' :
	    element.actor.connect('enter-event', mouse_handler.handle);
	    break;
	    
	case 'pointer_out' :
	    element.actor.connect('leave-event', mouse_handler.handle);
	    break;
	    
	case 'pointer_motion' : 
	    element.actor.connect('motion-event', mouse_handler.handle);
	    break;
	    
	case 'key_down' :
	    element.actor.connect('key-press-event', callback);
	    break;
	    
	case 'key_up' : 
	    element.actor.connect('key-release-event', callback);
	    break;
	}	    
    } else 	    //unregister
	delete this.event_callbacks[event_name];
};

element.prototype.destroy = function(){
    //FIXME
};

element.prototype.props = function(info){
    this.props_manager.set_all(info);
    this.props_manager.apply_all();
};

function frame(info){
    this.init(new Clutter.Actor(), info);
    this.childs = [];
    this.actor.show();
    if(info.hasOwnProperty('background_random'))
	set_random_background(this.actor);    

};
frame.prototype = new element();

frame.prototype.destroy = function(){
    id_allocator.free(this.id);
    this.actor.unref();
};
			
frame.prototype.add = function(child){
    this.actor.add_actor(child.actor);
    child.parent = this;
    this.childs.push(child);
//    if(child.hasOwnProperty('on_add'))
//	child.on_add(parent_id);
    child.props_manager.apply_all();
};

frame.prototype.remove = function(child){
    this.actor.remove_child(child.actor);				     
    child.parent = undefined;
};


function image(info){
    this.init(new Clutter.Actor(), info);
    this.actor.show();
    if(info.hasOwnProperty('source')){
	var pixbuf = info.source.pixbuf;
	this.image = new Clutter.Image();
	this.image.set_data(pixbuf.get_pixels(),
			    pixbuf.get_has_alpha() ? Cogl.PixelFormat.RGBA_8888 : Cogl.PixelFormat.RGB_888,
			    pixbuf.get_width(),
			    pixbuf.get_height(),
			    pixbuf.get_rowstride());

	this.actor.content = this.image;
    } else {
	//					  print('comp.image', 'please set image.source');
	set_random_background(this.actor);    
    }
}

image.prototype = new element();

image.prototype.destroy = function(){
    id_allocator.free(this.id);
    this.actor.unref();
    this.image.unref();
};


function text(info){
    this.init(new Clutter.Text(), info);
    if(!info.hasOwnProperty('text'))
	info.text = 'text';
    element.actor.set_font_name("Sans 26");
    element.actor.set_text(info.text);
    element.actor.show();
}

text.prototype = new element();

text.prototype.destroy = function(){
    id_allocator.free(this.id);
    this.actor.unref();
};

function button(info){
    if(!info.hasOwnProperty('label'))
	info.label = 'button';
    //				     print(Gtk.Button.new_with_label);
    var widget = Gtk.Button.new_with_label(info.label);
    this.init(GtkClutter.Actor.new_with_contents(widget), info);
    this.widget = widget;
    this.actor.show();
    this.set_label = function(label){widget.set_label(label);};
    this.on_press = function(callback){element.widget.connect('pressed', callback);};
}

button.prototype = new element();
button.prototype.destroy = function(){
    id_allocator.free(this.id);
    this.actor.unref();
    this.widget.unref();
};

function entry(info){
    if(!info.hasOwnProperty('placeholder'))
	info.placeholder = 'enter text';
    var widget = new Gtk.Entry();
    widget.set_placeholder_text(info.placeholder);
    this.init(GtkClutter.Actor.new_with_contents(widget), info);
    this.widget = widget;
    this.actor.show();
    this.set_placeholder = function(placeholder){ widget.set_placeholder_text(placeholder); };
    this.get_value = function(){ return widget.get_text() };
    this.set_value = function(value){ widget.set_text(value); };
    this.on_text_change = function(callback){ element.widget.connect('activate', callback); };
}

entry.prototype = new element();

entry.prototype.destroy = function(){
    id_allocator.free(this.id);
    this.actor.unref();
    this.widget.unref();
};

function load_video(element, info){
    element.pipeline = Gst.parse_launch("playbin " + 'uri=' + info.source);
    var bus = element.pipeline.get_bus();
    bus.add_watch(-1, function(bus, message){
		      print(message.type);
		      print(JSON.stringify(Gst.MessageType));
		  });
    //	element.pipeline = Gst.Element.make_from_uri(Gst.URIType.SRC, info.source + '', 'video');
    //	print(element.pipeline);
    //	print('uri=' + info.source);
    element.sink = new ClutterGst.VideoSink();
    //				     element.sink = Gst.ElementFactory.make('cluttersink', 'bat');
    element.sink.texture = element.actor;
    element.pipeline.video_sink = element.sink;			
}
function video(info){
    this.init(new Clutter.Texture( {}), info);
    if(!info.hasOwnProperty('source')){
	info.source = "http://docs.gstreamer.com/media/sintel_trailer-480p.ogv";
	load_video(this, info);
    }
				     
    //				     element.actor.add_child(element.actor);
    this.actor.show();
    
    this.load = function(file){
	info.source = file.uri;
	load_video(element, info);
    };

    this.play = function(){ element.pipeline.set_state(Gst.State.PLAYING); };
    this.pause = function(){ element.pipeline.set_state(Gst.State.PAUSED); };
    this.set_position = function(msecond){ element.pipeline.seek_simple(Gst.Format.TIME, Gst.SeekFlags.FLUSH, msecond *Gst.MSECOND); };	
    this.get_position = function(){ return element.pipeline.query_position(Gst.Format.TIME)[1] / Gst.MSECOND; };
    this.get_duration = function(){ return element.pipeline.query_duration(Gst.Format.TIME)[1] / Gst.MSECOND; };
    this.get_volume = function(){ return 100; }; //FIXME
    this.set_volume = function(volume){ }; //FIXME
    this.on_timeupdate = function(callback){
	var curtime = 0;
	let self = this;
	GLib.timeout_add(GLib.PRIORITY_HIGH, 200, function(){
			     if(curtime < self.get_position()){
				 callback();
				 curtime = self.get_position();
			     }
			     return true;
			 });   
    };
}
    
video.prototype = new element();

video.prototype.destroy = function(id){
    id_allocator.free(this.id);
    this.actor.unref();
    this.pipeline.unref();
    this.sink.unref();
};

function animation(chain){
    var fps = 60,
    frames = this.frames = [],
    prev_frames_num = 0,
    part;
    this.started = [];

    for(part in chain){
	var frames_num = chain[part].duration / 1000 * fps;
	if(chain[part].duration == 0){
	    with(chain[part]){
		frames[prev_frames_num] = {};
		for(action in actions){
		    frames[prev_frames_num][action] = actions[action];
		}						 
	    }
	    prev_frames_num++;
	}
	with(chain[part]){
	    if(typeof duration == 'undefined')
		return new error('Compositer animation error', 'chain block has no duration property');
	    if(typeof actions != 'undefined'){
		var new_frames_num = prev_frames_num + frames_num;
		var action;
		for(action in actions){
		    var step = actions[action] / frames_num;
		    var ind;
		    for(ind = prev_frames_num;  ind < new_frames_num; ind++){
			if(typeof frames[ind] == 'undefined')
			    frames[ind] = {};
			frames[ind][action] = step;
		    }
		}						 
	    }
	}
	prev_frames_num += frames_num;
    }				     
    return true;
}

animation.prototype.bind = function(element){
    if(!this.animated)
	this.animated = {};
    this.animated[element.id] = { element : element,  frames : this.frames};
};

animation.prototype.unbind = function(element){
    delete this.animated[element.id];
};
		
animation.prototype.start = function(element){
    return;
    var timeline = null,
        self = this,
        started = this.started;
    this.animated[element.id].cur_frame = 0;
    this.started.push(element.id);
    print(JSON.stringify(this.started));

    if(timeline == null){
	timeline = new Clutter.Timeline({duration : 1000});
	
	timeline.connect('new-frame', 
			 function() {
			     var sanim_ind;
			     for(sanim_ind in started){
				 var banim = self.animated[started[sanim_ind]];
				 var element = self.animated[started[sanim_ind]].element;
				 if(banim.cur_frame < banim.frames.length){
				     var changing_props = banim.frames[banim.cur_frame], prop_name;
				     for (prop_name in changing_props){
					 element.props_manager[prop_name].update(changing_props[prop_name]);
					 element.props_manager[prop_name].apply();
				     }
				     banim.cur_frame++;
				 }else{
				     if(typeof started[sanim_ind] != 'indefined'){
					 self.started.splice(sanim_ind, 1);
					 if(self.comp._listened_elems.hasOwnProperty(element.id)){
					     if(element.event_callbacks['animation_stopped'])
						 element.event_callbacks['animation_stopped']();
					 }
				     }
				 }
			     }
			 });
	timeline.set_loop(true);
	timeline.start();					 
    }
};

animation.prototype.stop = function(element){
    //FIXME stub
};

function _event_mouse_handler(listened_elems, element,event_name){
    this.handle = function(actor, event){
	var coords = event.get_coords();
	coords[0] = coords[0] - element.props_manager.x.get_pos_absolute();
	coords[1] = coords[1] - element.props_manager.y.get_pos_absolute();
	var pointer_obj = [{
			       'pointer_id' : 0,
			       
			       'x' : (element.props_manager.x.type  === '%') ?
				   Math.round((100 / element.props_manager.width.get()  * coords[0])) :
				   coords[0],
			       
			       'y' : (element.props_manager.height.type === '%') ?
				   Math.round((100 / element.props_manager.height.get() * coords[1])) :
				   coords[1]
			   }];
	
	listened_elems[element.id].event_callbacks[event_name](pointer_obj);
    };	
}

function prop_handlers(){
    this.get = function(prop){
    };
}

function props_manager(element){
    var types = {
	x : 'true',
	y : 'true',
	width : 'true',
	height : 'true',
	opacity : 'true',
	z_index : 'true'
    };

    function property_proto(){
	this.default = true;
	this.set = function(value){
	    if(typeof value == 'undefined')
		return;

	    var re_result = /^([\-\d]+)%$/.exec(value);
	    if(re_result){
		this.value = parseInt(re_result[1]);
		this.type = '%'; //percents		
	    } else {
		if(this.default)
		    this.type = 'a'; //absolute(pixels, numbers etc
	     	this.value = value;
	    }
	    this.default = false;
	};	

	this.update = function(inc_value){
	    this.default = false;
	    this.value += inc_value;
	};
    }

    function geometry_prop(prop_name, parent_prop_name){
	if(typeof parent_prop_name == 'undefined')
	    parent_prop_name = prop_name;

	this.value = 0,
	this.type = 'a';

	this.get_pos_absolute = function(){
	    var cur_elem = element;
	    var pos = 0;
	    while(typeof cur_elem != 'undefined'){
		pos += cur_elem.props_manager[prop_name].get();
		cur_elem = cur_elem.parent;
	    } 
	    return pos;
	},

	this.get = function(){
	    if(this.type == 'a')
		    return this.value;
	    else 
		if (element.hasOwnProperty('parent'))
		    return element.parent.props_manager[parent_prop_name].get() / 100 * this.value;

	    return null;	    
	};

	this.apply = function(){
	    var value = this.value;
	    if(this.type == '%' && element.hasOwnProperty('parent')){
		value = element.parent.props_manager[parent_prop_name].get() / 100 * this.value;
	    }

//	    element.prop_handlers
	    element.actor['set_' + prop_name](value);

	    //for frame recalculating all childs for properly % geometry
	    var echild;
	    if(element.hasOwnProperty('childs')){
		var child;
		for(child in element.childs){
		    echild = element.childs[child];
		    if(prop_name == 'width'){
			echild.props_manager['width'].apply();
			echild.props_manager['x'].apply();			
		    }
		    if(prop_name == 'height'){
			echild.props_manager['height'].apply();
			echild.props_manager['y'].apply();			
		    }
		}
	    }
	};	
    }
    geometry_prop.prototype = new property_proto();

    function opacity_prop(){
	this.value = 100;
	this.type = '%';

	this.get = function() {
	  return this.value;  
	};

	this.apply = function(){
	    if(this.type == '%')
		element.actor.opacity = this.value * 2.5;
	    else 
		if(this.type == 'a')
		    element.actor.opacity = this.value * 255;
	};	
    }
    opacity_prop.prototype = new property_proto();

    function z_index_prop(){
	this.value = 1;

	this.set = function(value){
	    if(typeof value == 'undefined')
		return;
	    this.value = value;
	};

	this.get = function(){
	    return value;
	};

	this.apply = function(){
	    element.actor.z_position = this.value;
	};	
    }
    z_index_prop.prototype = new property_proto();

    this.x = new geometry_prop('x', 'width');
    this.y = new geometry_prop('y', 'height');
    this.width = new geometry_prop('width');
    this.height = new geometry_prop('height');
    this.opacity = new opacity_prop();
    this.z_index = new z_index_prop();

    this.set_all = function(info, init){
	var type;
	for(type in types){
	    if(info.hasOwnProperty(type))
		this[type].set(info[type]);
	    else if(typeof init != undefined)
		this[type].set();
	}
    };

    this.apply_all = function(){
	var prop;
	for(prop in types){
	    this[prop].apply();
	}
	if(typeof element.childs != 'undefined'){
	    //this is frame
	    var child;
	    for(child in element.childs){
		for(prop in types){
		    element.childs[child].props_manager[prop].apply();
		}
	    }
	}
    };
    
}


function ui(){
    Gtk.init(null);
    Clutter.init(null);
    Gst.init(null, null);
    this.root = new Gtk.Window({ type : Gtk.WindowType.TOPLEVEL });
    this.root.title = 'GJS Compositer';
    this.root.show();
    this.element.prototype.comp = this;
    this.anim.prototype.comp = this;

    var cembed = new GtkClutter.Embed();
    cembed.show();
    this.root.add(cembed);
    var stage = this.root_actor  = cembed.get_stage(),
    root = this.root = new this.frame({ x : 0, y : 0, width : 100, height : 200, opacity : 1 });
    cembed.connect('configure-event', 
		      function(window, event){
			  var width = stage.get_width(),
			      height = stage.get_height();
			  if(root.props_manager.width.get() != width){
			      root.props_manager.width.set(width);
			      root.props_manager.width.apply();
			  }
			  if(root.props_manager.height.get() != height){
			      root.props_manager.height.set(height);
			      root.props_manager.height.apply();
			  }
		      });
    this.root_actor.add_actor(root.actor);
};

ui.prototype = {
    _listened_elems : {}, //for events				     ,
    element : element,
    frame : frame,
    image : image,
    text : text,
    button : button,
    entry : entry,
    video : video,
    anim : animation
};

module.exports = ui;