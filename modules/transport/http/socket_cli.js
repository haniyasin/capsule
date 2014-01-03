var bb_allocator = require('../../../parts/bb_allocator.js');

var id_allocator = new bb_allocator.create(bb_allocator.id_allocator);

function requests_holder(modules, type){
    var _requests = [];
    this.create_request = function(without_data){
	if((type == 'xhr')&&(_requests.length > 3))
	    return null;
	  
	var request = modules.http_requester.create(type);

	if(without_data)
	    _requests.push(request);
	//вписать сюда свой установщик каллбека, который вставляет код удаления request
	request.on_closed(function(){
			      for(key in _requests){
				  if(_requests[key] == request){
				      _requests.splice(key,1);
                                      if(request.on_destroyed)
					  request.on_destroyed();
				      request.free();				      
				  }
			      }
			  });
	return request;
    }

    this.get_waited_request = function(){
	if(_requests.length)
	    return _requests[0];
	else return null;
    }
}

function packet_sender(modules, context, _holder, cli_id, _incoming, _lpoller){
    this.send = function(msg){	
	var request = _holder.get_waited_request();
	if(!request)
	    request = _holder.create_request(false);
	var msg_json = JSON.stringify({'cli_id' : cli_id, 'msg' : msg});

	if(request){
	    request.on_recv(function(data){
				if(data != 'undefined')
				    _incoming.add(JSON.parse(data));
			    });
	    request.open(context);
	    request.send(msg_json);	    	    
	}
	else
	    _lpoller.delayed_packets.push(msg_json);	    
    }
}

function lpoller(modules, context, _holder, _incoming){
    var _timer;
    this.delayed_packets = [];
    var _packets = this.delayed_packets;
    var _lpoller = this;
    this.try_poll = function(){	
	if(typeof(_timer) == 'undefined'){
	    _timer = modules.timer.js.create(function(){
						 var _waited = _holder.get_waited_request();
						 if(!_waited){
						     var request = _holder.create_request(true);
						     if(request){
							 request.on_destroyed = function(){_lpoller.try_poll()};
							 request.on_recv(function(data){
									     _incoming.add(JSON.parse(data));
									     request.close(); //в будущем надо учесть переиспользование объекта, возможно:)
									 });
							 request.open(context);				 
						     }
						 } else {
						     if(_packets.length > 0)
							 _waited.send(_packets.shift());
						 }
					     }, 100, true);	
	}
    }

    this.stop = function(){
	if(typeof(_timer) == 'object'){
	    _timer.destroy();
            _timer = undefined;	    
	}
    }
}

exports.create = function(context, type, modules){
    var utils = require('../../../parts/utils.js');
    var cli_id = id_allocator.alloc(); //надо бы научиться сервером генерировать
    var _incoming = new utils.msg_queue();
    //реализовать выбор транспорта, xhr или script
    var _holder = new requests_holder(modules, type);
    var _lpoller = new lpoller(modules, context, _holder, _incoming);
    var _sender = new packet_sender(modules, context, _holder, cli_id, _incoming, _lpoller);
    //надо везде подключить receiver
    return {
	'type' : 'client',
	'send' : function(msg){
	    _lpoller.try_poll();
	    _sender.send(msg);
	},
	'on_recv' : function(callback){
	    _incoming.on_add(callback);
	    _lpoller.try_poll();
	},
	'deactivate' : function(){
	    _lpoller.stop();
	}
    }
}
