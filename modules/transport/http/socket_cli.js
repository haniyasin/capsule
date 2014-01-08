var bb_allocator = require('../../../parts/bb_allocator.js');

var id_allocator = new bb_allocator.create(bb_allocator.id_allocator);

function requests_holder(type, modules){
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
//				      console.log('deleted');
				      _requests.splice(key,1);
                                      if(request.on_destroyed)
					  request.on_destroyed();
				      request.close();				      
				  }
			      }
			  });
	return request;
    }

    this.get_waited_request = function(){
	if(_requests.length)
	    return _requests.shift();
	else return null;
    }
}

function packet_sender(context, _holder, cli_id, _incoming, _lpoller, modules){
    this.send = function(msg){	
	var request = _holder.create_request(false);
	var msg_json = JSON.stringify({'cli_id' : cli_id, 'msg' : msg});

	//изначальная идея совместить возможность long pooling с задёрженной отправкой не выходит, надо переработать
	if(request){
	    request.on_recv(function(data){
				if(data != undefined && data != 'undefined')
				    _incoming.add(JSON.parse(data));
				request.close();
			    });
	    request.open(context);
	    request.send(msg_json);	    	    
	}
//	else{
//	    _lpoller.delayed_packets.push(msg_json);	    	    
//	}
    }
}

function lpoller(context, _holder, _incoming, cli_id, modules){
    var _timer = null;
    this.delayed_packets = [];
    var _packets = this.delayed_packets;
    var _lpoller = this;
    this.try_poll = function(){	
	if(!_timer){
	    _timer = modules.timer.js.create(function(){
						 var _waited = _holder.get_waited_request();
						 if(!_waited){
						     var request = _holder.create_request(true);
						     if(request){
							 request.on_destroyed = function(){_lpoller.try_poll()};
							 request.on_recv(function(data){
									     if(data != undefined && data != 'undefined')
										 _incoming.add(JSON.parse(data));
									     request.close(); //в будущем надо учесть переиспользование объекта, возможно:)
									 });
							 request.open(context);
							 request.send(JSON.stringify({'cli_id' : cli_id}));
						     }
						 }
					     }, 200, true);	
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
    var _holder = new requests_holder(type, modules);
    var _lpoller = new lpoller(context, _holder, _incoming, cli_id, modules);
    var _sender = new packet_sender(context, _holder, cli_id, _incoming, _lpoller, modules);
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
