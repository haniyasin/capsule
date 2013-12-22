var http = require('http');
var url = require('url');
var dns = require('dns');
var base32 = require('../../dependencies/base32.js');

// for storing active and unactive server contexts
var servers = [];

function server_create(context, address){
    var server  = {
	'ip' : context.ip = address,
	'port' : context._url.port,
	'contexts' : [context],
	'context_add' : function(context){
	    this.contexts.push(context);
	}
    };
    server._server = http.createServer(function(request, response){
					   var contexts = server.contexts;
					   var headers = request.headers;
					   for(i = 0; i < contexts.length;  i++){
					       var context = contexts[i], _url = context._url;
					       var request_url = url.parse(request.url,true);
					       if(url.parse('http://' + headers.host).hostname == _url.hostname && request_url.pathname == _url.pathname ){	
						   var content = '';
						   var res = {
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
						   };
						   
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
						       var _cb = context.data_cb;
						       request.on('data', function(data){
								      _cb(data, res);
								 });
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
    var server;
    context._url = url.parse(context.url);
    dns.lookup(context.url.hostname, function(err, address){
		   if(!err){
		       for (i = 0; i < servers.length; i++){
			   if(servers[i].ip == address && servers[i].port == context._url.port)
			       server = servers[i];
		       }
		       if (!server)
			   server = server_create(context, address);
		       callback(server);
		   } else 
		       console.log('failed lookup', context.url.hostname);
	       });
}
    
exports.on_recv = function(context, data_cb, error_cb){
    
    //проверяем контекст, по url находим ip адрес.
    // временно, это 
    context.data_cb = data_cb;
    context.error_cb = error_cb;

    server_find(context, function(server){    
		    server.context_add(context);
		});

//    http.cre    
}