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

var error = require('../../../../parts/error.js');

function set_random_background(actor){
    var color = new Clutter.Color();
    color.alpha = 200;
    color.blue = Math.random() * 255;
    color.red = Math.random() * 255;
    color.green = Math.random() * 255;
    actor.set_background_color(color);    
}

function frame(){
    return new element_proto('frame', {
				 create : function(info){
				     var element = new element_obj_proto(new Clutter.Actor(), info);
				     element.childs = [];
				     element.actor.show();
				     if(info.hasOwnProperty('background_random'))
					 set_random_background(element.actor);    
				     return elements.put(element);
				 },
				 destroy : function(id){
				     var element = elements.take(id);
				     elements.free(id);
				     element.actor.unref();
				     element = undefined;
				 },
				 add : function(parent_id, child_id){
				     var child = elements.take(child_id);
				     var parent = elements.take(parent_id);
				     parent.childs.push(child);
				     child.parent = parent;
				     parent.actor.add_actor(child.actor);
				     child.props_manager.apply_all();
				 },
				 remove : function(parent_id, child_id){
				     var parent = elements.take(parent_id);
				     var child = elements.take(child_id);
				     parent.actor.remove_child(child.actor);
				     child.parent = undefined;
				 }
			     });
}

function image(){
    return  new element_proto('image', {
				  create : function(info){
				      var element = new element_obj_proto(new Clutter.Actor(), info);
				      element.actor.show();
				      if(info.hasOwnProperty('source')){
					  var re_result;
					  if((re_result = /data:image\/(\w+);base64,/.exec(info.source))){
					      var data = info.source.substr(re_result[0].length);
					      if( re_result[1] == 'png'){
						  var loader = GdkPixbuf.PixbufLoader.new_with_type('png');
						  print(loader.write(GLib.base64_decode(data)));
					//	  loader.set_size(100, 100);
						  var pixbuf = loader.get_pixbuf();
						  element.image = new Clutter.Image();
						  element.image.set_data(pixbuf.get_pixels(),
									 pixbuf.get_has_alpha() ? Cogl.PixelFormat.RGBA_8888 : Cogl.PixelFormat.RGB_888,
									 pixbuf.get_width(),
									 pixbuf.get_height(),
									 pixbuf.get_rowstride());
						  element.actor.content = element.image;
					      } else if( re_result[1] == 'svg'){
					      }
					      
					  } else
					      return error('comp.image', 'invalid content of source field');
					     
				      } else {
					  print('comp.image', 'please set image.source');
					  set_random_background(element.actor);    
				      }
				      return elements.put(element);
				  },
				  destroy : function(id){
				      var element = elements.take(id);
				      element.actor.unref();
				      element.image.unref();
				      elements.free(id);
				  }
			      });
}

function text(){
    return new element_proto('text', {
				 create : function(info){
				     var element = new element_obj_proto(new Clutter.Text(), info);
				     if(!info.hasOwnProperty('text'))
					 info.text = 'text';
				     element.actor.set_text(info.text);
				     element.actor.show();
				     return elements.put(element);
				 },
				 destroy : function(id){
				     elements.take(id).actor.unref();
				     elements.free(id);
				 }
			     });
}

function button(){
    return new element_proto('button', {
				 create : function(info){
				     if(!info.hasOwnProperty('label'))
					 info.label = 'button';
//				     print(Gtk.Button.new_with_label);
				     var widget = Gtk.Button.new_with_label(info.label);
				     var element = new element_obj_proto(GtkClutter.Actor.new_with_contents(widget), info);
				     element.widget = widget;
				     element.actor.show();
				     element.control = {
					 on_press : function(callback){
					     element.widget.connect('pressed', callback);
					 }
				     };
				     return elements.put(element);
				 },
				 get_control : function(id){
				     return elements.take(id).control;
				 },
				 destroy : function(id){
				     var element = elements.take(id);
				     element.actor.unref();
				     element.widget.unref();
				     elements.free(id);
				 }
			     });
}

function entry(){
    return new element_proto('entry', {
				 create : function(info){
				     if(!info.hasOwnProperty('placeholder'))
					 info.placeholder = 'enter text';
				     var widget = new Gtk.Entry();
				     widget.set_placeholder_text(info.placeholder);
				     var element = new element_obj_proto(new GtkClutter.Actor.new_with_contents(widget), info);
				     element.widget = widget;
				     element.actor.show();
				     element.control = {
					 'on_text_change' : function(callback){
					     element.widget.connect('activate', callback);
					 }
				     };
				     return elements.put(element);
				 },
				 get_control : function(id){
				     return elements.take(id).control;				     
				 },
				 destroy : function(id){
				     var element = elements.take(id);
				     element.actor.unref();
				     element.widget.unref();
				     elements.free(id);
				 }
			     });
}

function video(){
    return new element_proto('video', {
				 create : function(info){
				     var element = new element_obj_proto(new Clutter.Texture( {}), info);
				     if(!info.hasOwnProperty('source'))
					 info.source = "uri=http://docs.gstreamer.com/media/sintel_trailer-480p.webm";
				     element.pipeline = Gst.parse_launch("playbin " + info.source);
				     element.sink = new ClutterGst.VideoSink();
//				     element.sink = Gst.ElementFactory.make('cluttersink', 'bat');
				     element.sink.texture = element.actor;
				     element.pipeline.video_sink = element.sink;
				     
//				     element.actor.add_child(element.actor);
				     element.actor.show();

				     element.control = {
					 play : function(){
					     element.pipeline.set_state(Gst.State.PLAYING);
					 },
					 pause : function(){
					     element.pipeline.set_state(Gst.State.PAUSED);
					 },
					 set_position : function(msecond){	
					     element.pipeline.seek_simple(Gst.Format.TIME, Gst.SeekFlags.FLUSH, msecond * Gst.MSECOND);				     
					 },
					 get_position : function(){
					     return element.pipeline.query_position(Gst.Format.TIME)[1] / Gst.MSECOND;
					 },
					 get_duration : function(){
					     return element.pipeline.query_duration(Gst.Format.TIME)[1] / Gst.MSECOND;
					 },
					 get_volume : function(){
					     return 100;
					 },
					 set_volume : function(volume){
					     
					 },
					 on_timeupdate : function(callback){
					     var curtime = 0;
					     let self = this;
					     GLib.timeout_add(GLib.PRIORITY_HIGH, 200, function(){
								  if(curtime < self.get_position()){
								      print('hoho');
								      callback();
								      curtime = self.get_position();
								  }
								  return true;
							      });   
					 }
 				     };
				     return elements.put(element);
				 },
				 get_control : function(id){
				     return elements.take(id).control;
				 },
				 destroy : function(id){
				     var element = elements.take(id);
				     element.actor.unref();
				     element.pipeline.unref();
				     element.sink.unref();
				     elements.free(id);
				 }
			     });
}

function element(){
    return new element_proto('elemement', {
				 change_props : function(id, info){
				     var element = elements.take(id);
				     element.props_manager.set_all(info);
				     element.props_manager.apply_all();
				 }
			     });
}

function animation(){
    var anims = new Pool(),
        binded = new Pool,
        started = [],
        fps = 60,
        timeline = null;

    return new element_proto('anim', {
				 create : function(chain){
				     var frames = [];
				     var prev_frames_num = 0;
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
						 return new error('Compositer animation error', 'chain block has no duration propertie');
					     if(typeof actions != 'undefined'){
						 var new_frames_num = prev_frames_num + frames_num;
						 for(action in actions){
						     var step = actions[action] / frames_num;
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
				     return anims.put(frames);
				 },
				 destroy : function(anim_id){
				     anims.free(anim_id);
				 },
				 bind : function(element_id, anim_id){
				     var anim = anims.take(anim_id);
				     //if(anim) проверять и ошибку бросать
				     return binded.put({ element : element_id,  
							 frames : anim });
				 },
				 unbind : function(binded_id){
				     binded.free(binded_id);
				 },
				 start : function(binded_id){
				     comp = this;
				     var banim = binded.take(binded_id);
				     banim.cur_frame = 0;
				     started.push(binded_id);
				     if(timeline == null){
					 timeline = new Clutter.Timeline({duration : 1000});

					 timeline.connect('new-frame', function() {
							      for(sanim_ind in started){
								  var banim = binded.take(started[sanim_ind]);
								  var element = elements.take(banim.element);
								  if(banim.cur_frame < banim.frames.length){
								      var changing_props = banim.frames[banim.cur_frame];
								      for (prop_name in changing_props){
									  element.props_manager[prop_name].update(changing_props[prop_name]);
									  element.props_manager[prop_name].apply();
//									  print(prop_name);
								      }
								      banim.cur_frame++;
								  }else{
								      if(typeof started[sanim_ind] != 'indefined'){
									  var ended_anim = started[sanim_ind];
									  started.splice(sanim_ind, 1);
									  comp.event__emit(ended_anim, 'animation_stopped');
								      }
								  }
							      }
//							      element.actor.set_rotation(Clutter.RotateAxis.Z_AXIS, rotation, 200,0,0);								  
							  });
					 timeline.set_loop(true);
					 timeline.start();					 
				     }
				 },
				 stop : function(binded_id){
				 }
			     });
}

function _event_mouse_handler(listened_elems, element_id, event_name){
    var element = elements.take(element_id);
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
	
	listened_elems[element_id][event_name](pointer_obj);
    };	
}

function event(){
    var listened_elems = {
    };

    return new element_proto('event', {
				 _emit : function(element_id, event_name, event_data){
				     if(listened_elems.hasOwnProperty(element_id)){
					 if(listened_elems[element_id].hasOwnProperty(event_name)){
					     listened_elems[element_id][event_name](event_data);
					 }
				     }
				 },

				 register : function(element_id, event_name, callback){
				     if(!listened_elems.hasOwnProperty(element_id))
					 listened_elems[element_id] = {};
				     listened_elems[element_id][event_name] = callback;
				     var element = elements.take(element_id);
				     element.actor.reactive = true;
				     var mouse_handler = new _event_mouse_handler(listened_elems, element_id, event_name);
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
				 },
				 unregister : function(element_id, event_name){
				     if(!listened_elems.hasOwnProperty(element_id))
					 return new error('event unregister', 'element pointed to has no exists');
				     delete listened_elems[element_id][event_name];
				     return null;
				 }
			     });
}

function element_proto(name, props){
    this.name = name;
    this.props = props;    
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

    function geometry_prop(prop_name, parent_prop_name){
	if(typeof parent_prop_name == 'undefined')
	    parent_prop_name = prop_name;
	this.value = 0,
	this.type = 'p';

	this.set = function(value){
	    if(typeof value == 'undefined')
		return;
	    
	    var re_result;
	    if((re_result = /^(\d+)%$/.exec(value))){
		this.value = parseInt(re_result[1]);
		this.type = '%';
	    } else {
		this.value = value;
	    	this.type = 'p';
	    }
	};

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
	    if(this.type == 'p')
		    return this.value;
	    else 
		if (element.hasOwnProperty('parent'))
		    return element.parent.props_manager[parent_prop_name].get() / 100 * this.value;

	    return null;	    
	};

	this.update = function(inc_value){
	    this.value += inc_value;
	};

	this.apply = function(){
	    var value = this.value;
	    if(this.type == '%' && element.hasOwnProperty('parent')){
		value = element.parent.props_manager[parent_prop_name].get() / 100 * this.value;
	    }

	    element.actor['set_' + prop_name](value);

	    //for frame recalculating all childs for properly % geometry
	    if(element.hasOwnProperty('childs')){
		for(child in element.childs){
		    element.childs[child].props_manager[prop_name].apply();
		}
	    }
	};	
    }

    this.x = new geometry_prop('x', 'width');
    this.y = new geometry_prop('y', 'height');
    this.width = new geometry_prop('width');
    this.height = new geometry_prop('height');
    this.opacity = {
	value : 1,
	get : function() {
	  return this.value;  
	},
	set : function(value){
	    if(typeof value == 'undefined')
		return;
	    this.value = value;
	},
	update : function(inc_value){
	    this.value += inc_value;
	},
	apply : function(){
	    element.actor.opacity = this.value * 255;
	}
    };

    this.z_index = {
	value : 1,
	get : function(){
	    return value * -1;
	},
	set : function(value){
	    if(typeof value == 'undefined')
		return;
	    this.value = value * -1;
	},
	update : function(inc_value){
	    this.value += inc_value; 
	},
	apply : function(){
	    element.actor.z_position = this.value;
	}
    };

    this.set_all = function(info, init){
	for(type in types){
	    if(info.hasOwnProperty(type))
		this[type].set(info[type]);
	    else if(typeof init != undefined)
		this[type].set();
	}
    };

    this.apply_all = function(){
	for(prop in types){
	    this[prop].apply();
	}
	if(typeof element.childs != 'undefined'){
	    //this is frame
		print('eeerrr');
	    for(child in element.childs){
		for(prop in types){
		    element.childs[child].props_manager[prop].apply();
		}
	    }
	}
    };

}

function element_obj_proto(actor, info){
    this.actor = actor; //Clutter actor
    this.props_manager = new props_manager(this);
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
manager.add(video);
manager.add(element);
manager.add(animation);
manager.add(event);

function comp(){
    manager.assemble(this);

    Gtk.init(null);
    Clutter.init(null);
    Gst.init(null, null);
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
    this.frame_create({ x : 0, y : 0, width : 800, height : 400, opacity : 0.9 });
    var element = elements.take(0);
    element.props_manager.apply_all();
    this.root_actor.add_actor(element.actor);
}

exports.elements = elements;

exports.manager = manager;

exports.element_proto = element_obj_proto;

exports.create = function(){
    return new comp();
}