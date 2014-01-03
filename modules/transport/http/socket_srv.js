var bb_allocator = require('../../../parts/bb_allocator.js');
function get_by_cli_id(array, cli_id, push){
    for(key in array){
	if(array[key][0] == cli_id){
	    var value = array[key][1];
	    delete array[key];
	    return value;    
	}
    }
    return null;	    
}
function response_holder(_incoming, modules){
    var ids = new bb_allocator.create(bb_allocator.id_allocator);
    var responses = [];
    this.delayed_packets = [];
    this.get_waited_response = function(cli_id){
	return responses[cli_id].pop();
    }

    var _packets = this.delayed_packets;

    this.activate = function(context){
	//нужно выбирать доступный http_respondent,  а не хардкодится на node
	modules.http_responder.node.on_recv(context, 
					     function(content, response){
						 var _content = JSON.parse(content);
						 _incoming.add(_content);
						 if(_content.cli_id === undefined)
						     _content.cli_id = ids.alloc();
						 //проверить активно ли соединение
						 response.on_close(function(){
								       for(key in responses[_content.cli_id]){
									   if(responses[_content.cli_id][key] == response)
									       responses[_content.cli_id].splice(key,1);
								       }
								   });
						 //записать все ожидающие ответы
						 if(_packets.length){
						     var packet = get_by_cli_id(_packets, _content.cli_id);
						     if(packet)
							 response.end(packet);
						 } else {
						     //если много ждёт, то завершаем и оставляем не более 2
						     for(cli_id in responses){				 
							 while(responses[cli_id].length > 2){
							     responses[cli_id].pop().end();
							 }
						     }
						     if(typeof(responses[_content.cli_id]) == 'undefined')
							 responses[_content.cli_id] = [];
						     responses[_content.cli_id].push(response);	     
						 }
					     },
					     function(error){console.log('response_holder is failed', error)})    
    }

    this.deactivate = function(){
	//нужно написать деактивацию и добавить соответствующие возможности в http_respondent
    }
}

function packet_sender(_outgoig, _holder){
    this.send = function(msg){
	var response = _holder.get_waited_response(msg[0]);
	if(response)
	    response.end(msg[1]);
	else
	    _holder.delayed_packets.push(msg);
    }
}

function packet_receiver(_incoming){
    var _callback;
    this.handler_add = function(callback){
	_callback = callback;
    }
    this.dispatch = function(msg){
	_callback(msg.cli_id, msg.msg);
    }   
}

exports.create = function(context, modules){
    var utils = require('../../../parts/utils.js');
    var _incoming = new utils.msg_queue(), _outgoing = new utils.msg_queue();
    var _holder = new response_holder(_incoming, modules);
    var _sender = new packet_sender(_outgoing, _holder);
    _outgoing.on_add(function(msg){_sender.send(msg)});
    var _receiver = new packet_receiver(_incoming);
    _incoming.on_add(function(msg){_receiver.dispatch(msg)});
    
    return {
	'type' : 'server',
	'listen' : function(){
	    _holder.activate(context);
	},
	'on_connect' : function(onconnect){
	    var clients = {};
	    _receiver.handler_add(function(cli_id, msg){
				      if(typeof(clients[cli_id]) == 'undefined'){
					  onconnect({	    
							'send' : function(msg){
							    _outgoing.add([cli_id, JSON.stringify(msg)])
							},
							'on_recv' : function(callback){
							    clients[cli_id] = callback;  
							}
						    });
				      } else
					  clients[cli_id](msg);
				  })
	},
	'close' : function(){
	    _holder.deactivate();
	}	    
	
    }
}
