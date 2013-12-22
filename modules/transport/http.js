exports.backends = {
    'script' : 1,
    'iframe' : 2,
    'xhr' : 3
}

var max_packet_size = 2000;

var transport = require('../transport.js');

var msg = {
//    id
}

var packet = {
    'i' : '', //id
    'd' : '' //data
}

var frame = {
    'length' : '',
    'packets' : []
}

function frames_io_doer(context, type, modules){
    var socket_cli = require('./http/socket_cli.js');
    var socket = socket_cli.create(context, type, modules);
    this.frame_max_size = 3;
    this.add = function(frame){
    }
    
}

function msg_pack(msg, frame_io_doer){
    var packets = []; //[msg_id, packet_number,
    
    for(ind = 0; msg.length > frame_io_doer.frame_max_size; ind++){
	packets.push({
			 'n' : ind,
			 'd' : msg.substring(0, frame_io_doer.frame_max_size)
		     })
	msg = msg.substring(frame_io_doer.frame_max_size);
    }
    packets.push({
		     'n' : ind,
		     'd' : msg
		 })
    

    //разбиваем сообщение на пакеты и записываем в пакеты пакеты
    return {
	'discard_packets' : function(){
	    console.log(packets);
	}	
    }
}

exports.create = function(context, features, modules){
    var frame_max_size;
    if(features & transport.features.dealer){
	    //здесь необходимо как-то сделать выбор то ли script, то ли xhr бекэнда, а пока xhr и post по дефолту
	context.method = 'POST';
	var _frames_io_doer = new frames_io_doer(context, 'xhr', modules);

	return {
	    'on_msg' : function(msg_id, callback){
		if(_frames_io_doer.active)
		    _frames_io_doer.activate();		
	    },
	    'send' : function(msg, callback){
		if(msg.length > 0){
		    var _msg = msg_pack(msg, _frames_io_doer);
		    _msg.cb = callback;
		    _frames_io_doer.add(_msg.discard_packets());
		    if(_frames_io_doer.active)
			frames_io_doer.activate();		    
		} else
		    console.log('transport.send: you must send something');
	    },
	    'destroy' : function(){
	    }
	}
    }
    else if(features & transport.features.router){
	return {
	    'on_msg' : function(msg_id, callback){
		
	    },
	    'send' : function(msg, callback){
	    },
	    'destroy' : function(){
	    }
	}
    }
}