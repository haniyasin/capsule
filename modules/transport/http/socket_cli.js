var bb_allocator = require('../../../parts/bb_allocator.js');
var utils = require('../../../parts/utils.js');
var cb_synchronizer = require('../../../parts/cb_synchronizer.js');

var id_allocator = new bb_allocator.create(bb_allocator.id_allocator);

function requests_holder(type, modules){
    var requests = []; 
    var self = this;

    this.requests_allocated = 0;
    this.success_metr = 0; //counter of success or failed
    this.on_disconnect = function(){};
    this.create_request = function(){
	//this is hack for limit of several concurent XMLHttpRequest
	if((type == 'xhr')&&(this.requests_allocated > 5))
	    return null;	    
	  
	var request = modules.http_requester.create(type);

	request.on_close(function(){
			     self.requests_allocated--;
			     if(request.hasOwnProperty('on_destroy'))
				 request.on_destroy();
			  });

	request.on_error(function(e){
			     if(--self.success_metr == 1){
				 self._lpoller.deactivate();
				 self.on_disconnect(e);
			     }
			 });

	this.requests_allocated++;
	this.success_metr++;

	return request;
    }

    this.destroy = function(request){
	request.close();
	this.requests_allocated--;
    }

    this.close_all_requests = function(){
	for(ind in _requests){
	    _requests[ind].close();
	}
    }
}

function incoming_processor(context){
    var _on_recv = function(){};

    this.on_recv = function(callback){
	_on_recv = callback;
    }

    this.get_process_msg = function(request, _holder){
	return function(data){	    
	    //ignoring reply without data and undefined reply
	    if(data != undefined && data != 'undefined' && data.length > 0){
		var pdata = JSON.parse(data);
		if(pdata.hasOwnProperty('cli_id'))//this is answer on connect msg with allocated cli_id by server
		    context.cli_id = pdata.cli_id;
//		console.log(pdata);
		if(pdata.hasOwnProperty('msg'))
		    _on_recv(pdata.msg);
		else
		    _on_recv(null); //on_connect
	    }
	    _holder.destroy(request); //в будущем надо учесть переиспользование объекта, возможно:)
	}
    }
}

function packet_sender(context, _holder, _incoming, _lpoller, modules){
    this.send = function(msg){	
	var request = _holder.create_request();
	var msg_json = JSON.stringify({'cli_id' : context.cli_id, 'msg' : msg});
	if(request){
	    request.on_recv(_incoming.get_process_msg(request, _holder));

	    request.open(context);
	    request.send(msg_json);	    	    
	}
	else{
	    _lpoller.delayed_packets.push(msg_json);	    	    
	}
    }
}

function lpoller(context, _holder, _incoming, modules){
    var poll_timer = null;
    this.delayed_packets = [];
    var _packets = this.delayed_packets;
    var self = this;
    var request = null;

    this.try_poll = function(){	
	if(!poll_timer){
	    poll_timer = modules.timer.js.create(
		function(){
		    if(request)
			return; //the new request is not needed, because current still alive
		    var request = _holder.create_request();
		    if(request){
			request.on_destroy = function(){
			    //console.log('eeee');
			    request = null;
			};

			request.on_recv(_incoming.get_process_msg(request, _holder));

			request.open(context);
			//в будущем неплохо бы реализовать упаковку данных в url, что даст возможность
			//не отправлять send и дольше удерживать request,  также предусмотреть multipart
			if(_packets.length)
			    request.send(_packets.shift());
			else
			    request.send(JSON.stringify({'cli_id' : context.cli_id}));
		    }else{
			console.log('lpoller.try_poll: cannot create request');
			//console.log("packets is: " + _packets);
		    }
		}, 200, true);	
	}
    }

    this.deactivate = function(){
	if(typeof(_timer) == 'object'){
	    poll_timer.destroy();
            poll_timer = null;	    
	}
    }
}

exports.create = function(context, type, modules){
    var _incoming = new incoming_processor(context);
    //реализовать выбор транспорта, xhr или script для browser
    var _holder = new requests_holder(type, modules);
    var _lpoller = new lpoller(context, _holder, _incoming, modules);
    _holder.lpoller = _lpoller;
    var _sender = new packet_sender(context, _holder, _incoming, _lpoller, modules);

    context.cli_id = 0; //need connect for id allocating
    var _on_recv = function(){};

    return {
	'connect' : function(callback){
	    _incoming.on_recv(function(msg){
				  _incoming.on_recv(_on_recv);
				  _lpoller.try_poll();
				  callback();
			      });
	    _sender.send({}); //sending blank msg with cli_id==0 as connect msg
	},
	'send' : function(msg){
	    _sender.send(msg);
	},
	'on_recv' : function(callback){
	    _incoming.on_recv(_on_recv = callback);
	},
	'on_disconnect' : function(callback){
	     _holder.on_disconnect = callback;
	},
	'disconnect' : function(){
	    _holder.close_all_requests();
	    _lpoller.deactivate();
	}
    }
}
