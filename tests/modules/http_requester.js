/*
 * Test of http_requester module from any supported platforms
 */

exports.test = function(capsule){
    console.log("starting modules/http_requester test...");

    var http_requester = capsule.modules.http_requester;

    var context1 = { 'method' :'get', 
		    'url' : 'http://127.0.0.1:8810/hai' 
		   };
    var context2 = { 'method' :'get', 
		    'url' : 'http://localhost:8812/jo/ti' 
		   };
    var context3 = { 'method' :'post', 
		    'url' : 'http://localhost:9910/blah/go' 
		   };

    var data = 'werwerhjhsfishfjsdfhisfjhsdifj';
    data += data += data += data += data += data += data += data;
	
    var req_counter = 0;
    function on_response(response){
	req_counter++;
	if(req_counter == 1200)
	    console.log('The test with sending 1200 simple requests on different addresses with and without creating req object is: [PASSED]');
//	console.log(response);
    };
    function on_close(){
//	console.log('request is closed');
    }
    function on_error(err){
	console.log('error: ' + err.msg);
    }   
  
  for(ind = 0; ind != 200; ind++){
	http_requester.send(context1,
			    data,
			    on_response,
			    on_close,
			    on_error);

	http_requester.send(context2, 
			    data,
			    on_response,
			    on_close,
			    on_error);

	http_requester.send(context3, 
			    data,
			    on_response,
			    on_close,
			    on_error);
    }

    for(ind = 0; ind != 600; ind++){
	var req = http_requester.create();
	req.on_recv(on_response);
	req.on_close(on_close);
	req.on_error(on_error);
	
	req.open(context3);
	req.send(data);
    }
}