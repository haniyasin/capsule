/*
 * Compositer module based on modern gnome technologies - mix of clutter and gtk+
 * 
 * author Nikita Zaharov aka ix(ix@2du.ru)
 * 
 * version 0.2
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
    event_dispatcher = require('parts/event_dispatcher'),
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
}

element.prototype = new event_dispatcher();

element.prototype.init = function(actor, info){
    this.event_dispatcher_init();
    this.catch_on(['pointer_down', 'pointer_up', 'pointer_in', 'pointer_out', 'pointer_motion', 'key_down', 'key_up'], element_catcher_on); 
    this.id = id_allocator.alloc();
    this.props_manager = new props_manager(this);
    this.actor = actor; //Clutter actor
    this.props_manager.set_all(info, true);
};

element.prototype.change_props = function(info){
    this.props_manager.set_all(info, true);
    this.props_manager.apply_all();    
};

function element_catcher_on(event_name, callback){
    if(callback !== 'undefined'){
	this.actor.reactive = true;
	var mouse_handler = new _event_mouse_handler(this, event_name);
	switch(event_name){
	case 'pointer_down' :
	    this.actor.connect('button-press-event', mouse_handler.handle);
	    break;
	    
	case 'pointer_up' : 
	    this.actor.connect('button-release-event', mouse_handler.handle);
	    break;
	    
	case 'pointer_in' :
	    this.actor.connect('enter-event', mouse_handler.handle);
	    break;
	    
	case 'pointer_out' :
	    this.actor.connect('leave-event', mouse_handler.handle);
	    break;
	    
	case 'pointer_motion' : 
	    this.actor.connect('motion-event', mouse_handler.handle);
	    break;
	    
	case 'key_down' :
	    this.actor.connect('key-press-event', callback);
	    break;
	    
	case 'key_up' : 
	    this.actor.connect('key-release-event', callback);
	    break;
	}	    
    } //else FIXME здесь мы должны задисконнектить нужные сигналы 	    //unregister

    return true;
};


element.prototype.destroy = function(){
    //FIXME
};

function frame(info){
    this.init(new Clutter.Actor(), info);
    this.children = [];
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
    this.children.push(child);
    child.props_manager.apply_all();
};

frame.prototype.remove = function(child){
    this.actor.remove_child(child.actor);
    //FIXME найти в children и удалить
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
    this.actor.set_font_name("Sans 26");
    this.actor.set_text(info.text);
    this.actor.show();
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
    this.on_press = function(callback){widget.connect('pressed', callback);};
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
    this.get_value = function(){ return widget.get_text(); };
    this.set_value = function(value){ widget.set_text(value); };
    this.on_text_change = function(callback){ widget.connect('activate', callback); };
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
	load_video(this, info);
    };

    this.play = function(){ this.pipeline.set_state(Gst.State.PLAYING); };
    this.pause = function(){ this.pipeline.set_state(Gst.State.PAUSED); };
    this.set_position = function(msecond){ this.pipeline.seek_simple(Gst.Format.TIME, Gst.SeekFlags.FLUSH, msecond *Gst.MSECOND); };	
    this.get_position = function(){ return this.pipeline.query_position(Gst.Format.TIME)[1] / Gst.MSECOND; };
    this.get_duration = function(){ return this.pipeline.query_duration(Gst.Format.TIME)[1] / Gst.MSECOND; };
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
    var timeline = this.comp.timeline,
        self = this,
        started = this.comp.started ? this.comp.started : this.comp.started = [],
        animated = this.animated;

    animated[element.id].cur_frame = 0;
    started.push(animated[element.id]);
    if(timeline == undefined){
	timeline = this.comp.timeline = new Clutter.Timeline({duration : 1000});
	
	timeline.connect('new-frame', 
			 function() {
			     var sanim_ind = started.length - 1, banim, element;
			     while(sanim_ind >= 0){
				 banim = started[sanim_ind];
				 element = started[sanim_ind].element;
				 if(banim.cur_frame < banim.frames.length){
				     var changing_props = banim.frames[banim.cur_frame], prop_name;
				     for (prop_name in changing_props){
					 element.props_manager[prop_name].update(changing_props[prop_name]);
//					 print(prop_name, changing_props[prop_name]);
					 element.props_manager[prop_name].apply();
				     }
				     banim.cur_frame++;
				 }else{
				     started.splice(sanim_ind, 1);
				     element.emit('animation_stopped');
				 }
				 sanim_ind--;
			     }
			 });
	timeline.set_loop(true);
	timeline.start();					 
    }
};

animation.prototype.stop = function(element){
    //FIXME stub
};

function _event_mouse_handler(element,event_name){
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
	
	element.emit(event_name, pointer_obj);
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
	    element.actor['set_' + prop_name](value);

	    //for frame recalculating all children for properly % geometry
	    var echild;
	    if(element.hasOwnProperty('children')){
		var child;
		for(child in element.children){
		    echild = element.children[child];
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
		element.actor.opacity = this.value * 2.55;
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
	    this.value = -1 * value;
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
	if(typeof element.children != 'undefined'){
	    //this is frame
	    var child;
	    for(child in element.children){
		for(prop in types){
		    element.children[child].props_manager[prop].apply();
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
    this.timeline = null;
    this.anim.prototype.comp = this;
    this.element.prototype.comp = this;
    this.anim.prototype.comp = this;

    var cembed = new GtkClutter.Embed();
    cembed.show();
    this.root.add(cembed);
    var stage = this.root_actor  = cembed.get_stage(),
    root = this.root = new this.frame({ x : 0, y : 0, width : 200, height : 200, opacity : 1 });
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
    element : element,
    frame : frame,
    image : image,
    text : text,
    button : button,
    entry : entry,
    video : video,
    anim : animation
};

exports.ui = ui;
exports.element = element;
