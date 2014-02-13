var fs = require('fs');


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