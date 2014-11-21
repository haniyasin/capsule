exports.main = function(env){
    var capsule = env.capsule;
//    capsule.tests.modules.transport.direct.test(capsule);
//    capsule.tests.modules.timer.test(capsule);
    
//    console.log(JSON.stringify(capsule.modules.transport.http));
    var thsocket = capsule.tests.modules.transport.http.socket_cli;
    
//    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule);
    
    var thttp = capsule.tests.modules.transport.http.client;
    
//    thttp.test({ 'url' : 'http://localhost:8810/krevetk/o', 'method' : 'POST'}, capsule);

//    with(capsule.modules.ui){
//	var comp = new Compositer.Compositer();
//	var map = new map({
//			      width : '80%',
//			      height : '80%',
//			      x : '10%',
//			      y : '10%'
//			  });
//	comp.frame_add(0, map.id());
//  }

    capsule.tests.modules.ui.Compositer.test();
};


