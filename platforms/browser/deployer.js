var fs = require('fs');
var dutils = require('../../parts/deployer_utils.js');
var cb_synchronizer = require('../../parts/cb_synchronizer.js');

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
    assembler.block_load = '';
    assembler.files_to_copy = [];

    assembler.generate = function(){
	var generated = {
	    constructor : ''
	}
	
	for(child_ind in this.childs){
	    var child = this.childs[child_ind];
	    var child_generated = child[1].generate();
	    
            this.block += 'current.' + child[0] + ' = ' + child_generated.constructor;
	    this.files_to_copy = this.files_to_copy.concat(child[1].files_to_copy);
	}
	
	generated.constructor += "(function(current){" + this.block;
	
	if(this.s.flags.preload == false){
	    generated.constructor += 'current.load=' + '(function(current){ return function(){' + this.block_load  + '}})(current);';			         
	}else
	    generated.constructor += this.block_load;
	generated.constructor += 'return current;})({});\n'; //тут надо вписать имя родителя	
	
	return generated;
    }

    assembler.do_file = function(name, file_path){
	if(this.s.type == dutils.types.script){
	    var tag = '_' + name;
	    this.block += tag + " = document.createElement('script');" + tag + ".setAttribute('type', 'text/javascript');" + tag + ".setAttribute('src', '" + name +  "');" +  "head.appendChild(" + tag + ");";

	    this.files_to_copy.push({ "path" : file_path,
				      "new_path" : this.dir + '/assembled/' + file_path});	
	} else {
	    var content = fs.readFileSync(file_path,"utf8");
	    if(this.s.type == dutils.types.module){
		var module_load = new module_load_emitter(file_path, content, name, this.s.flags.inline);
		this.block +=  module_load.emit_declare();
		var _block_load = module_load.emit_load();
		
		if(!this.s.flags.preload)
		    this.block_load += _block_load; //НЕРОБЕД
		else 
		    this.block += _block_load;
	    }
	}
    }

    return assembler;
}

function deploy_on_files(dir, config, capsule_files){
    //need mkdirp
    fs.writeFile(dir + '/deployed/capsule.htm', capsule_files.capsule);
    fs.writeFile(dir + '/deployed/constructor.js', capsule_files.constructor);

    for(file in capsule_files.files_to_copy){
	var _file = capsule_files.files_to_copy[file];
	fs.writeFile(_file.new_path,_file.data);
    }    
}

function deploy_on_http(dir, config, capsule_files){
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
	     console.log(file.path)
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
    generated.constructor = "var head = document.getElementsByTagName('head')[0];" + generated.constructor;  
    fs.writeFile(dir + '/assembled/constructor.js', generated.constructor);
    var files_to_copy = assembler.files_to_copy;
    var cb_sync = cb_synchronizer.create();
    cb_sync.after_all = function(){
	fs.writeFile(dir + '/assembled/files_to_copy.json', JSON.stringify(files_to_copy));	
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
    var capsule_files = {};
    fs.readFile('platforms/browser/capsule.htm', 
		file_reading_sync.add(function(err, data){
					  capsule_files.capsule = data.toString();
				      }));
    
    fs.readFile(dir + '/assembled/constructor.js', 
		file_reading_sync.add(function(err, data){
					  capsule_files.constructor = data.toString();
		}));
    
    fs.readFile(dir + '/assembled/files_to_copy.json', 
		file_reading_sync.add(function(err, data){
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

