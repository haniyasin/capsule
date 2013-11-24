var fs = require('fs');
var cb_synchronizer = require('../../dependencies/cb_synchronizer.js');

var types = {"envelop" : 1,
	     "module" : 2,
	     "script" : 3
	    };
function objects_tree_assembler(definition, cur_path, type, download, preload, head){
    //consts
    var assembler = '',
        modules = [];

    var name = '';

    for(var key in definition){
	if(typeof(definition[key]) == 'boolean'){
	    if(key == 'download')
		download = definition[key];		    
	    else 
		if(key == 'preload')
		    preload = definition[key];		    
	}
	if(typeof(definition[key]) == 'string'){
	    if(key == 'type'){
		if(definition[key]  == 'script'){
		    type = types.script;
		    if(!head){
			head = true;
			assembler += "var head = document.getElementsByTagName('head')[0]; ";		
		    }
		} else {
		    if(definition[key] == 'module')
			type = types.module;			
		}
	    }
	    else 
		if(key == 'name'){
		    name = definition[key];		    
		    if(cur_path == undefined)
			cur_path = name;

		    assembler += 'var ' + name + "={};";
		}
	    else {
		var content = fs.readFileSync(definition[key],"utf8");
		if(type == types.script){ 
		    var _cur_path = cur_path + '.' + key;
		    assembler += _cur_path + " = document.createElement('script'); " + _cur_path + ".setAttribute('type', 'text/javascript'); " + _cur_path + ".setAttribute('src', '" + definition[key] +  "'); head.appendChild(" + _cur_path + ");";
		    modules.push([definition[key], content]);
		} else {
		    if(type == types.module){
			assembler += "module_loader.source_add(\"" + definition[key] + "\"," + JSON.stringify(content) + ");"; 
			if(key == 'this'){
			    assembler += cur_path + ' = new Object('+ "module_loader.load(\'" + definition[key] + "\'));";
			}
			else {			    
			    assembler += cur_path + '.' + key + ' = ' + "module_loader.load(\'" + definition[key] + "\');";
			}
		    }
		}
	    }

	    //подумать как сделать относительные пути, диагностика папок
	}
	else if(typeof(definition[key]) == 'object'){
	    var _cur_path = cur_path + '.' + key;
	    assembler += _cur_path + "= {};";
	    var ret_object = objects_tree_assembler(definition[key], _cur_path, type, download, preload, head);
	    if(!ret_object.preload){
		assembler += cur_path + '.' + key + '.load=' + 'function(){' +	ret_object.assembler + '};';	
	    } 
	    else
	    {
		assembler += ret_object.assembler;
	    }
	    
	    modules = modules.concat(ret_object.modules);
	}
    }

    return {assembler : assembler, modules : modules, download : download, preload : preload, type : type};
}

function resource_assembler(definition){
    var def = definition,
    construct_func,
    objects;
    this.assemble = function(){
	var ret_arr = objects_tree_assembler(def, undefined, types.envelop,false, false, false);
	construct_func =  "function " + definition.name + "(module_loader){" + ret_arr.assembler + "return " + definition.name + ";}";
//	console.log(construct_func);
	objects = ret_arr.modules;
    }

    this.to_http = function(http_respondent, url){
	http_respondent.on_recv({ 'url' : url + "capsule.htm"}, 
				     function (context, response){
					 fs.readFile('browser/capsule.htm', function(err, data)
						     {
							 response.end(data);
						     });
				     },
				     function(error){console.log('failed', error)})    
	http_respondent.on_recv({ 'url' : url + definition.name + '_constructor.js'}, 
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