var transport = require('../transport.js'),
uuid = require('../uuid.js');
var callbacks = new Array();

exports.create = function(context, features, capsule){
    if(!callbacks.hasOwnProperty(context.url))
	callbacks[context.url] = new Array();
    if(features & transport.features.server){
        return {
	    "on_connect" : function(callback){
		if(callback != null)
		    callbacks[context.url][0] = function(uuid_str){
			callback({
				     "on_msg" : function (callback){
					 callbacks[context.url]['s' + uuid_str] = callback;
				     },
				     "send" : function(msg){
					 if(typeof(callbacks[context.url]["c" + uuid_str]) == 'function')
					     callbacks[context.url]["c" + uuid_str](msg);
					 else console.log("server: Callback on msg from", uuid_str, "client is not setted");
				     },
				     "on_destroy" : function(callback){
					 callbacks[context.url]['ds'][uuid_str] = callback;
				     },
				     "destroy" : function(){
					 callbacks[context.url]['s' + uuid_str] = null;

					 if(callbacks[context.url]['ds'][uuid_str])
					     callbacks[context.url]['ds'][uuid_str]();
				     }
				 });
		    };
	    },
	    "destroy" : function(){
		var destroy_cbs = callbacks[context.url]['d'];
		for(ind in destroy_cbs){
		    if(destroy_cbs[ind])
			destroy_cbs[ind]();		    
		}
		callbacks[context.url] = [];
	    }
	};   
    }else if (features & transport.features.client){
	var uuid_str = uuid.generate_str();
	return {
	    "connect" : function(){
		if(typeof(callbacks[context.url][0]) == 'function')
		    callbacks[context.url][0](uuid_str);
		else console.log("client: Callback on connect is not setted");
	    },
	    "on_msg" : function (callback){
		callbacks[context.url]["c" + uuid_str] = callback;
	    },
	    "send" : function(msg){
		if(typeof(callbacks[context.url]['s' + uuid_str]) == 'function')
		    callbacks[context.url]['s' + uuid_str](msg);
		else console.log("client: Callback on msg is not setted");
	    },
	    
	    "on_destroy" : function(callback){
		callbacks[context.url]['dc' + uuid_str] = callback;
	    },
	    "destroy" : function(){
		callbacks[context.url]['c' + uuid_str] = null;
		
		if(callbacks[context.url]['dc' + uuid_str])
		    callbacks[context.url]['dc' + uuid_str]();
	    }
	};
    }
    return null;
};