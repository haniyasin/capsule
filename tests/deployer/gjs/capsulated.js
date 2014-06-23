exports.main = function(env){
    var capsule = env.capsule;
//    capsule.tests.modules.transport.direct.test(capsule);
//    capsule.tests.modules.timer.test(capsule);
    
//    console.log(JSON.stringify(capsule.modules.transport.http));
    var thsocket = capsule.tests.modules.transport.http.socket_cli;
    
//    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule.modules);

//    capsule.tests.modules.ui.Compositer.test(capsule);

    var mplayer = capsule.parts.connectors.pipe.create(['mplayer', '-slave', 'http://docs.gstreamer.com/media/sintel_trailer-480p.webm'], null);
    
    mplayer.on_out(function(content){print(content)});
    mplayer.spawn();
    let GLib = imports.gi.GLib;
    mplayer.in('pause\n');
    mplayer.in('pausing\n');
    mplayer.in('pausing\n');
    GLib.timeout_add(1, 8000,function(){
			 mplayer.in('pause\n');
			 print('haha');
		     });
//    mplayer.destroy();
//    var thttp = capsule.tests.modules.transport.http.client;
    
//    thttp.test({ 'url' : 'http://localhost:8810/krevetk/o', 'method' : 'POST'}, capsule);

}


