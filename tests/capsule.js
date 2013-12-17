/* Test for capsule common properties
 * 
 */

var fs = require('fs');

var capsule = require('../capsule.js');
var cb_synchronizer = require('../dependencies/cb_synchronizer.js');
var DEBUG = 1;

var modules = capsule.create();
with(modules){
//    test_uuid(uuid);
//    test_timer(timer);
//    test_transport(transport);
//    var hr = require('./http_respondent.js');
//    hr.test(http_respondent);

    var socket_srv = require('../modules/transport/http/socket_srv.js');
    var socket = socket_srv.create({ 'url' : 'http://localhost:8810/socket.js'}, modules);
    socket.listen();
    socket.on_recv(0, function(cli_id, msg){
		       socket.send(cli_id, 'vozmi obratno ' + msg);
		   });    

    var exporter = require('../browser/exporter/exporter.js');
    var cb_sync = cb_synchronizer.create();
    exporter.create('browser/exporter/capsule.json', http_respondent.node ,function(web_capsule){
			web_capsule.to_http('http://localhost:8810/capsule/');
		    });


/*
    var cb_sync = require('../dependencies/cb_synchronizer.js').create();
    var one = cb_sync.add(function(gg,nn){console.log(gg,nn)}, 3);
    var two = cb_sync.add(function(tt,hh){console.log(hh,tt)});
    cb_sync.after_all = function(){console.log("this is success")};
    one('one', 'onon');
    timer.js.create(function(){    two('two', 'toto') }, 1000, false);
    one('one', 'onon');
    one('one', 'onon');
*/
}