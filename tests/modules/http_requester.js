exports.test = function(http_requester, timer){
    var context = { 'method' :'get', 
		    'url' : 'http://blah.com:8810/capsule/capsule.htm', 
		    'user' : 'vasya', 
		    'pass' : '123kochegar'};
    http_requester.send(context, 
			function(response){
			    console.log("response is", response);
			});   
    http_requester.send(context, 
			function(response){
			    console.log("response is", response);
			});   
    http_requester.send(context, 
			function(response){
			    console.log("response is", response);
			});   
/*    http_requester.send(context, 
			function(response){
//			    console.log("response is", response);
			});   
    http_requester.send(context, 
			function(response){
//			    console.log("response is", response);
			});   
    http_requester.send(context, 
			function(response){
//			    console.log("response is", response);
			});   
    http_requester.send(context, 
			function(response){
//			    console.log("response is", response);
			});   
    http_requester.send(context, 
			function(response){
//			    console.log("response is", response);
			});   
    http_requester.send(context, 
			function(response){
//			    console.log("response is", response);
			});   
    http_requester.send(context, 
			function(response){
//			    console.log("response is", response);
			});   

    var gg = 0;
    var tm = timer.js.create(function(){
				 if(gg++ == 10)
				     tm.destroy();
				 http_requester.send(context, 
						     function(response){
							 //			    console.log("response is", response);
						     });   
			     }, 200, true);
 */   
}