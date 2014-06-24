exports.main = function(env){
    var capsule = env.capsule;
//    capsule.tests.modules.transport.direct.test(capsule);
//    capsule.tests.modules.timer.test(capsule);
    
//    console.log(JSON.stringify(capsule.modules.transport.http));
    var thsocket = capsule.tests.modules.transport.http.socket_cli;
    
//    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule.modules);

//    capsule.tests.modules.ui.Compositer.test(capsule);
    

    var comp = capsule.modules.ui.Compositer.create();
//    var comp1 = capsule.modules.ui.Compositer.create();

    var video = capsule.modules.ui.video.mplayer.create({
							    width : '50%',
							    height : '50%',
							    x : '25%',
							    y : '25%'
							}, capsule);	
    video.control.play();

    var frame = comp.frame_create({
				      width : '80%',
				      height : '80%',
				      x : '10%',
				      y : '10%'
				  });
    comp.frame_add(0, frame);
    comp.frame_add(frame, video.handle);
//    var thttp = capsule.tests.modules.transport.http.client;
    
//    thttp.test({ 'url' : 'http://localhost:8810/krevetk/o', 'method' : 'POST'}, capsule);

}


