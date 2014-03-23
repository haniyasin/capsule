exports.main = function(env){
    var capsule = env.capsule;
//    capsule.tests.modules.transport.direct.test(capsule);
//    capsule.tests.modules.timer.test(capsule);
//    var thsocket = capsule.tests.modules.transport.http.socket_cli;
//    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule.modules);

//    var thttp = capsule.tests.modules.transport.http.client;

//    thttp.test({ 'url' : 'http://localhost:8810/krevetk/o', 'method' : 'POST'}, capsule);    

    var modules = capsule.modules;
    var id = 'stor.data';
    var ll = capsule.modules.storage.low_level;
    
    ll.stat(id, function(err, stat){console.log(stat);});
    ll.append(id, 'vataing', function(){console.log('written');});
    ll.read(id, function(err,data){console.log(data.toString());});    
    ll.delete(id, function(){console.log('object is deleted');});

    console.log('eeee');
}
