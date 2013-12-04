function msg_queue(){
    var cb;
    var queue = [];
    this.add = function(msg){
	queue.push(msg);
	cb(msg);
    }
    this.pop = function(){
	return queue.pop();
    }
    this.on_add = function(callback){
	cb = callback;
    }
}


function _request(context, http_requester){
    this.on_closed = function(cb){
	//TODO to find himself and to delete from requests;
    }
}
function requests_holder(modules){
    var _requests = [];
    this.create_request = function(){
	var request = modules.http_requester.create('xhr');
	_requests.push(request);
	//вписать сюда свой установщик каллбека, который вставляет код удаления request
	request.on_closed(function(){
			      for(key in _requests){
				  if(_requests[key] == request){
				      _requests.splice(key,1);
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

function packet_sender(modules, _holder, _incoming, _lpoller){
    this.send = function(msg){	
	var request = _holder.get_waited_request();
	if(request){
		request.on_recv(function(data){_incoming.add(data)});
		request.send(msg);
	    	    
	} else 
	    _lpoller.delayed_packets.push(msg);
	// либо через try_poll, либо через холдер, когда он создаст новый request
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
						     var request = _holder.create_request();
						     request.on_destroyed = function(){_lpoller.try_poll()};
						     request.on_recv(function(data){_incoming.add(data)});
						     request.open(context);
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

exports.create = function(context, modules){
    var _incoming = new msg_queue(), _outgoing = new msg_queue();
    var _holder = new requests_holder(modules);
    var _lpoller = new lpoller(modules, context, _holder, _incoming);
    var _sender = new packet_sender(modules, _holder, _incoming, _lpoller);
    _outgoing.on_add(function(msg){_sender.send(msg)});
    //надо везде подключить receiver
    return {
	'send' : function(msg){
	    _lpoller.try_poll();
	    _outgoing.add(msg);
	},
	'on_recv' : function(callback){
	    _incoming.on_add(callback);
	    _lpoller.try_poll();
	}
	
    }
}
