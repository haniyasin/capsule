var DEBUG = 1;
exports.test = function(context, modules){
    console.log("transport.server testing is started...");

    var socket = modules.transport.http.socket_srv.create(context, modules);

    socket.on_connect(function(csocket){
			  csocket.on_recv(function(msg){
					     csocket.send(msg);
					      console.log(msg);						 
					 });
			  for(ind = 50; ind < 100; ind++){
			      csocket.send({"number" : ind});
			  }	
		      })    
    socket.listen();
    modules.timer.js.create(function(){socket.close()},
			   30000, false);
}