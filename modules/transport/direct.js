var transport = require('modules/transport.js');
var callbacks = new Array();

exports.create = function(address, features){
    callbacks[address] = new Array();
    if(features & transport.features.router){
        return {
	    address : address,
	    on_msg : function (msg_id, callback){
		callbacks[address]["r" + msg_id] = callback;
	    },
	    send : function(msg_id, msg_body, callback){
		if(callback != null)
		    callbacks[address]["r" + msg_id] = callback;
		if(callbacks[address]["d" + msg_id])
		    callbacks[address]["d" + msg_id](msg_id,msg_body);
		else console.log("router: Callback on", msg_id, "is not setted")
	    },
	    destroy : function(){}
	}		    
    }else if (features & transport.features.dealer){
	return {
	    address : address,
	    on_msg : function (msg_id, callback){
		callbacks[address]["d" + msg_id] = callback;
	    },
	    send : function(msg_id, msg_body, callback){
		if(callback != null)
		    callbacks[address]["d" + msg_id] = callback;		   
		if(callbacks[address]["r" + msg_id])
		    callbacks[address]["r" + msg_id](msg_id,msg_body);
		else if (callbacks[address]['r' + 0])
		    callbacks[address]["r" + 0](msg_id,msg_body);
		else console.log("dealer: Callback on", msg_id, "is not setted")
	    },
	    destroy : function(){}	
	}
    }
}