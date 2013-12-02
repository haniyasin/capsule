function msg_queue(){
    var cb;
    var queue = [];
    this.add = function(msg){
	queue.push(msg);
	cb(msg); //may be packet_sender
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
				  if(_requests[key] == request)
				      _requests.splice(key,1);
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

function packet_sender(modules, _holder, packet_receiver){
    var max_access = 2;
    this.send = function(msg){	
	var request = _holder.get_waited_request();
	if(request){
	    if(request.last_access > max_access){
		request.on_recv(function(data){packet_receiver.on_recv(data)});
		request.send(msg);
	    }	    
	}
	//написать отложенное срабатывание либо через таймер, либо через try_poll, либо через холдер, когда он создаст новый request
    }
}

function packet_receiver(incoming){
    this.on_recv = function(data){
	incoming.push(data);
    }
}

function lpoller(modules, context, _holder, packet_receiver){
    var _timer;   
    this.try_poll = function(){	
	if(typeof(_poll_timer) == 'undefined'){
	    _timer = modules.timer.js.create(function(){
						 if(!_holder.get_waited_request()){
						     var request = _holder.create_request();
						     request.on_closed(lpoller);
						     request.on_recv(function(data){packet_receiver.recv(data)});
						     request.open(context);
						 }
					     }, 50, false);	
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
    var _receiver = new packet_receiver(_incoming);
    var _sender = new packet_sender(modules, _holder, _receiver);
    var _lpoller = new lpoller(modules, context, _holder, _receiver);
    _outgoing.on_add(function(msg){_sender.send(msg)});
    //надо везде подключить receiver
    return {
	'send' : function(msg){
	    _lpoller.try_poll();
	    console.log(msg);
	    _outgoing.add(msg);
	},
	'on_recv' : function(callback){
	    _lpoller.try_poll();
	    _incoming.on_add(callback);
	}
	
    }
}
