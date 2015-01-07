/*
 * drag and drop interface.
 */

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Clutter = imports.gi.Clutter;
const GtkClutter = imports.gi.GtkClutter;

var comp = require('./Compositer');

function dnd(){
    return new comp.element_proto('dnd', 
				  {
				      /*
				       * DND source constructor
				       * 
				       */
				      actions : {
					  copy : 1,
					  move : 2
				      },
				      source_create : function(info, options, target_list, action_after){
					  this.element;
					  //data_request, data_delete, begin, end, failed
					  this.on = function(){
					      
					  };
					  this.destroy = function(){
					  };
				      },
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
				      destination_create : function(info, options, target_list, action_after){
					  var widget =  Gtk.Label.new('DND');	
					  var element = new comp.element_obj_proto(GtkClutter.Actor.new_with_contents(widget), info);
					  
					  widget.drag_dest_set(Gtk.DestDefaults.ALL, null, 2, Gdk.DragAction.COPY);
					  widget.drag_dest_add_text_targets();
					  widget.drag_dest_add_uri_targets();

					  return {
					      id : comp.elements.put(element),
					      //motion, leave, data, drop
					      on : function(event, callback){
						  switch(event){
						      case 'motion' :
						      widget.connect('drag-motion', function(widget, context, x, y){
									 context = {
									 };
									 return callback(context, x, y);
								     });
						      break;

						      case 'leave' : 
						      widget.connect('drag-leave', function(widget, context, x, y, t){
									 context = {
									 };
									 return callback(context, x, y);
								     });
						      break;
						      
						      case 'drop':
						      widget.connect('drag-drop', function(widget, context, x, y, t){
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
						      widget.connect('drag-data-received', function(widget, context, x, y, data, info, time){
									 var dstr = data.get_data();
//									 dstr.shift();
//									 print(JSON.stringify(dstr), dstr.length);
									 dstr[dstr.length - 2] = '\0';
									 context = {
									   data : dstr
									 };
//									 print('data', data.get_data_type(), data.get_data());
									 return callback(context, x, y);
								     });
						      break;
						  }
					      },
					      destroy : function(){
				      		  var element = comp.elements.take(this.id);
						  element.actor.unref();
						  element = undefined;
						  elements.free(this.id);
					      }
					  };
				      }
			     });
}

comp.manager.add(dnd);    
//    print('la', JSON.stringify(comp.manager), 'ho', comp.element_proto, 'dra');

