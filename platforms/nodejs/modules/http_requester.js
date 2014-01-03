var http = require('http');
var url = require('url');

function request(){
    var _req;
    var _on_load;
    var _on_closed;
    var _on_error;

    return {
	'send_once' : function(context, data, recv_cb, closed_cb, err_cb){
	    var _url = url.parse(context.url, true);
	    _url.method = context.method;
	    _url.headers = {
		'connection' : 'close',
		'Content-length' : data.length(),
		'Expect' : ''
	    }
	    _req = new http.request(_url, function(response){
					response.on('data', function(data){ 
							recv_cb(data.toString());
						    });
				    });
	    _req.on('close', closed_cb);
	    _req.on('error', err_cb);
	    _req.end(data);
	},
	'open' : function(context){
	    var _url = url.parse(context.url, false);
	    _url.method = context.method;
	    _url.headers = {
		'connection' : 'close',
		'Content-length' : 2000,  //нужно реализовать передачу размера
		'Expect' : ''
	    }
	    _req = http.request(_url, function(response){
				    response.setTimeout(2000);
				    response.on('data', function(data){_on_load(data.toString())});
				});
	    _req.on('close', _on_closed);
	    _req.on('error', function(e){console.log(e.message)});
	},
	'send' : function(data){
	    _req.end(data);
	},
	'close' : function(){
	    _req.abort();
	    _on_closed();
	},
	'on_recv' : function(recv_cb){
	    _on_load = recv_cb;
	},
	'on_closed' : function(closed_cb){
	    _on_closed = closed_cb;
	},
	'on_err' : function(error_cb){
	},
	'free' : function(){
	    _req.abort();
	    _on_closed();
	    _req = null;
	}
    }
}

exports.send = function(context, data, data_cb, error_cb){
    var _request = new request();
    _request.send_once(arguments);
}

exports.create = function(){
    return request();
}