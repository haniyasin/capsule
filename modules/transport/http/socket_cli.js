function msg_queue(){
    var cb;
    var queue = [];
    this.add = function(msg){
	queue.push(msg);
	cb(msg); //may be requests_holder
    }
    this.pop = function(){
	return queue.pop();
    }
    this.on_add = function(callback){
    }
}

function requests_holder(){
    function request(){
	this.last_access = 0;
	this.send_data = function(){
	}
	this.send_end = function(){
	}
        this.on_recv = function(cb){
	}	
	this.on_die = function(cb){
	}
    }
    this.create_request = function(data){
	return request;
    }

    this.get_waited_request = function(){
	return request;
    }
}

function packet_sender(){
    var request = requests_holder.get_waited_request();
    request.send(outgouing.pop());
    if(request.last_access > max_acces)
	request.send_end();
}

function packet_receiver(data){
    incoming.push(data);
}

function lpoller(){
    if(requests_holder.get_waited_request()){
	var request = requests_holder.create_request();
	request.on_die(lpoller);
    }
    timer.js.create(lpoller, 50, false);
}

exports.create = function(http_requester, context){
    var incoming = new msg_queue(), outgoing = new msg_queue();
    return {
	'send' : function(msg){
	    outgoing.add(msg);
//	    http_requester.send(context,data, function(){});
	},
	'on_recv' : function(callback){
	}
	
    }
}
