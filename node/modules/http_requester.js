var http = require('http');

function request(){
    var _req;
    _req.timeout = 2000;
    var _on_load;
    var _on_closed;
    var _on_error;
    
    return {
	'send_once' : function(context, data, recv_cb, closed_cb, err_cb){		
	     _req = new http.request(context); //тут надо правильно передать аргументы
	    //setting all callbacks
	    _req.send(data);
	},
	'open' : function(context){
	    _req = new http.request(context); //тут надо правильно передать аргументы
	},
	'send' : function(data){
	    if(_context)
		_req.open(_context.method, _pack_data_url(_context, data), true);		    
	    _req.send(data);
	},
	'close' : function(){
	    _req.abort();
	    _on_closed();
	},
	'on_recv' : function(recv_cb){
	    _on_load;
	},
	'on_closed' : function(closed_cb){
	    _on_closed =_req.ontimeout = closed_cb;
	},
	'on_err' : function(error_cb){
	}
    }
}

exports.send = function(context, data, data_cb, error_cb){
    var _request = new request();
    _request.send_once(arguments);
}

exports.create = function(){
    return new request();
}