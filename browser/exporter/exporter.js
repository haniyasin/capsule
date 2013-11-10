var fs = require('fs');

function objects_tree_assembler(definition, cur_path, type, name){
    var assembler = '',
        modules = [];
    if(cur_path == undefined){
	cur_path = 'this';
    }

    if(type == 'script')
	assembler += "var head = document.getElementsByTagName('head')[0]; ";
    for(var key in definition){
	if(typeof(definition[key]) == 'string'){
	    //подумать как сделать относительные пути
	    var content = fs.readFileSync(definition[key],"utf8");
//	    console.log(content);
	    modules.push([definition[key], content]);

	    if(type == 'module'){		
		if(key == 'this'){
		    assembler += cur_path + ' = new Object('+ "module_loader.load(\'" + definition[key] + "\'));";
		}
		else 
		    assembler += cur_path + '.' + key + ' = ' + "module_loader.load(\'" + definition[key] + "\');";
	    }else if(type == 'script'){
		assembler += 'var ' + key + "=document.createElement('script');" + key + ".setAttribute('type', 'text/javascript'); " + key + ".setAttribute('src', '" + definition[key] +  "'); head.appendChild(" + key + ");";
	    }
	}
	else if(typeof(definition[key]) == 'object'){
	    assembler += cur_path + '.' + key + "= {};";
	    var ret_array = objects_tree_assembler(definition[key], cur_path + '.' + key, type, name);
	    assembler += ret_array[0];
	    modules = modules.concat(ret_array[1]);
	}
    }
    if (cur_path == 'this'){
	if(type == 'module'){
	    assembler = "module_loader.sources_add(" + name + "modules);" + assembler;
	    assembler += 'return this;';		    
	}
    }
    return [assembler, modules];
}

function resource_assembler(name, definition, type){
    var name = name,
    def = definition,
    type = type,
    construct_func,
    objects;
    this.assemble = function(){
	var ret_arr = objects_tree_assembler(def, undefined, type, name);
	construct_func = ret_arr[0];
	objects = ret_arr[1];

	var modules_str = '';
	if(type == 'module')
	    modules_str = 'var '+ name + 'modules = ' + JSON.stringify(objects) + ';';
	
	construct_func =  modules_str + 'var ' + name + " = Function(\"module_loader\",\"" + construct_func + "\");";
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
	http_respondent.on_recv({ 'url' : url + name + '_constructor.js'}, 
				 function (context, response){
				     response.end(construct_func);
				 },
				 function(error){console.log('failed export _construct_func', error)})
	if(type == 'script'){
	    for(var i = 0;i < objects.length; i++){
		(function(object){
		     http_respondent.on_recv({ 'url' : url + object[0]}, 
					     function (context, response){
						 response.end(object[1]);
					     },
					     function(error){console.log('failed export object', error)});
		 })(objects[i]);
    	    }	    
	}
    }
    
    this.to_files = function(){
	//здешний код, ошибся туда его написав;
	
    }
}


exports.to_files = function(path_to){
    
}

exports.to_http = function(http_respondent,url){
    var scripts_assembler;
    var capsule_assembler;
    var tests_assembler;
    fs.readFile('browser/exporter/config.json', function(err, data){
		    if(err)
			console.log(err);
		    else{
			var config = JSON.parse(data);			
			if(config.scripts){
			    scripts_assembler = new resource_assembler('scripts', config.scripts, 'script');
			    scripts_assembler.assemble();
			    scripts_assembler.to_http(http_respondent, url);
			}

			if(config.dependencies){
			    capsule_assembler = new resource_assembler('dependencies', config.dependencies, 'module');
			    capsule_assembler.assemble();
			    capsule_assembler.to_http(http_respondent, url);
			}

			if(config.capsule){
			    capsule_assembler = new resource_assembler('capsule', config.capsule, 'module');
			    capsule_assembler.assemble();
			    capsule_assembler.to_http(http_respondent, url);
			}

			if(config.tests){
			    tests_assembler = new resource_assembler('tests', config.tests, 'module');
			    tests_assembler.assemble();
			    tests_assembler.to_http(http_respondent, url);
			}
		    }
		});
}