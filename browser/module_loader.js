function module_loader(){
    var sources = [];

    this.source_add = function (path, source){
	sources.push([path, source]);
    }

    this.load = function (path){
	var module = {};
	var source_founded = false;
	for(i = 0; i < sources.length; i++){
	    if(sources[i][0] == path){
		source_founded = true;
		break;
	    }
	}
	if(source_founded){
	    var _module = new Function("exports", "require", sources[i][1]);
	    _module(module, this.load);
	}
	return module;	
    }
}
