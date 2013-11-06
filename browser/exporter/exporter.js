var fs = require('fs');

function objects_tree_assembler(definition, cur_path, type){
    var assembler = '',
        modules = [];
    if(cur_path == undefined){
	cur_path = 'this';
    }
    for(var key in definition){
	if(typeof(definition[key]) == 'string'){
	    //подумать как сделать относительные пути
	    modules.push([definition[key],fs.readFileSync(definition[key])]);

	    if(type == 'module'){		
		if(definition[key] == 'this')
		    assembler += cur_path + ' = ' + "module_loader(\'" + definition[key] + "\');\n";
		else 
		    assembler += cur_path + '.' + key + ' = ' + "module_loader(\'" + definition[key] + "\');\n";
	    }else if(type == 'script'){
		assembler += 'var ' + key + " = document.createElement('script');\n var " + key + ".setAttribute('type', 'text/javascript');\n var " + key + ".setAttribute('src', '" + definition[key] +  "');\n"
	    }
	}
	else if(typeof(definition[key]) == 'object'){
	    assembler += cur_path + '.' + key + "= {};\n";
	    var ret_array = objects_tree_assembler(definition[key], cur_path + '.' + key, type);
	    assembler += ret_array[0];
	    modules = modules.concat(ret_array[1]);
	}
    }
    if (cur_path == 'this')
	assembler += 'return this;\n';
    return [assembler, modules];
}

function resource_assembler(name, definition, type){
    var name = name,
    def = definition,
    type = type,
    construct_func,
    objects;
    this.assemble = function(){
	var ret_arr = objects_tree_assembler(def, undefined, type);
	construct_func = ret_arr[0];
	objects = ret_arr[1];

	construct_func =  'var ' + name + " = Function(\"" + construct_func + "\");";
//	console.log(construct_func);
    }

    this.to_http = function(http_respondent, url){
	console.log(url + name + '_construct_func.js');
/*	http_respondent.on_recv({ 'url' : url + name + '_construct_func.js'}, 
				 function (context, response){
				     response.end(construct_func);
				 },
				 function(error){console.log('failed', error)})*/
	for(i = 0;i < objects.length; i++){
	    console.log(url + objects[i][0]);
	}
    	
    }
    
    this.to_files = function(){
	
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