var capsule = require('./assembled/capsule_constructor.js').capsule.capsule;

//capsule.tests.transport.direct.test(capsule);
//capsule.tests.timer.test(capsule);

//parse arguments for testing
var socket_type = process.argv[2];

var thsocket = socket_type == 'cli' ? capsule.tests.modules.transport.http.socket_cli : capsule.tests.modules.transport.http.socket_srv;

thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule.modules);

//    test_transport(transport);

//    var socket_srv = require('../modules/transport/http/socket_srv.js');
//    var socket = socket_srv.create({ 'url' : 'http://localhost:8810/socket.js'}, modules);
//    socket.listen();
//    var ind = 0;
//    socket.on_connect(function(socket){
//			socket.on_recv(function(msg){
//					       socket.send('vozmi obratno ' + msg);
//			});
//		   });    
