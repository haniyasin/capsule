/* Test for capsule common properties
 * 
 */

var fs = require('fs');

var capsule = require('../capsule.js');
var DEBUG = 1;

var modules = capsule.create();
with(modules){
    var socket_cli = require('../modules/transport/http/socket_cli.js');

   var socket = socket_cli.create({ 'url' : "http://localhost:8810/socket.js", 'method' : "POST" }, 'xhr', modules);
   var inde = 0;
   socket.on_recv(function(msg){console.log("prishlo",msg)});
    
   for(var ind = 0; ind < 300; ind++){
       socket.send('blah blah, tuk tuk' + ind);
   }

/*    var request = http_requester.create();

    request.on_recv(function(data){console.log(data)});
    request.on_closed(function(){console.log('closed')});
    request.open({ 'url' : "http://localhost:8810/capsule.htm", 'method' : "POST" });
    request.send('ff');
*/
//    var http = require('http');
//    var _req = http.request( { 'hostname' : 'localhost',
//			       'port' : '8810',
//			       'path' : '/capsule.htm',
//			       'method' : 'POST'
//			     }, function(response){
//				//				    response.setTimeout(2000);
//				console.log('dfdfdf');
//				response.on('data', function(data){console.log(data.toString())});
//				//				    response.end();
//			    });
//    _req.write('tt');	    

 }