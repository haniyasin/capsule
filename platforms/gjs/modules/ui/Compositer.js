/*
 * gjs platform Compositer module based on modern gnome technologies - mix of clutter and gtk+
 * author Nikita Zaharov aka ix(ix@2du.ru)
 */

const Gtk = imports.gi.Gtk;
const Clutter = imports.gi.Clutter;

function frame(){
    return new element_proto('frame', {
				 'create' : function(info){
				     var element = element_obj_proto('surface');
				     return elements.put(element);
				 },
				 'destroy' : function(id){
				     var element = elements.free(id);
				 },
				 'add' : function(parent_id, child_id){
				     var child = elements.take(child_id);
				     if(!parent)
					 this.root.add(child);
				 }
			     });
}

function image(){
    return  new element_proto('image', {
				  'create' : function(info){
				      var label = new Gtk.Label({ label : 'HOHOHO'});
				      label.show();
				      return label;
				  },
				  'destroy' : function(id){
				  }
			      });
}

function text(){
    return new element_proto('text', {
				 'create' : function(info){
				 },
				 'destroy' : function(id){
				 }
			     });
}

function button(){
    return new element_proto('button', {
				 'create' : function(info){
				 },
				 'destroy' : function(id){
				 }
			     });
}

function entry(){
    return new element_proto('entry', {
				 'create' : function(info){
				 },
				 'destroy' : function(id){
				 }
			     });
}

function element_proto(name, props){
    this.name = name;
    this.props = props;    
}

function element_obj_proto(surface){
    this.surface = surface; //Clutter actor
}

var elements = {
    'Pool' : [],
    'put' : function(element){
	
    },

    'take' : function(id){
    },

    'free' : function(id){
    }
}

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

function comp(){
    manager.assemble(this);
/*
//    Clutter.init('ee', 'erere');
    var stage = Clutter.Stage.get_default();
    stage.title = 'GJS Compositer module prototype';
    stage.set_color(new Clutter.Color( {red:150, blue:0, green:0, alpha:255} ));
    stage.show ();
    //Clutter.main ();
*/
    this.root = new Gtk.Window({ type : Gtk.WindowType.TOPLEVEL });
    this.root.title = 'GJS compositer module prototype';
    this.root.show();
//    print(JSON.stringify(this));
}

exports.elements = elements;

exports.manager = manager;

exports.create = function(){
    return new comp();
}