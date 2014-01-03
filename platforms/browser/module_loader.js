function module_loader(){
    var modules = (function(){
	var _modules = [];
 
	this.add = function(path, module){
	    _modules[_modules.length] = [path, module];
	}
		       
	this.add_array = function(array){
	    _modules = _modules.concat(array);
	}
			   
        this.get = function(path){
            var module_founded = false;
            for(i = 0; i < _modules.length; i++){
		if(_modules[i][0] == path){
                    module_founded = true;
                    break;
		}
            }
            if(module_founded)
		return _modules[i][1];
	    
	    return null;
	}
	
	this.remove = function(path){
	    
	}
        return this;
    })();

    this.add = function(path, module) {
	modules.add(path, module);
    }

    this.add_array = function(array){
        modules.add_array(array);	
    }

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
	    
	    while(part = path_parts_pattern.exec(path)){
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

	var module = modules.get(base_path  + path);

	var _exports = {};

	var _module = typeof(module) == 'function' ? module : new Function("module", "exports", "require", module);
	var module_definition = {
	    'name' : '',
	    'exports' : _exports
	}
	_module(module_definition, _exports, (function(loader){
			     return function(path){
				 return loader.load(path, base_path);
			     }
			 })(this));
	
	return module_definition.exports;	
    }
}
