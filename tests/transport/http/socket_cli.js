var DEBUG = 1;
var m200 = 'test with 100 messages and 100 messages with reply is ';
//function deb(){
//    console.log(arguments.shift(), '(', Array.prototype.join.call(arguments), ')';
//}
exports.test = function(context, modules){
    console.log("transport.client testing is started...");
    var socket_cli = require('../../../modules/transport/http/socket_cli.js');
    var socket = socket_cli.create(context, 'xhr', modules);
    
    var summ = 0;
    var recv_counter = 0;
    socket.on_recv(function(msg){
		       summ += msg.number;
		       recv_counter++;
		       if(recv_counter  == 190 && summ == 9045)
			   console.log(m200 + '(' + recv_counter + ',' + summ + ')[PASSED]');
		   })
    
    for(ind = 0; ind != 100; ind++){
	socket.send({'number' : ind});
    }
}