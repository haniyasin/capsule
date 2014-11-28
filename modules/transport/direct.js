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
		    callbacks[context.url][0] = function(uuid){
			callback({
				     "on_msg" : function (callback){
					 callbacks[context.url]['s' + uuid] = callback;
				     },
				     "send" : function(msg){
					 if(typeof(callbacks[context.url]["c" + uuid]) == 'function')
					     callbacks[context.url]["c" + uuid](msg);
					 else console.log("server: Callback on msg from", uuid, "client is not setted");
				     },
				     "on_destroy" : function(callback){
					 callbacks[context.url]['ds'][uuid] = callback;
				     },
				     "destroy" : function(){
					 callbacks[context.url]['s' + uuid] = null;

					 if(callbacks[context.url]['ds'][uuid])
					     callbacks[context.url]['ds'][uuid]();
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
	var uuid = uuid.generate_str();
	return {
	    "connect" : function(){
		if(typeof(callbacks[context.url][0]) == 'function')
		    callbacks[context.url][0](uuid);
		else console.log("client: Callback on connect is not setted");
	    },
	    "on_msg" : function (callback){
		callbacks[context.url]["c" + uuid] = callback;
	    },
	    "send" : function(msg){
		if(typeof(callbacks[context.url]['s' + uuid]) == 'function')
		    callbacks[context.url]['s' + uuid](msg);
		else console.log("client: Callback on msg is not setted");
	    },
	    
	    "on_destroy" : function(callback){
		callbacks[context.url]['dc' + uuid] = callback;
	    },
	    "destroy" : function(){
		callbacks[context.url]['c' + uuid] = null;
		
		if(callbacks[context.url]['dc' + uuid])
		    callbacks[context.url]['dc' + uuid]();
	    }
	};
    }
    return null;
};