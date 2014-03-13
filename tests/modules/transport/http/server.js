/* Test for capsule module - transport.http with transport.features.router
 * 
 */

var fs = require('fs');

var capsule = require('../../../platforms/nodejs/capsule.js');
var DEBUG = 1;

var modules = capsule.create();
with(modules){
    var transport_http = require('../../../modules/transport/http.js');

    var trans = transport_http.create({ 'url' : "http://localhost:8810/socket.js"}, transport.features.server, modules);

    trans.on_connect(function(tr){
			 tr.on_msg(function(msg){
				       console.log('prishlo chtoto', msg);
				       tr.send('voz*mi ko obranto ' + msg);
				   })
			 tr.send('teg');
		 })
}