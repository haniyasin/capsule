var fs = require('fs');
var mkpath = require('../../dependencies/mkpath.js');
var path = require('path');

var dutils = require('../../parts/deployer_utils.js');
var cb_synchronizer = require('../../parts/cb_synchronizer.js');

function depend_resolver(depend){
    var depends = depend.split(',');
    this.remove_depend(depend_str);
    this.set_hooks = function(){	
	for(ind in depends){
	    //var element = tree.find(depends[ind]
	    //element.set_depend_hook(this, depends[ind] устанавливаем хук так,чтобы когда зависимость
	    //появлялась вызывала нас так - dresolver.remove_depend(depend_str), где depend_str это
	    // переданная нами depends[ind]
	}

	//
    }

    this.generate();
}

function module_load_emitter(path, code, module_name, inline){
   
    this.emit_declare = function(){
	if(inline){
	    var func_name = module_name;
	    if(module_name == 'this')
		func_name = 'upper';
	    return "function _" + func_name + "(module, exports, require){\n" + code + "\n};" + 
		"module_loader.add(\"" + path + "\",_" + func_name + ");";
	} else 
	    return  "module_loader.add(\"" + path + "\"," + JSON.stringify(code) + ");";
    }
    
    this.emit_load = function(){
	if(module_name == 'this')
	    return "current = module_loader.load(\'" + path + "\');";
	
	return 'current.'+ module_name  + ' = ' + "module_loader.load(\'" + path + "\');";
    }    
}

function assembler_constructor(dir){
    var assembler = new dutils.assembler_constructor(dir);
    assembler.constructor = assembler_constructor;
    assembler.block = '';
    assembler.script_inline = '';
    assembler.block_load = '';
    assembler.files_to_copy = [];

    assembler.generate = function(){
	var generated = {
	    constructor : '',
	    script_inline : ''
	}
	
	generated.constructor += "(function(current){" + this.block;

	if(this.s.depend){
	    var dresolver = depend_resolver(this.s.depend);
	    dresolver.set_hooks();
	    dresolver.generate();
	}

	if(this.s.flags.preload == false){
	    generated.constructor += 'current.load=' + '(function(current){ return function(){' + this.block_load  + '}})(current);';			         
	}else
	    generated.constructor += this.block_load;
	
	for(child_ind in this.childs){
	    var child = this.childs[child_ind];
	    var child_generated = child[1].generate();
	    
            generated.constructor += 'current.' + child[0] + ' = ' + child_generated.constructor;
	    generated.script_inline += child[1].script_inline;
	    this.files_to_copy = this.files_to_copy.concat(child[1].files_to_copy);
	}

	generated.constructor += 'return current;})({});\n'; //тут надо вписать имя родителя	

	return generated;
    }

    assembler.do_file = function(name, file_path){
	var flags = this.s.flags;
	if(this.s.type == dutils.types.script){
	    if(flags.inline){
		this.script_inline += fs.readFileSync(file_path, "utf8");
	    }
	    else {
		var tag = '_' + name;
		this.block += tag + " = document.createElement('script');" + 
		    tag + ".setAttribute('type', 'text/javascript');" + 
		    tag + ".setAttribute('src', '" + file_path +  "');" +
		    "head.appendChild(" + tag + ");";

		this.files_to_copy.push({ "path" : file_path,
					  "new_path" : this.dir + '/deployed/' + file_path});	
	    }
	} else {
	    if(this.s.type == dutils.types.module){
		var content = fs.readFileSync(file_path,"utf8");
		var module_load = new module_load_emitter(file_path, content, name, flags.inline);
		this.block +=  module_load.emit_declare();
		var _block_load = module_load.emit_load();
		
		if(!flags.preload)
		    this.block_load += _block_load;		    
		else 
		    this.block += _block_load;
	    }
	}
    }

    return assembler;
}

function deploy_on_files(dir, config, capsule_files){
    mkpath.sync(dir + '/deployed');
    fs.writeFileSync(dir + '/deployed/capsule.htm', capsule_files.capsule);
    fs.writeFileSync(dir + '/deployed/constructor.js', capsule_files.constructor);

    for(file in capsule_files.files_to_copy){
	var _file = capsule_files.files_to_copy[file];
	mkpath.sync(path.dirname(_file.new_path));
	console.log(_file.new_path)
	fs.writeFileSync(_file.new_path,_file.data);
    }    
}

function deploy_on_http(dir, config, capsule_files, capsule){
    var http_responder = require('../nodejs/modules/http_responder.js');
    http_responder.on_recv({ 'url' : config.values.deploy_url + "/capsule.htm"}, 
			   function (context, response){
					       response.end(capsule_files.capsule);
			   },
			   function(error){console.log('failed', error)})  
    http_responder.on_recv({ 'url' : config.values.deploy_url + '/constructor.js'}, 
			   function (context, response){				
			       response.end(capsule_files.constructor);
			   },
			   function(error){console.log('failed export _construct_func', error)})

    for(var i = 0;i < capsule_files.files_to_copy.length; i++){
	(function(file){
	     http_responder.on_recv({ 'url' : config.values.deploy_url + '/' + file.path}, 
				    function (context, response){
					response.end(file.data);
				    },
				    function(error){console.log('failed export object', error)});
	 })(capsule_files.files_to_copy[i]);
    }	    			
}

exports.assemble = function(dir, config){
    var assembler = assembler_constructor(dir);
    var generated = dutils.assemble(dir, assembler);
    generated.constructor = generated.script_inline 
	+ "var head = document.getElementsByTagName('head')[0]; "
	+ "function constructor(module_loader){\n return " 
	+ generated.constructor + '}\n';
    if(config.values.hasOwnProperty('entry'))
	generated.constructor += 'function starter(env){ env.' + config.values.entry + '(env);}';
    else
	console.log('entry point must will be setted in config.js');

    fs.writeFileSync(dir + '/assembled/constructor.js', generated.constructor);
    var files_to_copy = assembler.files_to_copy;
    var cb_sync = cb_synchronizer.create();
    cb_sync.after_all = function(){
	fs.writeFileSync(dir + '/assembled/files_to_copy.json', JSON.stringify(files_to_copy));	
    }
    for(file in files_to_copy){
	(function(file){
	     fs.readFile(files_to_copy[file].path, cb_sync.add(function(err, content){
			     if(!err){
				 files_to_copy[file].data = content.toString();
			     }else
				 console.log('something is going wrong in file reading')
			 }));	    
	 })(file)
    }
    config.values.state = 'assembled';
    config.write();
}

exports.deploy = function(dir, config){
    if(config.values.state != 'assembled'){
	console.log('please to assemble before deploing!');
	return;
    }

    var file_reading_sync = cb_synchronizer.create();
    var capsule_files = {"files_to_copy" : []};

    fs.readFile('platforms/browser/capsule.htm', 
		file_reading_sync.add(function(err, data){
					  capsule_files.capsule = data.toString();
				      }));
    
    fs.readFile(dir + '/assembled/constructor.js', 
		file_reading_sync.add(function(err, data){
					  // не проверяется ошибка, как и выше нигде не проверяются:D
					  capsule_files.constructor = data.toString();
		}));
    
    fs.readFile(dir + '/assembled/files_to_copy.json', 
		file_reading_sync.add(function(err, data){
					  if(!err)
					      capsule_files.files_to_copy = JSON.parse(data.toString());
				      }));
    file_reading_sync.after_all = function(){
	switch(config.values.deploy_type){
	case 'standalone' :
	    deploy_on_files(dir, config, capsule_files);
	    break;
	case 'http' : 
	    deploy_on_http(dir, config, capsule_files);
	    break;
	default :
	    console.log('ERROR: unknown deploy_type in config');
	    break;
	}
    }
    //запуска в браузере или запуске в браузере с любого http сервера, способного раздавать файлы
}

exports.run = function(){
    //запускаем, в качестве параметра запуска используем id, выданный при развёртывании
    //запуск фактически означает открытие в браузере адреса, по которому расположен набор
    //что-то иначе надо делать, если набор сделан для раздачи произвольным http сервером
}    

