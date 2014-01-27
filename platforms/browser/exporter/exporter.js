var fs = require('fs');
var cb_synchronizer = require('../../../parts/cb_synchronizer.js');



function objects_tree_assembler(definition, current, type, download, preload, head, inline){
    var assembler = '',
        asm_load = '',
        modules = [];

    for(var key in definition){
	if(typeof(definition[key]) == 'boolean'){
	    switch(key){		
	    case 'download' :
		download = definition[key];
		break;
	    case 'preload' :
		preload = definition[key];		    
		break;
	    case 'inline' :
		inline = definition[key];
	    }
	}

	if(typeof(definition[key]) == 'string'){
	    if(key == 'type'){
		if(definition[key]  == 'script'){
		    type = types.script;
		    if(!head){
			head = true;
			assembler += "var head = document.getElementsByTagName('head')[0];";		
		    }
		} else {
		    if(definition[key] == 'module')
			type = types.module;			
		}
	    }
	    else {
		var content = fs.readFileSync(definition[key],"utf8");
		if(type == types.script){
		    var tag = '_' + key;
		    assembler += tag + " = document.createElement('script');" + tag + ".setAttribute('type', 'text/javascript');" + tag + ".setAttribute('src', '" + definition[key] +  "');" +  "head.appendChild(" + tag + ");";
		    modules.push([definition[key], content]);
		} else {
		    if(type == types.module){
			var module_load = new module_load_emitter(definition[key], content, current, key, inline);
			
			assembler +=  module_load.emit_declare()
;
			var load_code = module_load.emit_load();
		
			if(!preload)
			    asm_load += load_code;
			else 
			    assembler += load_code;
		    }
		}
	    }

	    //подумать как сделать относительные пути, диагностика папок
	}
	else if(typeof(definition[key]) == 'object'){
	    assembler +=  'current.' + key + "= ";
	    var ret_object = objects_tree_assembler(definition[key], key, type, download, preload, head, inline);
	    assembler += '(function(current){';
	    assembler += ret_object.assembler;
	    if(!ret_object.preload){
		assembler += 'current.load=' + '(function(current){ return function(){' + ret_object.asm_load + '}})(current);';			         
	    }
	    assembler += 'return current;})({});';
	    
	    modules = modules.concat(ret_object.modules);
	}
    }

    return {assembler : assembler, asm_load : asm_load, modules : modules, download : download, preload : preload, type : type};
}
//AHTUNG NEED pastrough name of definition
function resource_assembler(definition){
    var def = definition,
    construct_func,
    objects;
    this.assemble = function(){
	var ret_arr = objects_tree_assembler(def, undefined, types.envelop,false, false, false);
	construct_func =  "function capsule(module_loader){var current = {}; " + ret_arr.assembler + "return current;}";
//	console.log(construct_func);
	objects = ret_arr.modules;
    }

    this.to_http = function(http_respondent, url){
	http_respondent.on_recv({ 'url' : url + "capsule.htm"}, 
				     function (context, response){
					 fs.readFile('platforms/browser/capsule.htm', function(err, data)
						     {
							 response.end(data);
						     });
				     },
				     function(error){console.log('failed', error)})    
	http_respondent.on_recv({ 'url' : url + 'capsule_constructor.js'}, 
				 function (context, response){
				     response.end(construct_func);
				 },
				 function(error){console.log('failed export _construct_func', error)})
	for(var i = 0;i < objects.length; i++){
	    (function(object){
		 console.log(object[0])
		 http_respondent.on_recv({ 'url' : url + object[0]}, 
					 function (context, response){
					     response.end(object[1]);
					 },
					 function(error){console.log('failed export object', error)});
	     })(objects[i]);
    	}	    
	
    }
    
    this.to_files = function(){
	//здешний код, ошибся туда его написав;
	
    }
}


exports.to_files = function(path_to){
    
}


exports.create = function(config_path, http_respondent, on_create){
    var configs = [];
    var cb_sync = cb_synchronizer.create();
    function config_add(config_path){	 
	if(config_path)
	    fs.readFile(config_path, cb_sync.add(function(err, data){
			    if(err)
				console.log("error is", err);
			    else{
				var resource = new resource_assembler(JSON.parse(data));
				resource.assemble();
				configs.push(resource);
				//console.log("configs is", configs.length);
    			    }
			}));
    }

    cb_sync.after_all = function(){	
	on_create({
		      'config_add' : function(config_path){config_add(config_path)},
		      'to_http' : function(context){
			  for(ind in configs){
			      configs[ind].to_http(http_respondent, context);
			  }
		      },
		      'to_files' : function(path_dir_to){}
		  }) 	
    }
    config_add(config_path);
}