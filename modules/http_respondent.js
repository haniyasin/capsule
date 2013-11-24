var http = require('http');
var url = require('url');
var dns = require('dns');

// for storing active and unactive server contexts
var servers = [];

function find_server(context){
    var server;
    context._url = url.parse(context.url);
    dns.lookup(context.url.hostname, function(err, address){
		   if(!err){
		       for (i = 0; i < servers.length; i++){
			   if(servers[i].ip == address && servers[i].port == context._url.port)
			       server = servers[i];
		       }
		       
		       if(!server){
			   server = {
			       ip : context.ip = address,
			       port : context._url.port,
			       contexts : [context]
			   };
			   server._server = http.createServer(function(request, response){
								  var contexts = server.contexts;
								  var headers = request.headers;

								  for(i = 0; i < contexts.length;  i++){
								      var context = contexts[i], _url = context._url;
								      var request_url = url.parse(request.url,true);
								      if(url.parse('http://' + headers.host).hostname == _url.hostname && request_url.pathname == _url.pathname ){	
									  var res = {
									      '_response' : response,
									      'header' : '',
									      'footer' : '',
									      'end' : function(data){
										  {
										      this._response.writeHead(200, {														  'Cache-Control' : 'no-cache' });
										      this._response.end(this.header + data + this.footer);
										  }
									      }
									  };
									  
									  //script jsonp support
									  if(request_url.query.jsonp != undefined){
//									      console.log(request_url.query.jsonp)
									      res.header = request_url.query.jsonp + '(';
									      res.footer = ')';
									  }
									  context.data_cb(context, res);								 }      
								  }
								  ;
							      });
			   
			   server._server.listen(context._url.port,context.ip);
			   servers.push(server);
			   //	server = http.createServer(request_handler);
			   //        server.listen(context.port, context.ip);
			   ///	servers.push([server, [context]]);
		       } else {
			   server.contexts.push(context);
		       }
		   } else 
		       console.log('failed');
	       });
    
    return server;    
}
    
var contexts = []

function find_context(request){
    
}

exports.on_recv = function(context, data_cb, error_cb){
    
    //проверяем контекст, по url находим ip адрес.
    // временно, это 
    context.data_cb = data_cb;
    context.error_cb = error_cb;

    var server = find_server(context);
 //    server.context_add(context);

//    http.cre    
}