var base64 = require('platforms/' + proc.platform + '/modules/base64'),
fs = require('platforms/' + proc.platform + '/modules/fs'),
path = require('platforms/' + proc.platform + '/modules/path'),
mkpath = require('platforms/' + proc.platform + '/modules/mkpath.js');

var dutils = require('deployer/utils');
var cb_synchronizer = require('parts/cb_synchronizer');

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
	
	for(var child_ind in this.childs){
	    var child = this.childs[child_ind];
	    var child_generated = child[1].generate();
	    
            generated.constructor += 'current.' + child[0] + ' = ' + child_generated.constructor;
	}

	generated.constructor += 'return current;})({});\n'; //тут надо вписать имя родителя	

	return generated;
    };

    assembler.do_file = function(name, file_path){
	var flags = this.s.flags,
	self = this;

	function module_declare(content){
	    var module_load = new module_load_emitter(self.get_path(name), content, name);
	    self.block +=  module_load.emit_declare();
	    var _block_load = module_load.emit_load();
	    
	    if(!flags.preload)
		self.block_load += _block_load;		    
	    else 
		self.block += _block_load;	    
	}

	var content;
	switch(this.s.type){
	    case dutils.types.module:
	    content = fs.readFileSync(file_path,"utf8");
	    module_declare(content);
	    break;
	case dutils.types.image : 
	    content = fs.readFileSync(file_path);
	    var itype;
	    switch(path.extname(file_path)){
		case '.png' :
		itype = 'png';
		break;
		case '.svg' : 
		itype = 'svg+xml';
		break;
	    }
	    module_declare("var timage = require('types/image');\n module.exports = new timage(\"" + itype + "\", \"base64\", \"" + base64.encode(content) + "\");");
	    break;
	}
    };

    return assembler;
}

exports.assemble = function(dir, config){
    var assembler = assembler_constructor(dir);
    dutils.walk_and_do('deployer/configs', assembler);
    dutils.walk_and_do('platforms/gjs/deployer/configs', assembler);
    dutils.walk_and_do(dir, assembler);
    var generated = assembler.generate();

    generated.constructor = fs.readFileSync('parts/module_loader.js', 'utf8')
        + "var Gtk = imports.gi.Gtk;"
        + "var GtkClutter = imports.gi.GtkClutter;"
        +  "GtkClutter.init(null);"

        + "var console = { log : function(){print.apply(null, arguments);} };"
	+ "function constructor(module_loader){\n return " 
	+ generated.constructor + '}\n';
    if(config.values.hasOwnProperty('entry'))
	generated.constructor += '(function(env){ env.' + config.values.entry + '(env);})(constructor(new module_loader())); \n Gtk.main();';
    else
	console.log('entry point must will be setted in config.js');

    
    config.values.state = 'assembled';
    config.write();	
    fs.writeFileSync(dir + '/assembled/application.js', generated.constructor);
};

exports.deploy = function(dir, config){
};

exports.run = function(dir, config){
    require(dir + '/assembled/application');
};    

