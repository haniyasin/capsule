/* Test for capsule module - transport.http with transport.features.router
 * 
 */

var fs = require('fs');

var capsule = require('../capsule.js');
var DEBUG = 1;

var modules = capsule.create();
with(modules){
    var transport_http = require('../modules/transport/http.js');

   var trans = transport_http.create({ 'url' : "http://localhost:8810/socket.js"}, transport.features.router, modules);

    trans.on_msg(0, function(msg_id, msg){
		     
		 })
}