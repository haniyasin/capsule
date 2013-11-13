/* Test for capsule common properties
 * 
 */

var fs = require('fs');

var capsule = require('../capsule.js');
var DEBUG = 1;


with(capsule.create()){
//    test_uuid(uuid);
//    test_timer(timer);
//    test_transport(transport);
//    var hr = require('./http_respondent.js');
//    hr.test(http_respondent);

    var exporter = require('../browser/exporter/exporter.js');
    exporter.to_http(http_respondent.node, 'http://blah.com:8810/capsule/');
    var socket_srv = require('../modules/transport/http/socket_srv.js');
    var socket = socket_srv.create(http_respondent.node, { 'url' : 'http://localhost:8090/server'});
    socket.on_recv(0, function(cli_id, msg){
		       console.log("cli is", cli_id, "msg is", msg);
		   });    
}

//MQ
/*
    tdr.on_msg(12,function(id, body){
		   console.log(id, body); 
		   tdr.send(12, "hai");
				    });
    tdd.send(12, "figa");
    tdd.send(12, "miga", function(id, body){console.log(body, id)});
    tdd.send(12, "giga");

    var mq1 = new mq(nc,['direct', 'ch1']);
    var mq2 = new mq(nc,['direct', 'ch2']);
    var mq3 = new mq(nc,['direct', 'ch3']);
    
    mq1.peer_add(['direct', 'ch3']);
    mq2.peer_add(['direct', 'ch1']);


*/
