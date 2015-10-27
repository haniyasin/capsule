/*
 * file choose ui element
 * 
 */
const Gtk = imports.gi.Gtk;
//const Gdk = imports.gi.Gdk;
const GtkClutter = imports.gi.GtkClutter;
const Clutter = imports.gi.Clutter;

var comp = require('./Compositer');

function filechooser(){  
    return new comp.element_proto('filechooser', {
				      create : function(info, options){
					  var element = new comp.element_obj_proto(new Clutter.Actor(), info);
					  element.actor.show();
					  return  {
					      id : comp.elements.put(element),
					      on_choose : function(callback){}
					  };
				      }
				  });
}
comp.manager.add(filechooser);