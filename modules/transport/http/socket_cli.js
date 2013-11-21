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
    }
}


function _request(context, http_requester){
    var _requester = http_requester.create('xhr', context);
    this.last_access = 0;
    function destroy(){
	
    }
    this.send_data = function(){
    }
    this.send_end = function(){
	}
    this.on_recv = function(cb){
    }	
    this.on_die = function(cb){
	//TODO to find himself and to delete from requests;
    }
}
function requests_holder(context, http_requester){
    var _requests = [];
    this.create_request = function(context, data){
	console.log('fig fig', http_requester.create);
	var request = new _request(context, http_requester);
	_requests.push(request);
	return request;
    }

    this.get_waited_request = function(){
	if(_requests.length)
	    return _requests[0];
	else return null;
    }
}

function packet_sender(_holder){
    var max_access = 2;
    this.send = function(msg){	
	var request = _holder.get_waited_request();
	request.send(outgouing.pop());
	if(request.last_access > max_access){
	    request.on_recv(packet_receiver);
	    request.send_end();
	}
    }
}

function packet_receiver(data){
    incoming.push(data);
}

function lpoller(_holder, timer){
    timer.js.create(function(){
			if(!_holder.get_waited_request()){
			    var request = _holder.create_request();
			    request.on_die(lpoller);
			}
		    }, 50, false);
}

exports.create = function(context, http_requester, timer){
    var _incoming = new msg_queue(), _outgoing = new msg_queue();
    var _holder = new requests_holder(context, http_requester);
    var _sender = new packet_sender(_holder);
    _incoming.on_add(_sender.send);
    lpoller(_holder, timer);
    return {
	'send' : function(msg){
	    console.log(msg);
//	    outgoing.add(msg);
//	    http_requester.send(context,data, function(){});
	},
	'on_recv' : function(callback){
	}
	
    }
}
