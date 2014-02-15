var transport = require('../transport.js');
var callbacks = new Array();

exports.create = function(context, features, modules){
    callbacks[context.port] = new Array();
    if(features & transport.features.server){
        return {
	    on_connect : function(callback){
		if(callback != null)
		    callbacks[context.port][0] = function(type, uuid, msg){
			switch(type){
			    case 'connect' :
			    return {
				on_msg : function (callback){
				    callbacks[context.port]["s" + uuid] = callback;
				},
				send : function(msg){
				    if(callbacks[context.port]["c" + uuid] === Function)
					callbacks[context.port]["c" + uuid](msg);
				    else console.log("server: Callback on", msg_id, "is not setted");
				}
			    }
			    
			    case 'msg' :
			    if(callbacks[context.port]["s" + uuid] === Function)
				callbacks[context.port]["s" + uuid](msg);
			    break;
			}
		    }
	    },
	    destroy : function(){
		callbacks[context.port].splice(0,1);
	    }
	}		    
    }else if (features & transport.features.client){
	//генерируем тут uuid
	//var uuid = modules.uuid.create()
	return {
	    connect : function(){
		callbacks[context.port][0]('connect', uuid);
	    },
	    on_msg : function (callback){
		callbacks[context.port]["c" + uuid] = callback;
	    },
	    send : function(msg){
		if(callbacks[address] === Function)
		    callbacks[address][0]('msg',uuid, msg);
		else console.log("client: Callback is not setted")
	    },
	    destroy : function(){
		delete callbacks[context.port]["c" + uuid];
	    }	
	}
    }
}