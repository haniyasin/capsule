var bb_allocator = require('../../../parts/bb_allocator.js');
var utils = require('../../../parts/utils.js');
var cb_synchronizer = require('../../../parts/cb_synchronizer.js');

var id_allocator = new bb_allocator.create(bb_allocator.id_allocator);

function requests_holder(type, modules){
    var _requests = [];
    this.success_metr = 0; //counter of success or failed
    this.on_disconnected = function(){};
    this.create_request = function(without_data){
	//this is hack for limit of several concurent XMLHttpRequest
	if((type == 'xhr')&&(_requests.length > 3))
	    return null;
	  
	var request = modules.http_requester.create(type);
	this.success_metr++;

	if(without_data)
	    _requests.push(request);
	//вписать сюда свой установщик каллбека, который вставляет код удаления request
	request.on_closed(function(){
			      for(key in _requests){
				  if(_requests[key] == request){
				      _requests.splice(key,1);
                                      if(request.on_destroyed)
					  request.on_destroyed();
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

function packet_sender(context, _holder, _incoming, _lpoller, modules){
    this.send = function(msg){	
	var request = _holder.create_request(false);
	var msg_json = JSON.stringify({'cli_id' : context.cli_id, 'msg' : msg});
	//изначальная идея совместить возможность long pooling с задёрженной отправкой не выходит, надо переработать
	if(request){
	    request.on_recv(function(data){
				//ignoring reply without data and undefined reply
				if(data != undefined && data != 'undefined' && data.length > 0){
				    var pdata = JSON.parse(data);
				    if(pdata.hasOwnProperty('cli_id'))
					context.cli_id = pdata.cli_id;
				    _incoming.add(pdata.msg);
				}
				request.close();
			    });
	    request.on_error(function(e){
				 if(--_holder.success_metr == 1){
				     _lpoller.stop();
				     _holder.on_disconnected(e);
				 }
			     });
	    request.open(context);
	    request.send(msg_json);	    	    
	}
	else{
	    _lpoller.delayed_packets.push(msg_json);	    	    
	}
    }
}

function lpoller(context, _holder, _incoming, modules){
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
									     if(data != undefined && data != 'undefined' && data.length > 0){
										 var pdata = JSON.parse(data);
										 if(pdata.hasOwnProperty('cli_id'))
										     context.cli_id = pdata.cli_id;
										 _incoming.add(pdata.msg);
									     }
									     request.close(); //в будущем надо учесть переиспользование объекта, возможно:)
									 });
							 request.on_error(function(e){
									      if(--_holder.success_metr == 1){
										  _lpoller.stop();
										  _holder.on_disconnected(e);
									      }
									  });
							 request.open(context);
							 request.send(JSON.stringify({'cli_id' : context.cli_id}));
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
    var _incoming = new utils.msg_queue();
    //реализовать выбор транспорта, xhr или script
    var _holder = new requests_holder(type, modules);
    context.cli_id = 0;
    var _lpoller = new lpoller(context, _holder, _incoming, modules);
    var _sender = new packet_sender(context, _holder, _incoming, _lpoller, modules);
    var incoming_sync = cb_synchronizer.create();
    var _on_recv = function(){};
    return {
	'connect' : function(callback){
	    console.log('dfdfd');
	    _incoming.on_add(_on_recv);
	    _lpoller.try_poll();
	    callback();
	},
	'send' : function(msg){
	    _sender.send(msg);
	},
	'on_recv' : function(callback){
	    _incoming.on_add(_on_recv = callback);
	},
	'on_disconnected' : function(callback){
	     _holder.on_disconnected = callback;
	},
	'disconnect' : function(){
	    _lpoller.stop();
	}
    }
}
