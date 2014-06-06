const Gtk = imports.gi.Gtk;
const Clutter = imports.gi.Clutter;

function frame(){
    
}

function image(){
    
}

function text(){
    
}

function button(){
    
}

function entry(){
    
}

function element_proto(){
    this.name = 'proto';
    
}

function Pool(){
    
}

var manager = {
    'add' : function(element_constructor){
    }    
}

function comp(){
    manager.add(this, frame);
    manager.add(this, image);
    manager.add(this, text);
    manager.add(this, button);
    manager.add(this, entry);

//    Clutter.init('ee', 'erere');
    var stage = Clutter.Stage.get_default();
    stage.title = 'GJS Compositer module prototype';
    stage.set_color(new Clutter.Color( {red:150, blue:0, green:0, alpha:255} ));
    stage.show ();
    //Clutter.main ();

    var window = new Gtk.Window({ type : Gtk.WindowType.TOPLEVEL });
    window.title = 'GJS compositer module prototype';
    window.show();
    this.frame_add = function(parent, child){
	if(!parent)
	    window.add(child);
    };
    
    this.image_create = function(info){
	var label = new Gtk.Label({ label : 'HOHOHO'});
	label.show();
	return label;
    };    
}

exports.manager = manager;

exports.create = function(){
    return new comp();
}