var zmq = require('zeromq');
var transport = require('../transport.js');

var transport_zmq = new transport.module_interface('zmq', transport.features.router | transport.features.dealer);

exports.create = function(address, features){
    if(features & transport.features.router){
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
