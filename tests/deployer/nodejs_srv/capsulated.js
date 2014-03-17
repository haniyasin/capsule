exports.main = function(env){
    var capsule = env.capsule;    
    var thsocket = capsule.tests.modules.transport.http.socket_srv;
    
    //thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule.modules);
    
    var thttp = capsule.tests.modules.transport.http.server;
    
    thttp.test({ 'url' : 'http://localhost:8810/privetiki', 'method' : 'POST'}, capsule.modules);
}
