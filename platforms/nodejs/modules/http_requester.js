var http = require('http');
var url = require('url');

function request(){
    var _req,
    socket;
    var _on_load;
    var _on_closed;
    var _on_error;

    return {
	'send_once' : function(context, data, recv_cb, closed_cb, error_cb){
	    var _url = url.parse(context.url, true);
	    _url.method = context.method;
	    _url.headers = {
		'connection' : 'close',
		'Content-length' : data.length,
		'Expect' : ''
	    }
	    _req = new http.request(_url, function(response){
					response.setTimeout(2000);
					response.on('data', function(data){ 
							recv_cb(data.toString());
						    });
					response.on('close', closed_cb);
					response.on('timeout', closed_cb)
				    });
	    _req.on('close', closed_cb);
	    _req.on('error', error_cb);
//	    console.log(data);
	    _req.end(data);
	},
	'open' : function(context){
	    var _url = url.parse(context.url, false);
	    _url.method = context.method;
	    _url.headers = {
		'connection' : 'close',
		'Expect' : ''
	    }
	    _req = http.request(_url, function(response){
				    response.setTimeout(2000);
				    response.on('data', function(data){_on_load(data.toString());});
				    response.on('close', _on_closed);
				    response.on('timeout', _on_closed)
				});
	    _req.on('error', function(e){_on_closed(); _on_error(e);});
	    _req.on('socket', function(sock){
			socket = sock;
		    });
	},
	'send' : function(data){
	    _req.setHeader('Content-length', data.length);
	    _req.end(data);
	},
	'close' : function(){
	    socket.destroy();
	    _on_closed();
	    _req = null;
	    socket = null;
	},
	'on_recv' : function(recv_cb){
	    _on_load = recv_cb;
	},
	'on_close' : function(closed_cb){
	    _on_closed = closed_cb;
	},
	'on_error' : function(error_cb){
	    _on_error = error_cb;
	}
    }
}

exports.send = function(context, data, recv_cb, closed_cb, error_cb){
    var _request = new request();
    _request.send_once(context, data, recv_cb, closed_cb, error_cb);
}

exports.create = function(){
    return request();
}