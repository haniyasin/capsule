function module_loader(){
    var sources = (function(){
	var _sources = [];

	this.add = function(path, source){    
	    _sources.push([path, source]);
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

    this.load = function (path, base_path){
	var module = {};
	var source = sources.get(path);
	if(source){
	    var _module = new Function("exports", "require", source);
	    if(base_path == undefined){
		var bp_reg = new RegExp("(.+)/.+");
		var bpr_ret = bp_reg.exec(path);
		base_path = bpr_ret ? bpr_ret[1] : null;	    		
	    } else {
		var reg = new RegExp("([\\.\\w]+)/(.+)");
		var reg_ret;
		while(reg_ret = reg.exec(path)){
		    path = reg_ret[2];
		    if(reg_ret[1] == '..'){
                    	var reg_back = new RegExp("(.*)[/.]+");
			base_path = reg_back.exec(base_path)[1];
		    }
		    else if(reg_ret[1] == '.'){
			//ничего не делаем
		    } else{
			base_path += '/' + reg_ret[1];
		    }
		}
	    }
	    _module(module, (function(loader){
				 return function(path){
				     loader.load(path, base_path);
				 }
			     })(this));
	}
	return module;	
    }
}
