var bb_allocator = require('../../../dependencies/bb_allocator.js');
function response_holder(_incoming, modules){
    var ids = new bb_allocator.create(bb_allocator.id_allocator);
    var responses = [];
    this.get_waited_response = function(cli_id){
	for(key in responses){
	    if(responses[key][0] == cli_id)
		return response[key][1];
	}
	return null;	
    }

    this.activate = function(context){
	//нужно выбирать доступный http_respondent,  а не хардкодится на node
	modules.http_respondent.node.on_recv(context, 
					     function(content, response){
						 var _content = JSON.parse(content);
						 _incoming.add(_content);
						 if(_content.cli_id === undefined)
						     _content.cli_id = ids.alloc();
						 //проверить активно ли соединение
						 response.on('close',function(){
								       for(key in responses){
									   if(responses[key][1] == response)
									       responses.splice(key,1);
								       }
							     });

						 responses.push([_content.cli_id,response]);
					     },
					     function(error){console.log('response_holder is failed', error)})    
    }
}

function packet_sender(_outgoig, _holder){
    this.send = function(msg){
	_holder.get_waited_response(msg[0]).send_end(msg[1]);	
    }
}

function packet_receiver(_incoming){
    var callbacks = [];
    this.handler_add = function(cli_id, callback){
	callbacks.push([cli_id, callback]);
    }
    this.dispatch = function(msg){
	for(key in callbacks){
	    if(callbacks[key][0] == msg.cli_id)
		callbacks[key][1](msg.msg);
	}	
    }   
}

exports.create = function(context, modules){
    var utils = require('../../../dependencies/utils.js');
    var _incoming = new utils.msg_queue(), _outgoing = new utils.msg_queue();
    var _holder = new response_holder(_incoming, modules);
    var _sender = new packet_sender(_outgoing, _holder);
    _outgoing.on_add(function(msg){_sender.send(msg)});
    var _receiver = new packet_receiver(_incoming);
    _incoming.on_add(function(msg){_receiver.dipatch(msg)});
    
    return {
	'listen' : function(){
	    _holder.activate(context);
	},
	'send' : function(cli_id, msg){
	    _outgoing.add([cli_id, msg])
	},
	'on_recv' : function(cli_id, callback){
	    _receiver.handler_add(cli_id, callback)
	}
	
    }
}
