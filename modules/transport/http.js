var bb_allocator = require('../../parts/bb_allocator.js');
var transport = require('../transport.js');

var frame = {
    'length' : '',
    'packets' : []
}

function frames_io_doer(socket, modules){
    var id_allocator = new bb_allocator.create(bb_allocator.id_allocator);
    var messages = [];
    var frames = [{ 'i' : id_allocator.alloc(), 's' : 10, 'p' : [], 't' : 0}];
    var activated = false;
    var resender_timer;
    var _on_msg;

    function _frame_send(frame){
	socket.send(JSON.stringify(frame));
     }
    this.frame_max_size = 250;

    this.on_msg = function(callback){
	_on_msg = callback;
    }

    this.msg_add = function(msg){
	var cur_frame = frames[frames.length - 1];
	var packets = msg.packets;
	msg.packets = null;
	for(packet in packets){
	    if(typeof(cur_frame) == 'object' && cur_frame.s < this.frame_max_size){
		cur_frame.p.push += packets[packet];
		cur_frame.s += packets[packet].s;
	    }
	    else
	    {
		_frame_send(cur_frame);

		cur_frame = {
		    'i' : id_allocator.alloc(),
		    's' : packets[packet].s,
		    'p' : [packets[packet]],
		    't' : 0
		}
		frames.push(cur_frame);
	    }
	}
	messages.push(msg);
    }    

    function resender(){
	for(key in frames){
	    if(frames[key].t > 4)
		console.log('нихрена не отправляется, надо вываливаться');
	    frames[key].t++;
	    _frame_send(frames[key]);
	}	
    }
    
    function msg_receiver(msg){
	msg = JSON.parse(msg);
	var cur_frame = frames[frames.length - 1];
	console.log('id is', msg, 'ttt');

	if(typeof(cur_frame.r) == 'undefined')
	    cur_frame.r = [];
	cur_frame.r.push(msg.i);
	
	for(received in msg.r){
	    for(key in frames){
		if(frames[key].i == msg.r[received])
		    delete frames[key];
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
    var id_allocator = new bb_allocator.create(bb_allocator.id_allocator);

    this.pack = function(msg){
	var packets = []; //[msg_id, packet_number,
	
	//нужно учесть размеры технических данных
	for(ind = 0; msg.length > frames_io_doer.frame_max_size; ind++){
	    packets.push({
			     'i' : id_allocator.alloc(),
			     'n' : ind,
			     'd' : msg.substring(0, frames_io_doer.frame_max_size)
			 });
	    msg = msg.substring(frames_io_doer.frame_max_size);
	}
	packets.push({
			 'l' : true,
			 'i' : id_allocator.alloc(),
			 'n' : ind,
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
						  _frames_io_doer.activate();		    
						  if(msg.length > 0){
						      var _msg = _msg_packer.pack(msg, callback);
						      _frames_io_doer.msg_add(_msg);
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
