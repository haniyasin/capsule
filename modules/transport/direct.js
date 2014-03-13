var transport = require('../transport.js');
var callbacks = new Array();

exports.create = function(context, features, capsule){
    if(!callbacks.hasOwnProperty(context.url))
	callbacks[context.url] = new Array();
    if(features & transport.features.server){
        return {
	    on_connect : function(callback){
		if(callback != null)
		    callbacks[context.url][0] = function(uuid){
			callback({
				     on_msg : function (callback){
					 callbacks[context.url]["s" + uuid] = callback;
				     },
				     send : function(msg){
					 if(typeof(callbacks[context.url]["c" + uuid]) == 'function')
					     callbacks[context.url]["c" + uuid](msg);
					 else console.log("server: Callback on msg from", uuid, "client is not setted");
				     }
				 });
		    }
	    },
	    destroy : function(){
		callbacks[context.url].splice(0,1);
	    }
	}		    
    }else if (features & transport.features.client){
	var uuid = capsule.modules.uuid.generate_str();
	return {
	    connect : function(){
		if(typeof(callbacks[context.url][0]) == 'function')
		    callbacks[context.url][0](uuid);
		else console.log("client: Callback on connect is not setted");
	    },
	    on_msg : function (callback){
		callbacks[context.url]["c" + uuid] = callback;
	    },
	    send : function(msg){
		if(typeof(callbacks[context.url]['s' + uuid]) == 'function')
		    callbacks[context.url]['s' + uuid](msg);
		else console.log("client: Callback on msg is not setted");
	    },
	    destroy : function(){
		delete callbacks[context.url]["c" + uuid];
	    }	
	}
    }
}