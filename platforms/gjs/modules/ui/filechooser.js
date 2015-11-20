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

function choose_catcher(event_name, callback){
    this.widget.connect('file-set', function(widget){
			    callback(new file(widget.get_uri()));
			});
}

function filechooser(info, options){  
    if(!file)
	file = require('../../types/file');
    
    if(!info.hasOwnProperty('label'))
	info.label = 'Выберите файл';
    
    var widget =  Gtk.FileChooserButton.new(info.label, Gtk.FileChooserAction.OPEN);
    this.init(GtkClutter.Actor.new_with_contents(widget), info);
    this.widget = widget;
    
    this.actor.show();
    this.catch_on('choose', choose_catcher);
};

comp.ui.prototype.filechooser = filechooser;
