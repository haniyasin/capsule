var bb_allocator = require('../../dependencies/bb_allocator.js');
var transport = require('../transport.js');

var frame = {
    'length' : '',
    'packets' : []
}

function frames_io_doer(socket_creator, modules){
    var id_allocator = new bb_allocator.create(bb_allocator.id_allocator);
    var messages = [];
    var frames = [];
    var socket;
    var activated = false;
    var resender_timer;

    function _frame_send(frame){
//	if(frame[2]++)
//	    console.log('надо еррор выкидывать');
//	console.log(frame);
	socket.send(frame);
    }
    this.frame_max_size = 250;
    this.add = function(msg){
	var packets = msg.packets;
	msg.packets = null;
	for(packet in packets){
	    var cur_frame = frames[frames.length - 1];
	    if(typeof(cur_frame) == 'object' && cur_frame.s < this.frame_max_size){
		cur_frame.p.push += packets[packet];
		cur_frame.s += packets[packet].s;
	    }
	    else
	    {
		_frame_send(JSON.stringify(cur_frame));
		cur_frame = {
		    'i' : id_allocator.alloc(),
		    's' : packets[packet].s,
		    'p' : [packets[packet]]
		}
		frames.push(cur_frame);
	    }
	}
	messages.push(msg);
    }    
    function resender(){
	for(key in frames){
//	    _frame_send(frames[key]);
	}	
    }
    this.activate = function(){
	if(!activated){	    
	    activated = true;
	    socket = socket_creator();
	    function msg_receiver(cli_id, msg){
//		if
		//нужно отправить отправляющему, что фрейм дошёл
		//нужно принять подтверждение доставки фрейма и убрать фрейм из списка фреймов к отправлению
		console.log(msg);
	    }
	    if(socket.type == 'client')
		socket.on_recv(msg_receiver);
	    if(socket.type == 'server')
	       socket.on_recv(null, msg_receiver);

	    resender_timer = modules.timer.js.create(resender, 500, true);	    
	}
    }

    this.deactivate = function(){
    }
}

function msg_packer(frames_io_doer){
//    var id_allocator = bb_allocator.create(bb_allocator.id_allocator);

    this.pack = function(msg_id, msg_body, callback){
	var packets = []; //[msg_id, packet_number,
	
	//нужно учесть размеры технических данных
	for(ind = 0; msg_body.length > frames_io_doer.frame_max_size; ind++){
	    packets.push({
			     'i' : msg_id,
			     'n' : ind,
			     'd' : msg_body.substring(0, frames_io_doer.frame_max_size)
			 });
	    msg_body = msg_body.substring(frames_io_doer.frame_max_size);
	}
	packets.push({
			 'l' : true,
			 'i' : msg_id,
			 'n' : ind,
			 's' : msg_body.length + 10,
			 'd' : msg_body
		     })

	return {
	    'length' : msg_body.length, //тут надо посчитать содержимое packets, реальное
	    'packets' : packets,
	    'cb' : callback
	}
    }
}

exports.create = function(context, features, modules){
    var frame_max_size;
    var _frames_io_doer;
    var _msg_packer;
    
    if(features & transport.features.dealer){
	    //здесь необходимо как-то сделать выбор то ли script, то ли xhr бекэнда, а пока xhr и post по дефолту
	context.method = 'POST';	
	_frames_io_doer = new frames_io_doer(function(){
						 var socket_cli = require('./http/socket_cli.js');
						 var socket = socket_cli.create(context, 'xhr', modules);
						 return socket;
					     }, modules);
    }
    else if(features & transport.features.router){
	_frames_io_doer = new frames_io_doer(function(){
						 var socket_srv = require('./http/socket_srv.js');
						 var socket = socket_srv.create(context, modules);
						 socket.listen();
						 return socket;
					     }, modules);
    }

    _msg_packer = new msg_packer(_frames_io_doer);

    return {
	'on_msg' : function(msg_id, callback){
	    _frames_io_doer.activate();		
	},
	'send' : function(msg_id, msg_body, callback){
	    _frames_io_doer.activate();		    
	    if(msg_body.length > 0){
		var _msg = _msg_packer.pack(msg_id, msg_body, callback);
		_frames_io_doer.add(_msg);
	    } else
		console.log('transport.send: you must send something');
	},
	'destroy' : function(){
	    _frames_io_doer.deactivate();
	}
    }
}

exports.backends = {
    'script' : 1,
    'iframe' : 2,
    'xhr' : 3
}
