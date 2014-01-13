var fs = require('fs');

var capsule = require('../platforms/nodejs/capsule.js');
var cb_synchronizer = require('../parts/cb_synchronizer.js');
var DEBUG = 1;

var modules = capsule.create();
with(modules){
    //parse arguments for testing
    var socket_type = process.argv[2];
    console.log('blah',socket_type);

    var ttimer = require('./timer.js');
    var tuuid = require('./uuid.js');
    var thsocket = socket_type == 'cli' ? require('./transport/http/socket_cli.js') : require('./transport/http/socket_srv.js');

//    ttimer.test(modules.timer);
    tuuid.test(modules.uuid.node);

    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, modules);

    if(socket_type == 'srv'){
	
	var exporter = require('../platforms/browser/exporter/exporter.js');
	var cb_sync = cb_synchronizer.create();
	exporter.create('platforms/browser/exporter/capsule.json', http_responder.node ,function(web_capsule){
			web_capsule.to_http('http://localhost:8810/');
			});
    }
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
}