exports.main = function(capsule){
setTimeout(function(){
	       //     _capsule.modules.transport.http.load();
	       //      _capsule.modules.transport.http.lib.load();
	       //      var socket = _capsule.modules.transport.http.lib.socket_cli.create({ 'url' : "http://localhost:8810/sockethh.js", 'method' : "POST" }, 'xhr', _capsule.modules);
	       //      socket.on_recv(function(msg){console.log("prishlo",msg)});
	       //     for(ind = 0; ind < 40; ind++){
	       //			 socket.send('blah blah, tuk tuk');
	       //			 }
	       _capsule.tests.load();
	       _capsule.tests.socket_cli.test({'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, _capsule.modules);
	       
	       //      console.log(window.uuid.v1());
	       //      console.log("uuid module is", JSON.stringify(__capsule.modules.transport.direct));
	       //      __capsule.tests.uuid.test(__capsule.modules.uuid);
	       //      _capsule.tests.timer.test(_capsule.modules.timer);
	       //      _capsule.tests.transport_direct.test(_capsule.modules.transport);
	   }, 3000);    
}


