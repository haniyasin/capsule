var DEBUG = 1;
var m200 = 'test with 100 messages and 100 messages with reply is ';
//function deb(){
//    console.log(arguments.shift(), '(', Array.prototype.join.call(arguments), ')';
//}
exports.test = function(context, modules){
    console.log("transport.client testing is started...");
    var socket = modules.transport.http.socket_cli.create(context, 'script', modules);
    
    var msg_summ = 0;
    var max_msg_summ;
    var recv_counter = 0;
    
    while(recv_counter < 100){
	msg_summ += recv_counter++;
    }

    console.log("max msg_summ is: ", max_msg_summ = msg_summ);
    msg_summ = 0;
    recv_counter = 0;
    
    var end_sending = false;
    socket.on_disconnect(function(e){
			     console.log('connection is failed');
			     end_sending = true;
			 })
    
    socket.connect(function(){
		       socket.on_recv(function(msg){
					  if(recv_counter > 90)
					      console.log(msg.number, recv_counter);
					  msg_summ += msg.number;
					  recv_counter++;
					  if(recv_counter  == 100 &&
					     msg_summ ==  max_msg_summ){
					      console.log(m200 + '(' + recv_counter + ',' + msg_summ + ')[PASSED]');
					      socket.disconnect();			   
					  }
				      })

		       console.log('connection is established');
		       for(ind = 0; ind != 50; ind++){
			   if(end_sending)
			       break;
			   socket.send({"number" : ind});
		       }
		   })
}