var fs = require('platforms/' + proc.platform + '/modules/fs');

var types = {
    "envelop" : 1,
    "module" : 2,
    "script" : 3,
    "image" : 4
};

function tree_walker(tree, assembler){
    for(var key in tree){
	if(typeof(tree[key]) == 'boolean')
	    assembler.set_flag(key,tree[key]);
	else
	    if(typeof(tree[key]) == 'string'){
		if(key == 'type')
		    assembler.set_type(tree[key]);
		else 
		    if(key == 'depend')
			assembler.s.depend = tree[key];
		else 
		    assembler.do_file(key, tree[key]);
	    }
	else 
	    if(typeof(tree[key]) == 'object'){
		var child_assembler = assembler.find_child(key);
		if(!child_assembler){
		    var state = assembler.pop_state();
		    child_assembler = assembler.create_child(key);
		    child_assembler.push_state(state);		
		}
		tree_walker(tree[key], child_assembler);
	    }
	else
	    console.log('unexpectial key', key);
    }
}

function assembler_constructor(dir){
    this.name = null;

    this.dir = dir;
    this.s = {
	flags : { 'preload' : false
		},
	type : types.envelope,
	depend : null
    };

    this.childs = [];
    this.parent = null;
    
    this.get_path = function(name){
	var path = this.name;
	var parent = this.parent;
	while(parent != null && parent.name != null && parent.name != 'capsule'){
	    path = parent.name + '/' + path;	    
	    parent = parent.parent;
	}

	var _name = name == 'this' ? '.js' : name + '.js';
	if(path == null)
	    path = _name;
	else
	    path += _name == '.js' ? _name : '/' + _name;
	
	return path;
    };

    this.set_flag = function(name, value){
	this.s.flags[name] = value;
    };
    
    this.set_type = function(name){
	if(types.hasOwnProperty(name)){
	    this.s.type = types[name];
	}else
	    console.log('unexpectial type');
    };
    
    this.push_state = function(state){
	this.s = JSON.parse(JSON.stringify(state));
    };

    this.pop_state = function(){
	return this.s;
    };

    this.create_child = function(name){
	var assembler = this.constructor(dir);
	this.childs.push([name, assembler]);
	assembler.parent = this;
	assembler.name = name;
	return assembler;
    };

    this.find_child = function(name){
	for(var child in this.childs){
	    if(this.childs[child][0] == name)
		return this.childs[child][1];
	}
	return null;
    };
}

exports.tree_walker = tree_walker;

exports.assembler_constructor = assembler_constructor;

exports.types = types;

exports.config = function(dir){
    try {
	this.values = JSON.parse(fs.readFileSync(dir + '/config.json').toString());		
        this.write = function(){
	    fs.writeFileSync(dir + '/config.json', JSON.stringify(this.values));
	};	
    } catch (x) {
	console.log('config.json is not exists');
	console.log(x.message);
    }    
}

exports.walk_and_do = function(dir, assembler){    
    var filenames = fs.readdirSync(dir);
    for(var ind in filenames){
	if(filenames[ind].substr(filenames[ind].length - 4,4) == 'json' &&
	   filenames[ind] != 'config.json'){
	    tree_walker(JSON.parse(fs.readFileSync(dir + '/' + filenames[ind]).toString()), assembler);
	}
    }

    dir += '/assembled/';
    if(!fs.existsSync(dir))
	fs.mkdir(dir);
};
