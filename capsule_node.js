function capsule_module(type, name, features){
    this.type = type;
    this.name = name;
    this.features = features;
}

function timer_obj(){
    this.destroy = function(){
    }
}

function capsule_module_timer(name){
    this.create = function(callback, milisec){
	//return timer_obj
    }

    this.type = 'timer';
    this.name = name;
}

function msg_callback(msg_id){
    
}

function transport_obj(){
    this.send = function(msg_id, msg, callback){
    }

    this.callback_reg = function(msg_id, callback){
	
    }
    
    this.callback_unreg = function (msg_id){
	
    }

    this.error_callback = function(error){
    }

}

var transport_features = {
    //коонектящийся, поддерживает множество входных и выходных сообщений асинхронно
    'dealer' : 0x00000001,
    //принимающий, поддерживает множество входных и выходных сообщений асинхронно
    'router' : 0x00000002,
    //нуждается в асдресе при создании или нет. Если 1, то нужно, если 0, то не нуждается. Некоторые типы транспортов не могут иметь адреса впринципе, например принимающий сообщения вебворкер.
    'need_address' : 0x00000000,
    //только один экземпляр транспорта возможен, если 1. Опять же имеет смысл для webworker, ajax или когда создатель капсулы устанавливает подобные ограничения даже для tcp, udp и других транспортов
    'only_one_instance' : 0x00000000
}

function capsule_module_transport(name, features){
    this.type = 'transport';
    this.name = name;
    this.features = features;
    this.create = function(address){
	//return transport_obj
    }
    this.destroy = function(id){
    }
}

function capsule(){
    this.module_get_class = function(module_class){
    }
    
    this.module_register = function(module_class){
	if(this[module_class.type] == undefined){
	    this[module_class.type] = { }
	}
	this[module_class.type][module_class.name] = module_class;
    }

    this.module_unregister = function(module_class){
	this[module_class.type] = undefined;
    }
}

function node_capsule(){
    
    var timer = new capsule_module_timer('node');
    
    timer.create = function(callback, milisec, cycle){
	return {
	    cycle : cycle,
	    id : cycle ? setInterval(callback, milisec) : setTimeout(callback, milisec),
	    destroy : function(){
		cycle ? clearInterval(this.id) :clearTimeout(this.id);
	    }
	}
    }

    var zmq = require('zeromq');

    var transport_zmq = new capsule_module_transport('zmq', transport_features.router | transport_features.dealer);
    
    transport_zmq.create = function(address, features){
	if(features & transport_feautures.router){
	    var sock = zmq.createSocket('router');
	    sock.bindSync(address);
	    return {
		sock : sock,
		address : address,
		destroy : function(){
		    this.sock.close();
		}
	    }	    
	}
    }

    var transport_direct = new capsule_module_transport('direct', transport_features.router | transport_features.dealer);
    transport_direct.cb = new Array();
    transport_direct.create = function(address, features){
	transport_direct.cb[address] = new Array();
	if(features & transport_features.router){
            return {
		address : address,
		on_msg : function (msg_id, callback){
		    transport_direct.cb[address]["r" + msg_id] = callback;
		},
		send : function(msg_id, msg_body, callback){
		    if(transport_direct.cb[address]["d" + msg_id])
			transport_direct.cb[address]["d" + msg_id](msg_id,msg_body);
		    else console.log("Callback on", msg_id, "is not setted")
		    if(callback != null)
			transport_direct.cb[address]["r" + msg_id] = callback;
		},
		destroy : function(){}
	    }		    
	}else if (features & transport_features.dealer){
	    return {
		address : address,
		on_msg : function (msg_id, callback){
		    transport_direct.cb[address]["d" + msg_id] = callback;
		},
		send : function(msg_id, msg_body, callback){
		    if(transport_direct.cb[address]["r" + msg_id])
			transport_direct.cb[address]["r" + msg_id](msg_id,msg_body);
		    else console.log("Callback on", msg_id, "is not setted")
		    if(callback != null)
			transport_direct.cb[address]["d" + msg_id] = callback;
		},
		destroy : function(){}
		
	    }
	}
    }

    var node_c = new capsule;


    node_c.module_register(timer);
    node_c.module_register(transport_zmq);
    node_c.module_register(transport_direct)
    return node_c;
}

var nc = new node_capsule;

function mq(to_listen){
    this.peers = new Array();
    this.to_listen = to_listen;
    function dispatch(id, body){
	if(service = this.services[id]){
	    //пробросить внутрь контекст и доступ до mq
	    service[body.msg](body.data);
	}
    }
    //тут мы проверяем наличие транспортов, способных переварить адресы
    //если такие транспорты есть, то создаём их и подключаем себя к ним чтобы слушать
    var to_listen_1 = nc.transport.direct.create(to_listen[1], transport_features.dealer);
    tdr.on_msg(1,function(id, body){
		   dispatch(id, body);
	       });    

    this.listen = function(urls){
	
    }

    this.unlisten = function(urls){
	
    }

    this.peer_add = function(urls){
	this.peers.join(this.peers,urls);
	console.log(this.peers);
    }
    
    this.peer_remove = function(urls){
    }

    this.service_register = function(service_obj){
	//проверяем service_obj на верность
	this.services[service_obj.uuid] = service_obj;
	service_obj.mq = this;
    }
    
    this.service_unregister = function(uuid){
    }
}

with(nc){
    var tdr = transport.direct.create("13", transport_features.router);
    var tdd = transport.direct.create("13", transport_features.dealer);
    //tdd.on_msg(12, function(id, body){console.log('figg', body, id)});
    tdr.on_msg(12,function(id, body){
		   console.log(id, body); 
		   tdr.send(12, "hai");
				    });
    tdd.send(12, "figa");
    tdd.send(12, "miga", function(id, body){console.log(body, id)});
    tdd.send(12, "giga");

    var mq1 = new mq(nc,['direct', 'ch1']);
    var mq2 = new mq(nc,['direct', 'ch2']);
    var mq3 = new mq(nc,['direct', 'ch3']);
    
    mq1.peer_add(['direct', 'ch3']);
    mq2.peer_add(['direct', 'ch1']);


//    var timer = timer.node.create(function(){console.log('dfdf')}, 2000);
//    var routers = new Array;
//    for(var ind in transport){
//	if(transport[ind].features & transport_features.router){
//	    console.log(transport[trans].create);
//	    routers = transport[ind].create('tcp://127.0.0.1:27000');		    
//	}
 //   }
}


//create, destroy, get_class, register, unregister



//function get_class_timer(){
//    return {
//	set : function(milisec, callback){}
//    }
//}

//function register_timer(timer_class){
//    
//}


