var transport = require('../transport.js');

function frames_sender(socket, modules){
    var frames = [];
    var activated = false;
    var resend_timer;
    var _on_msg;

    function _send(frame){
	var cur_time = new Date().valueOf();
	//resending frame every 5 second
	if(!frame.ti || cur_time - frame.ti > 5000 ){
	    frame.ti = cur_time;
	    socket.send(frame);	       
	    frame.t++;
	}    
    }

    function _resend(){
	for(key in frames){
	    var frame = frames[key];
	    //checking number of trying to send
	    if(frame.t > 5){
		if(!frame.p.length){
		    frames.splice(key,1);		
		}else {
		    console.log('нихрена не отправляется, надо вываливаться');
		    //		    console.log(frames[key]);		    
		}
		continue;		
	    }else
		_send(frame);
	}
    }

    this.frame_max_size = 300;

    this.add = function(frame){
	frames.push(frame);
	this.activate();
	_send(frame);
    }

    this.remove_delivered = function(ids){
	//deleting delivered frames from outgoing queue
	for(ind in ids){
	    var fk = frames.length - 1;
	    //loop in reverse because of conflicting splice and forward loop
	    while(fk >= 0){
		if(frames[fk].i == ids[ind]){
		    frames.splice(fk, 1)		    
		}
		fk--;
	    }
	}
    }

    this.activate = function(){
	if(!activated){	    
	    activated = true;
	    resend_timer = modules.timer.js.create(_resend, 500, true);	    
	}
    }

    this.deactivate = function(){
	if(activated)
	    resend_timer.destroy();
    }
}

function frames_receiver(frames_sender, msg_packer, socket, modules){
    var _on_packets = function(packets){console.log(packets)};
    var past_frames = {};
    socket.on_recv(function(msg){
		       //console.log('hahaha' + msg);
		       if(msg.r)
			   frames_sender.remove_delivered(msg.r);
		       
		       //not parsing frames which is received twice
		       if(!past_frames.hasOwnProperty(msg.i) && 
			  msg.p.length > 0){   
			   past_frames[msg.i] = true;
			   //console.log('ggg')
			   //adding received frames' ids in frame from outgoing queue
			   msg_packer.confirm_receiving(msg.i);

			   //if we are having packets - proccess packets
			   _on_packets(msg.p);
		       }
		   });

    this.on_packets = function(callback){
	if(typeof(callback) == 'function')
	    _on_packets = callback;
	else
	    console.log("frame_receiver.on_frame: callback isn't a function");
    }
}
    

function msg_packer(frames_sender, capsule){
    var bb_allocator = capsule.parts.bb_allocator;
    var modules = capsule.modules;
    var frame_id_allocator = new bb_allocator.create(bb_allocator.id_allocator);
    function get_blank_frame(){
	return { 'i' : frame_id_allocator.alloc(), 's' : 10, 'p' : [], 't' : 0, 'r' : [], 'ti' : 0};
    }

    var msg_id_allocator = new bb_allocator.create(bb_allocator.id_allocator);
    var short_frame_timer = null;

    var cur_frame = get_blank_frame();

    this.confirm_receiving = function(id){
	cur_frame.r.push(id);
    }

    this.add = function(msg){
	//creating timer for periodically sending incompleted frame
	if(!short_frame_timer)
	    modules.timer.js.create(function(){
					if(cur_frame.p.length || cur_frame.r.length){
					    frames_sender.add(cur_frame)
					    cur_frame = get_blank_frame();				
					}
				    }, 200, true);
	var packets = []; //[msg_id, packet_number,
	
	var msg_id = msg_id_allocator.alloc();
	//нужно учесть размеры технических данных
	for(var packet_ind = 0; msg.length > frames_sender.frame_max_size; packet_ind++){
	    packets.push({
			     'i' : msg_id,
			     'n' : packet_ind,
			     'd' : msg.substring(0, frames_sender.frame_max_size)
			 });
	    msg = msg.substring(frames_sender.frame_max_size);
	}
	packets.push({
			 'c' : packet_ind + 1, //amount of packets
			 'i' : msg_id,
			 'n' : packet_ind,
			 's' : msg.length + 10,
			 'd' : msg
		     })

	for(packet in packets){
	    if(cur_frame.s > frames_sender.frame_max_size){
		frames_sender.add(cur_frame);
		cur_frame = get_blank_frame();
	    }	    
	    cur_frame.p.push(packets[packet]);
	    cur_frame.s += packets[packet].s;
	}

	//последний фрейм, пусть и наполовину пустой, когда-нибудь то надо отправлять всё равно:)
    }

    this.deactivate = function(){
	if(short_frame_timer)
	    short_frame_timer.destroy();
    }
}

function msg_unpacker(_frames_receiver){
    var received_msgs = [];
    var frames = [];
    var _on_msg = function(msg){console.log(msg)};

    _frames_receiver.on_packets(
	function(packets){
	    var cur_msg;
	    for(packet in packets){
		if(!received_msgs.hasOwnProperty(packets[packet].i)){
		    received_msgs.push(cur_msg = {
					   'i' : packets[packet].i,
					   'p' : [],
					   'c' : -1
				       });
		} 
		else
		    cur_msg = received_msgs[packets[packet].i];
		
		cur_msg.p[packets[packet].n] = packets[packet].d;
		if(packets[packet].hasOwnProperty('c'))
		    cur_msg.c = packets[packet].c;
		//нужно ещё подумать как лучше обеспечить проверку и целостность
		if(cur_msg.c == cur_msg.p.length){
		    _on_msg(cur_msg.p.join(''));
		}
	    }
	});
    
    this.on_msg = function(callback){
	if(typeof(callback) == 'function')
	    _on_msg = callback;
	else
	    console.log("msg_unpacker.on_msg: callback isn't a function");
    }

}

function get_by_cli_id(array, cli_id, remove){
    for(key in array){
	if(array[key][0] == cli_id){
	    var value = array[key][1];
	    if(remove === true)
		delete array[key];
	    return value;    
	}
    }
    return null;	    
}

exports.create = function(context, features, capsule){
    var modules = capsule.modules;
    if(features & transport.features.client){
	    //здесь необходимо как-то сделать выбор то ли script, то ли xhr бекэнда, а пока xhr и post по дефолту
	var socket_cli = modules.transport.http.socket_cli;
	var socket = socket_cli.create(context, 'xhr', capsule);

	var _frames_sender = new frames_sender(socket, modules);
	var _msg_packer = new msg_packer(_frames_sender, capsule);
	var _frames_receiver = new frames_receiver(_frames_sender, _msg_packer, socket, modules);
	var _msg_unpacker = new msg_unpacker(_frames_receiver);
	
	return {
	    "connect" : function(callback){
		socket.connect(callback);
	    },
	    "on_msg" : function(callback){
		_msg_unpacker.on_msg = callback;
	    },
	    "send" : function(msg){
		if(msg.length > 0)
		    _msg_packer.add(msg);
		else
		    console.log('transport.send: you must send something');
	    },
	    "destroy" : function(){
		_frames_sender.deactivate();
		msg_packer.deactivate();
		socket.close();
	    },
	    "on_destroy" : function(callback){
		
	    }
	}
	
    }
    else if(features & transport.features.server){
	var clients = [];
	var _on_connect;
	var socket_srv = modules.transport.http.socket_srv;
	var socket = socket_srv.create(context, modules);
	
	socket.on_connect(function(csocket){
			      var _frames_sender = new frames_sender(csocket, modules);
			      var _msg_packer = new msg_packer(_frames_sender, modules);
			      var _frames_receiver = new frames_receiver(_frames_sender, _msg_packer, csocket, modules);
			      var _msg_unpacker = new msg_unpacker(_frames_receiver);
			      clients.push({"frame_sender" :_frames_sender, "msg_packer" :_msg_packer});
			      
			      _on_connect({
					      "on_msg" : function(callback){
						  _msg_unpacker.on_msg(callback);
					      },
					      "send" : function(msg){
						  if(msg.length > 0){
						      _msg_packer.add(msg);
						  } else
						      console.log('transport.send: you must send something');
					      },
					      "on_destroy" : function(callback){
					      }
					  });
			  });

	return {
	    "on_connect" : function(callback){
		if(typeof(callback) != 'function')
		    console.log('set a callback please');
		_on_connect = callback;
 		socket.listen();
	    },
	    "destroy" : function(){
		for(key in clients){
		    clients[key].frame_sender.deactivate();
		    clients[key].msg_packer.deactivate();
		}		
		socket.close();
		clients = null;
	    }
	}
    }
}

