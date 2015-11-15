/*
 * file choose ui element
 * 
 */
const g = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const GtkClutter = imports.gi.GtkClutter;
const Clutter = imports.gi.Clutter;

var comp = require('./Compositer'),
    file;

function filechooser(){  
    return new comp.element_proto('filechooser', {
				      create : function(info, options){
					  if(!file)
					      file = require('../../types/file');

					  if(!info.hasOwnProperty('label'))
					     info.label = 'Выберите файл';

					  var widget =  Gtk.FileChooserButton.new(info.label, Gtk.FileChooserAction.OPEN),
					      element = new comp.element_obj_proto(GtkClutter.Actor.new_with_contents(widget), info);
					  element.widget = widget;
					  
					  element.actor.show();
					  return  {
					      id : comp.elements.put(element),
					      on_choose : function(callback){
						  widget.connect('file-set', function(widget){
								     callback(new file(widget.get_uri()));
								 });
					      }
					  };
				      }
				  });
}
comp.manager.add(filechooser);