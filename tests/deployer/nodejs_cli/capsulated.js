exports.main = function(env){
    var capsule = env.capsule;
    var mtests = capsule.tests.modules;
//    capsule.tests.modules.transport.direct.test(capsule);
//    capsule.tests.modules.timer.test(capsule);
//    mtests.http_requester.test(capsule);
    var thsocket = capsule.tests.modules.transport.http.socket_cli;
//    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule.modules);

    var thttp = capsule.tests.modules.transport.http.client;

    thttp.test({ 'url' : 'http://localhost:8810/krevetk/o', 'method' : 'POST'}, capsule);    

}
