function module_loader(){
    var sources = (function(){
	var _sources = [];
 
	this.add = function(path, source){    
	    _sources.push([path, source]);
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
	var module = {};

	if(base_path == undefined){
	    var bp_reg = new RegExp("(.+)/(.+)");
	    var bpr_ret = bp_reg.exec(path);
	    if(bpr_ret){
		base_path = bpr_ret[1] + '/';
		path = bpr_ret[2];
	    } else
		base_path = '';
	} else {
	    var reg = new RegExp("([\\.]+)/(.+)");
	    var reg_ret;

	    while(reg_ret = reg.exec(path)){
		path = reg_ret[2];
		if(reg_ret[1] == '..'){
                    var reg_back = new RegExp("(.*/)[.]+");
		    try {
			base_path = reg_back.exec(base_path)[1];
		    }
		    catch (e) {
			base_path = '';
		    }
		}
		else if(reg_ret[1] == '.'){
		    //ничего не делаем
		} else{
		    base_path += '/' + reg_ret[1] + '/';
		}
	    }
	}
	var source = sources.get(base_path  + path);
	var _module = new Function("exports", "require", source);
	_module(module, (function(loader){
			     return function(path){
				 return loader.load(path, base_path);
			     }
			 })(this));
	
	return module;	
    }
}
