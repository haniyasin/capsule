var fs = require('platforms/' + proc.platform + '/modules/fs');
//var mkpath = require('platforms/' + proc.platform + '/modules/mkpath');
//var path = require('platforms/' + proc.platform + '/modules/path');

var dutils = require('deployer/utils.js');

function assembler_constructor(dir){
    var assembler = new dutils.assembler_constructor(dir);

    assembler.constructor = assembler_constructor;
    assembler.block = '';
    assembler.block_load = '';
    assembler.files_to_copy = [];

    assembler.generate = function(){
	var generated = {
	    constructor : ''
	};
	
	generated.constructor += "(function(current){";
	
	if(this.s.flags.preload == false){
	    generated.constructor += 'current.load=' + '(function(current){ return function(){' + this.block_load  + '}})(current);';			         
	}else
	    generated.constructor += this.block_load;


	for(child_ind in this.childs){
	    var child = this.childs[child_ind];
	    var child_generated = child[1].generate();
	    
            generated.constructor += 'current.' + child[0] + ' = ' + child_generated.constructor;
	    this.files_to_copy = this.files_to_copy.concat(child[1].files_to_copy);
	}

	generated.constructor += 'return current;})({});\n'; //тут надо вписать имя родителя	
	
	return generated;
    };

    assembler.do_file = function(module_name, file_path){
	this.block_load += 'current';
	if(module_name != 'this')
	    this.block_load += '.' + module_name;
	
	var _new_path = this.get_path(module_name);
	this.block_load += ' = ' + "require('./" + _new_path + "');\n";	    

	this.files_to_copy.push({"path" : file_path, 
				 "new_path" : this.dir + '/assembled/' + _new_path});
    };

    return assembler;
}

exports.assemble = function(dir, config){
    var assembler = assembler_constructor(dir);
    dutils.walk_and_do('deployer/configs', assembler);
    dutils.walk_and_do(dir, assembler);
    var generated = assembler.generate();
    fs.writeFileSync(dir + '/assembled/constructor.js', "exports.environment =" + generated.constructor);
    fs.writeFileSync(dir + '/assembled/files_to_copy.json', JSON.stringify(assembler.files_to_copy));
    
    var files_to_copy = assembler.files_to_copy;
    for(file in files_to_copy){
	(function(file){
	     fs.readFile(files_to_copy[file].path, function(err, content){
			     if(!err){
//				 console.log(path.dirname(files_to_copy[file].new_path));
				 mkpath.sync(path.dirname(files_to_copy[file].new_path));
				 fs.writeFileSync(files_to_copy[file].new_path, content);
			     }else {
				 console.log('something is going wrong in file reading');
			     }
			 });	    
	 })(file);	
    }
    
    config.values.state = 'assembled';
    config.write();
};

exports.deploy = function(dir, config){
    //копируем все файлы в папку для развёртывания, указанную в конфиге развёртывателя
},

exports.run = function(dir, config){    
    var env = require('../../' + dir + '/assembled/constructor.js').environment;
//    console.log(__dirname);
    if(config.values.hasOwnProperty('entry')){
	new Function('env', 'env.' + config.values.entry + '(env);')(env);
    }
    else
	console.log('entry point must will be setted in config.js');
}        
