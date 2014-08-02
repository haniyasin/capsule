exports.main = function(env){
    var capsule = env.capsule;    
    var mtests = capsule.tests.modules;
    var thsocket = capsule.tests.modules.transport.http.socket_srv;
    
//    mtests.http_responder.test(capsule);
//    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js'}, capsule);
    
      var thttp = capsule.tests.modules.transport.http.server;
    
    thttp.test({ 'url' : 'http://localhost:8810/krevetk/o'}, capsule);
}
