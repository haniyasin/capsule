/*
 * server implementation api like sockets over http_responder
 */

var error = require('parts/error.js');

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
function response_holder(_incoming, capsule){
    var ids = new capsule.dependencies.bb_allocator.allocator(capsule.dependencies.bb_allocator.id_allocator);
    var responses = [];
    this.delayed_packets = [];
    var extra_cleaner_timer = null; //extra connection cleaner

    var _packets = this.delayed_packets;

    var _on_error_cb = function(error){
	console.log(JSON.stringify(error));
    };

    this.on_error = function(callback){
	_on_error_cb = callback;	
    };

    this.get_waited_response = function(cli_id){
	if(responses.length)
	    return responses[cli_id].pop();
	return null;
    };

    this.activate = function(context){
	extra_cleaner_timer = capsule.modules.timer.create(
	    function(){
		//если много ждёт, то завершаем и оставляем не более 3
		for(cli_id in responses){				 
		    while(responses[cli_id].length > 2){
			responses[cli_id].pop().end();
		    }
		}
	    }, 2000, true);

	ids.alloc();

	//нужно выбирать доступный http_responder
	capsule.modules.http_responder.on_recv(context, 
				       function(content, response){
					   //проверить активно ли соединение
					   if(content == ''){
					       console.log('empty request');
					       return;
					   }
					   response.on_close(
					       function(){
						   var _responses = responses[_content.cli_id];
						   var rk = _responses.length -1;
						   while(rk >= 0){
						       if(responses[rk] == response)
							   responses.splice(rk, 1);
						       rk--;
						   }
					       });
					   var _content = JSON.parse(content);
					   
					   //client is connecting, first msg
					   var msg_connect = false;
					   if(_content.cli_id == 0){
					       _content.cli_id = ids.alloc();
					       msg_connect = true;
					   }
					   
					   //new msg
					   if(_content.hasOwnProperty('msg'))
					       _incoming.add(_content);
					   
					   //send delayed packet
					   if(_packets.length){
					       var packet = get_by_cli_id(_packets, _content.cli_id);
					       if(packet)
						   response.end(packet);
					   } else 
					       if(msg_connect)
						   //client is connecting, send allocated cli_id back
						   response.end(JSON.stringify({"cli_id" : _content.cli_id}));
					   else {
					       //nothing to send, save response object on the future
					       if(typeof(responses[_content.cli_id]) == 'undefined')
						   responses[_content.cli_id] = [];
					       responses[_content.cli_id].push(response);	     
					   }
				       },
				       function(nerror){_on_error_cb(new error(nerror.name, nerror.msg));});    
    };

    this.deactivate = function(context){
	capsule.modules.http_responder.remove_callback(context);	
	extra_cleaner_timer.destroy();
    };
}

function packet_sender(_holder){
    this.send = function(msg){
	var response = _holder.get_waited_response(msg.cli_id);
	if(response)
	    response.end(JSON.stringify(msg));
	else
	    _holder.delayed_packets.push([msg.cli_id, JSON.stringify(msg)]);
    };
}

exports.create = function(context, capsule){
    var utils = capsule.dependencies.utils;
    var _incoming = new utils.msg_queue();
    var _holder = new response_holder(_incoming, capsule);
    var _sender = new packet_sender(_holder);
    var _on_error_cb = function(erorr){
	console.log(JSON.stringify(error));
    };
    
    return {
	'listen' : function(){
	    _holder.activate(context);
	},
	'on_connect' : function(connect_cb){
	    var clients = {};
	    _incoming.on_add(function(msg){
				 if(typeof(clients[msg.cli_id]) == 'undefined'){
				     connect_cb({	    
						   'send' : function(data){
						       _sender.send({"cli_id" : msg.cli_id, "msg" : data});
						   },
						   'on_recv' : function(callback){
						       clients[msg.cli_id] = callback;  
						   }
					       });
				 } else
				     clients[msg.cli_id](msg.msg);
			     });
	},
	'on_error' : function(callback){
	    _on_error_cb = callback;
	    _holder.on_error(callback);
	},
	'close' : function(){
	    _holder.deactivate(context);
	}	    
	
    };
}
