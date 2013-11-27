function module_loader(){
    var sources = (function(){
	var _sources = [];
 
	this.add = function(path, source){
	    _sources[_sources.length] = [path, source];
	}
		       
	this.add_array = function(array){
	    _sources = _sources.concat(array);
	}
			   
        this.get = function(path){
            var source_founded = false;
            for(i = 0; i < _sources.length; i++){
		if(_sources[i][0] == path){
                    source_founded = true;
                    break;
		}
            }
            if(source_founded)
		return _sources[i][1];
	    else
		return null;
	}
	
	this.remove = function(path){
	    
	}
        return this;
    })();

    this.source_add = function(path, source) {
	sources.add(path, source);
    }

    this.sources_add = function(array){
        sources.add_array(array);	
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
	    
	    console.log("lastIndex is ", lastIndex);
	    path = path.substr(lastIndex,path.length - lastIndex + 1);

	}

	var source = sources.get(base_path  + path);
	console.log("\n\npath is", path, "base_path is", base_path);
	console.log("source is", source.substr(0,10));
	var module = {};
	var _module = new Function("exports", "require", source);
	_module(module, (function(loader){
			     return function(path){
				 return loader.load(path, base_path);
			     }
			 })(this));
	
	return module;	
    }
}
