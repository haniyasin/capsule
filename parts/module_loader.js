/*
 * cross javascript environment module loader
 * features:
 * + storing modules in one tree
 * + modules stores as strings or functions
 *   useful for browser or other environments without files.
 *   Also for ditribution all modules in one file.
 * + modules as objects. Userful for builtin modules and modules which
 *   is really no module
 * + loading unknown modules throuht callback(for loading modules from disk or every place)
 * + variables module, module.exports and exports is supported
 */
function module_loader(){
    var modules = (function(){
		       var _modules = [];
		       
		       function _find(path){
			   for(var i = 0; i < _modules.length; i++){
			       if(_modules[i][0] == path)
				   return i;
			   }
			   return null;			   
		       };

		       this.add = function(path, module){
			   _modules.push([path, module]);
		       };
		       
		       this.add_array = function(array){
			   _modules = _modules.concat(array);
		       };
		       
		       this.get = function(path){
			   var pos = _find(path);
			   if(pos == null)
			       return null;

			   return _modules[pos][1];
		       };
		       
		       this.replace = function(path, module){
			   var pos = _find(path);
			   if(pos == null)
			       return false;

			   _modules[pos][1] = module;

			   return true;
		       };

		       this.remove = function(path){
			   var pos = _find(path);
			   if(pos == null)
			       return false;
			   _modules.splice(pos,1);

			   return true;
		       };
		       return this;
		   })();
    
    this.add = function(path, module) {
	modules.add(path, module);
    };

    this.add_array = function(array){
        modules.add_array(array);	
    };

    this.unknown_module_getter = function(path){
	return null;
    };

    this.load = function (path, base_path){
	//calculating base_path, path of directory, which is consisting this module
	if(base_path == undefined){
	    //base_path undefined if this module load from module_loader.load
	    //setting base_path to module's directory
	    var bp_reg = new RegExp("(.+)/(.+)");
	    var bpr_ret = bp_reg.exec(path);
	    if(bpr_ret){
		base_path = bpr_ret[1] + '/';
		path = bpr_ret[2];
	    } else
		base_path = '';
	} else {
	    //if module required from other module then base_path point to directory that module
	    //extract from module path all relative elements(.. .) and join her base_path to common base_path
	    var path_parts_pattern = /([\w\.]+)\//g;
	    var part;
	    var lastIndex = 0;
	    
	    while((part = path_parts_pattern.exec(path))){
		lastIndex = path_parts_pattern.lastIndex;

		switch(part[1]){
		case '..' : 
		    var back = /(.*)\/(\w+)\//;
			try {
			    base_path = back.exec(base_path)[1] + '/';
			}
		    catch (e) {
			base_path = '';
		    }	
		    break;
		    
		case '.' : 
		    //now is empty
		    break;
		    
		default : 
		    base_path += part[1] + '/';
		    
		    break;
		}
	    }
	    
	    path = path.substr(lastIndex,path.length - lastIndex + 1);

	}

	var module = modules.get(base_path + path),
	    _module;
		
	if(module == null){	
	    module = this.unknown_module_getter(base_path + path);
	    if(module == null)
		throw {code : "MODULE_NOT_FOUND", module_path : base_path + path};		
	    this.add(base_path + path, ""); //adding empty string, replacing by object later
	}
	
	switch(typeof module){
	    case 'function' : //inline true
	    _module = module;
	    break;
	    
	    case 'string' : //inline false
	    _module = new Function("module", "exports", "require", module);
	    break;

	    case 'object' : //already loaded module
//		alert(base_path + path);
	    return module.exports;
	}
	console.log(typeof this.unknown_module_getter, typeof module);

	var module_definition = {
	    'name' : '',
	    'exports' : {}
	};

	_module(module_definition, module_definition.exports, (function(loader){
			     return function(path){
				 return loader.load(path, base_path);
			     };
			 })(this));
	
	//replace module source or function with resultated object
	modules.replace(base_path + path, module_definition);
	
	return module_definition.exports;	
    };
}
