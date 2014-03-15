var DEBUG = 1;
exports.test = function(context, modules){
    console.log("transport.server testing is started...");

    var socket = modules.transport.http.socket_srv.create(context, modules);

    socket.on_connect(function(socket){
			  socket.on_recv(function(msg){
					     socket.send(msg);
					 });
			  for(ind = 50; ind < 100; ind++){
			      socket.send({"number" : ind});
			  }	
		      })    
    socket.listen();
}