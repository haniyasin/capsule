/*
 * drag and drop interface.
 */

const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const GtkClutter = imports.gi.GtkClutter;

var comp = require('./Compositer'),
    tfile;

function dnd_source(info, options, target_list, action_after){
    this.actions = {
	copy : 1,
	move : 2
    };

    this.element;
}

dnd_source.prototype = new comp.element();

					  //data_request, data_delete, begin, end, failed
//dnd_source.prototype.on = function(){
//    
//};

dnd_source.prototype.destroy = function(){
};

comp.prototype.dnd_source = dnd_source;
				      //				     var widget = new Gtk.Entry();
				      //				     widget.set_placeholder_text(info.placeholder);
				      //				     var element = new element_obj_proto(GtkClutter.Actor.new_with_contents(widget), info);
				      //				     element.widget = widget;
				      //				     element.actor.show();
				      //				     return elements.put(element);
				      //return elements.take(id).control;				     

/*
 * DND destination constructor
 */
function dnd_dest(info, options, target_list, action_after){
    if(!tfile)
	tfile = require('types/file');
    var widget = this.widget =  Gtk.Label.new('DND');	
    this.init(GtkClutter.Actor.new_with_contents(widget), info);
    
    widget.drag_dest_set(Gtk.DestDefaults.ALL, null, 2, Gdk.DragAction.COPY);
    widget.drag_dest_add_text_targets();
    widget.drag_dest_add_uri_targets();
}

dnd_dest.prototype = new comp.element();

//motion, leave, data, drop
dnd_dest.on_ = function(event, callback){
    switch(event){
    case 'motion' :
	this.widget.connect('drag-motion', function(widget, context, x, y){
				context = {
				};
				return callback(context, x, y);
			    });
	break;

    case 'leave' : 
	this.widget.connect('drag-leave', function(widget, context, x, y, t){
				context = {
				};
				return callback(context, x, y);
			    });
	break;
		
    case 'drop':
	this.widget.connect('drag-drop', function(widget, context, x, y, t){
				var _context = {
				    
				};
				if(callback(_context, x, y)){
				    Gtk.drag_finish(context, true, false, t);									     
				    return true;
				}
				
				return false;
			    });
	break;
	
    case 'data' : 
	this.widget.connect('drag-data-received', function(widget, context, x, y, data, info, time){
				var dstr = data.get_data();
				//									 dstr.shift();
				//									 print('dfdffff');
				//									 dstr[dstr.length - 2] = '\0';
				//									 print(dstr);
				context = {
				    file : new tfile(dstr)
				};
				//									 print('data', data.get_data_type(), data.get_data());
				return callback(context, x, y);
			    });
	break;
    }
};

dnd_dest.prototype.destroy = function(){
    this.actor.unref();
    this.widget.unref();
};

comp.prototype.dnd_dest = dnd_dest;


