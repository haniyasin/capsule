var fs = require('fs');
var mkpath = require('../../dependencies/mkpath.js');
var path = require('path');

var dutils = require('../../parts/deployer_utils.js');
var cb_synchronizer = require('../../parts/cb_synchronizer.js');

function module_load_emitter(path, code, module_name){
    this.emit_declare = function(){
	    var func_name = module_name;
	    if(module_name == 'this')
		func_name = 'upper';
	    return "function _" + func_name + "(module, exports, require){\n" + code + "\n};" + 
		"module_loader.add(\"" + path + "\",_" + func_name + ");";
    };
    
    this.emit_load = function(){
	if(module_name == 'this')
	    return "current = module_loader.load(\'" + path + "\');";
	
	return 'current.'+ module_name  + ' = ' + "module_loader.load(\'" + path + "\');";
    };    
}

function assembler_constructor(dir){
    var assembler = new dutils.assembler_constructor(dir);
    assembler.constructor = assembler_constructor;
    assembler.block = '';
    assembler.block_load = '';

    assembler.generate = function(){
	var generated = {
	    constructor : ''
	};
	
	generated.constructor += "(function(current){" + this.block;

	if(this.s.flags.preload == false){
	    generated.constructor += 'current.load=' + '(function(current){ return function(){' + this.block_load  + '}})(current);';			         
	}else
	    generated.constructor += this.block_load;
	
	for(child_ind in this.childs){
	    var child = this.childs[child_ind];
	    var child_generated = child[1].generate();
	    
            generated.constructor += 'current.' + child[0] + ' = ' + child_generated.constructor;
	}

	generated.constructor += 'return current;})({});\n'; //тут надо вписать имя родителя	

	return generated;
    };

    assembler.do_file = function(name, file_path){
	var flags = this.s.flags;
	if(this.s.type == dutils.types.module){
	    var content = fs.readFileSync(file_path,"utf8");
	    var module_load = new module_load_emitter(file_path, content, name);
	    this.block +=  module_load.emit_declare();
	    var _block_load = module_load.emit_load();
	    
	    if(!flags.preload)
		this.block_load += _block_load;		    
	    else 
		this.block += _block_load;
	}
    }

    return assembler;
}

exports.assemble = function(dir, config){
    var assembler = assembler_constructor(dir);
    var generated = dutils.assemble(dir, assembler);
    generated.constructor = fs.readFileSync('platforms/browser/module_loader.js', 'utf8')
        + "var Gtk = imports.gi.Gtk;"
        +  "Gtk.init(null);"

        + "var console = { log : function(){log(JSON.stringify(arguments));} };"
	+ "function constructor(module_loader){\n return " 
	+ generated.constructor + '}\n';
    if(config.values.hasOwnProperty('entry'))
	generated.constructor += '(function(env){ env.' + config.values.entry + '(env);})(constructor(new module_loader())); \n Gtk.main();';
    else
	console.log('entry point must will be setted in config.js');

    
    config.values.state = 'assembled';
    config.write();	
    console.log('jhhhheee');
    fs.writeFileSync(dir + '/assembled/application.js', generated.constructor);
}

exports.deploy = function(dir, config){
}

exports.run = function(){
}    

