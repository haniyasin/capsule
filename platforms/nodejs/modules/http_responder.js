var http = require('http');
var url = require('url');
var dns = require('dns');
var base32 = require('../../../dependencies/base32.js');

// for storing active and unactive server contexts
var servers = [];

function server_create(context, address){
    var server  = {
	'responses' : [],
	'ip' : context.ip = address,
	'port' : context._url.port,
	'contexts' : [],
	'handler_add' : function(context){
	    this.contexts.push(context);
	},
	'handler_remove' : function(context){
	    for(ctx in this.contexts){
		if(this.contexts[ctx].url == context.url){
		    this.contexts.splice(ctx,1);
		    if(!this.contexts.length){
			this._server.close();
			for(res in this.requests){
			    this.responses[res].end();
			}
		    }
		}
	    }
	}
    };

    function create_response_wrapper(response){
	return {
	    '_response' : response,
	    'header' : '',
	    'footer' : '',
	    'end' : function(data){
		{
		    //нужна реализация работы с mimetype
		    this._response.writeHead(200, {														  'Cache-Control' : 'no-cache' });
		    this._response.end(this.header + data + this.footer);
		}
	    },
	    'on_close' : function(callback){
		this._response.on('close',callback);
	    },
	    'close' : function(){
	    }		    
	}
    }

    server._server = http.createServer(
	function(request, response){
	    server.responses.push(response);
	    var contexts = server.contexts;
	    var headers = request.headers;
	    for(key in contexts){
		var context = contexts[key],
		_url = context._url,
		request_url = url.parse(request.url,true);

		if(url.parse('http://' + headers.host).hostname == _url.hostname 
		   && request_url.pathname == _url.pathname){	

		    var content = '';
		    var res = create_response_wrapper(response);
		    
		    //script jsonp support
		    if(request_url.query.jsonp != undefined){
			res.header = request_url.query.jsonp + '(';
			res.footer = ')';
		    }
		    
		    switch(request.method){
		    case 'GET' :
			if(request_url.query.data){
			    content = base32.decode(request_url.query.data); 
			}			
			context.data_cb(content, res);						                                    break;
			
		    case 'POST' :
			(function(context){ 
			     request.on('data', function(data){
					    context.data_cb(data, res);
					});
			 })(context)
			break;
		    }						   
		}
	    }
	});
    
    server._server.listen(context._url.port,context.ip);
    servers.push(server);
    
    return server;
}

function server_find(context, callback){
    var server = null;
    context._url = url.parse(context.url);
    dns.lookup(context.url.hostname, function(err, address){
		   if(!err){
		       for (i = 0; i < servers.length; i++){
			   if(servers[i].ip == address && servers[i].port == context._url.port)
			       server = servers[i];
		       }
		       callback(server, address);
		   } else 
		       console.log('failed lookup', context.url.hostname);
	       });
}
    
exports.on_recv = function(context, data_cb, error_cb){
    context.data_cb = data_cb;
    context.error_cb = error_cb;

    server_find(context, function(server, address){    
		    if (!server)
			server = server_create(context, address);
		    server.handler_add(context);
		});
}

exports.remove_callback = function(context){
    server_find(context, function(server){
		    if(server)
			server.handler_remove(context);
		})
}