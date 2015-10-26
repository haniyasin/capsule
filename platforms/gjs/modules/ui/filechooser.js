/*
 * file choose ui element
 * 
 */
const Gtk = imports.gi.Gtk;
//const Gdk = imports.gi.Gdk;
const GtkClutter = imports.gi.GtkClutter;

var comp = require('./Compositer');

function filechooser(){  
    return new comp.element_proto('filechooser', {
				      create : function(info, options){
					  return  {
					      id : 'hh',
					      on_choose : function(callback){}
					  };
				      }
				  });
}
comp.manager.add(filechooser);