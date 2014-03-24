/*
 * Test of http_responder module 
 */

exports.test = function(capsule){
    console.log("starting modules/http_responder test...");

    var http_responder = capsule.modules.http_responder;

    var context1 = { 'method' :'get', 
		    'url' : 'http://127.0.0.1:8810/hai' 
		   };
    var context2 = { 'method' :'get', 
		    'url' : 'http://localhost:8812/jo/ti' 
		   };
    var context3 = { 'method' :'get', 
		    'url' : 'http://localhost:9910/blah/go' 
		   };

    http_responder.on_recv(context1, function(content, response){
			       response.end('voz*mi obratro odin' + content);
			   })    

    http_responder.on_recv(context2, function(content, response){
			       response.end('voz*mi obratro dva' + content);
			   })    

    http_responder.on_recv(context3, function(content, response){
			       response.end('voz*mi obratro tri' + content);
			   })    
    
}