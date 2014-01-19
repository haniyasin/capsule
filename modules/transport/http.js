var bb_allocator = require('../../parts/bb_allocator.js');
var transport = require('../transport.js');

var frame = {
    'length' : '',
    'packets' : []
}

function frames_io_doer(socket, modules){
    var id_allocator = new bb_allocator.create(bb_allocator.id_allocator);
    function get_blank_frame(){
	return { 'i' : id_allocator.alloc(), 's' : 10, 'p' : [], 't' : 0, 'r' : [], 'ti' : 0};
    }
    var frames = [get_blank_frame()];
    var activated = false;
    var resender_timer;
    var _on_msg;

    function get_current_frame(){
	var cur_frame;
	if(frames.length)
	    cur_frame = frames[frames.length - 1];
	else {	    
	    cur_frame = get_blank_frame();
	    frames.push(cur_frame);	    
	}
	return cur_frame;
    }

    function _frame_send(frame){
	var cur_time = new Date().valueOf();
	//resending frame every 5 second
	if(!frame.ti || cur_time - frame.ti > 5000 ){
	    frame.ti = cur_time;
	    socket.send(frame);	       
	    frame.t++;
	}
     }
    this.frame_max_size = 250;

    this.on_msg = function(callback){
	_on_msg = callback;
    }

    this.msg_add = function(msg){
	var cur_frame = get_current_frame();
	var packets = msg.packets;
	msg.packets = null;
	for(packet in packets){
	    if(typeof(cur_frame) == 'object' && cur_frame.s < this.frame_max_size){
		cur_frame.p.push(packets[packet]);
		cur_frame.s += packets[packet].s;
	    }
	    else
	    {	
		if(typeof(cur_frame) != 'undefined')
		    _frame_send(cur_frame);

		cur_frame = {
		    'i' : id_allocator.alloc(),
		    's' : packets[packet].s,
		    'p' : [packets[packet]],
		    't' : 0,
		    'r' : [],
		    'ti' : 0
		}
		frames.push(cur_frame);
	    }
	}
    }    

    function resender(){
	for(key in frames){
	    if(frames[key].t > 5){
		if(!frames[key].p.length){
		    frames.splice(key,1);		
		}else {
		    console.log('нихрена не отправляется, надо вываливаться');
//		    console.log(frames[key]);		    
		}
		continue;		
	    }
	    _frame_send(frames[key]);
	}	
    }
    
    var received_msgs = [];
    var past_frames = {};
    function msg_receiver(msg){
	var cur_frame = get_current_frame();
	
	//not parsing frames which is received twice
	if(!past_frames.hasOwnProperty(msg.i)){   
	    past_frames[msg.i] = true;
	    //extracting packets and assemble msg
	    if(msg.p.length){
		var cur_msg;
		for(packet in msg.p){
		    if(!received_msgs.hasOwnProperty(msg.p[packet].i)){
			received_msgs.push(cur_msg = {
					       'i' : msg.p[packet].i,
					       'p' : [],
					       'c' : -1
					   });
		    } 
		    else
			cur_msg = received_msgs[msg.p[packet].i];
		    cur_msg.p[msg.p[packet].n] = msg.p[packet].d;
		    if(msg.p[packet].hasOwnProperty('c'))
			cur_msg.c = msg.p[packet].c;
		    
		    if(cur_msg.c == cur_msg.p.length){
			_on_msg(cur_msg.p.join(''));
		    }
		    //		}		    
		}
	    }

	    //adding received frames' ids in frame from outgoing queue
	    cur_frame.r.push(msg.i);

	}
	//deleting delivered frames from outgoing queue
	for(received in msg.r){
	    for(key in frames){
		if(frames[key].i == msg.r[received]){
		    //необходимо реализовать возвращение использованных msg_id
			//for(packet in frames[key].p){
		    //freeing used for messages ids
		    //	frames[key].p[packet].i.free();
		    //  }
		    //freeing used for frames ids
		    //		    id_allocator.free(frames[key].i);
		    frames.splice(key,1);		    
		}
	    } 
	}
    }
    
    this.activate = function(){
	if(!activated){	    
	    activated = true;
	    socket.on_recv(msg_receiver);

	    resender_timer = modules.timer.js.create(resender, 500, true);	    
	}
    }

    this.deactivate = function(){
	socket.close();
	resender_timer.close();
    }
}

function msg_packer(frames_io_doer){
    this.id_allocator = new bb_allocator.create(bb_allocator.id_allocator);
    frames_io_doer.msg_packer = this;

    this.pack = function(msg){
	var packets = []; //[msg_id, packet_number,
	
	var msg_id = this.id_allocator.alloc();
	//нужно учесть размеры технических данных
	for(var packet_ind = 0; msg.length > frames_io_doer.frame_max_size; packet_ind++){
	    packets.push({
			     'i' : msg_id,
			     'n' : packet_ind,
			     'd' : msg.substring(0, frames_io_doer.frame_max_size)
			 });
	    msg = msg.substring(frames_io_doer.frame_max_size);
	}
	packets.push({
			 'c' : packet_ind + 1, //amount of packets
			 'i' : msg_id,
			 'n' : packet_ind,
			 's' : msg.length + 10,
			 'd' : msg
		     })

	return {
	    'length' : msg.length, //тут надо посчитать содержимое packets, реальное
	    'packets' : packets,
	}
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

exports.create = function(context, features, modules){
    var frame_max_size;
    
    if(features & transport.features.client){
	var _frames_io_doer;
	var _msg_packer;
	var incoming;
	    //здесь необходимо как-то сделать выбор то ли script, то ли xhr бекэнда, а пока xhr и post по дефолту
	context.method = 'POST';	
	var socket_cli = require('./http/socket_cli.js');
	var socket = socket_cli.create(context, 'xhr', modules);

	_frames_io_doer = new frames_io_doer(socket, modules);
	_msg_packer = new msg_packer(_frames_io_doer);
	
	return {
	    'connect' : function(callback){
		socket.connect(callback);
	    },
	    'on_msg' : function(callback){
		_frames_io_doer.on_msg(callback);
		_frames_io_doer.activate();		
	    },
	    'send' : function(msg){
		_frames_io_doer.activate();		    
		if(msg.length > 0){
		    var _msg = _msg_packer.pack(msg);
		    _frames_io_doer.msg_add(_msg);
		} else
		    console.log('transport.send: you must send something');
	    },
	    'destroy' : function(){
		_frames_io_doer.deactivate();
	    }
	}
	
    }
    else if(features & transport.features.server){
	var clients = [];
	var _on_connect;
	var socket_srv = require('./http/socket_srv.js');
	var socket = socket_srv.create(context, modules);

	socket.on_connect(function(socket){
			      var _frames_io_doer = new frames_io_doer(socket, modules);
			      var _msg_packer = new msg_packer(_frames_io_doer);
			      clients.push(_frames_io_doer);
			      _on_connect({
					      'on_msg' : function(callback){
						  _frames_io_doer.on_msg(callback);
						  _frames_io_doer.activate();
					      },
					      'send' : function(msg, callback){
						  if(msg.length > 0){
						      var _msg = _msg_packer.pack(msg, callback);
						      _frames_io_doer.msg_add(_msg);
						      _frames_io_doer.activate();		    
						  } else
						      console.log('transport.send: you must send something');
					      }
					  });
			  });

	return {
	    'on_connect' : function(callback){
		if(typeof(callback) != 'function')
		    console.log('set a callback please');
		_on_connect = callback;
 		socket.listen();
	    },
	    'destroy' : function(){
		for(key in clients){
		    clients[key].deactivate();
		}		
		socket.close();
		clients = null;
	    }
	}
    }
}

exports.backends = {
    'script' : 1,
    'iframe' : 2,
    'xhr' : 3
}
