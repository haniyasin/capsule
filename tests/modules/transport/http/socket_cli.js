var DEBUG = 1;
var m200 = 'test with 100 messages and 100 messages with reply is ';
//function deb(){
//    console.log(arguments.shift(), '(', Array.prototype.join.call(arguments), ')';
//}
exports.test = function(context, modules){
    console.log("transport.client testing is started...");
    var socket = modules.transport.http.socket_cli.create(context, 'script', modules);
    
    var msg_summ = 0;
    var recv_counter = 0;

    socket.on_recv(function(msg){
		       console.log(msg_summ, recv_counter);
		       msg_summ += msg.number;
		       recv_counter++;
		       if(recv_counter  == 191 && msg_summ == 9045)
			   console.log(m200 + '(' + recv_counter + ',' + msg_summ + ')[PASSED]');
		   })
    
    socket.connect(function(){
		       console.log('tthh');
		       for(ind = 0; ind != 100; ind++){
			   socket.send({"number" : ind});
		       }
		   })
}