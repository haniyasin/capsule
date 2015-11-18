exports.main = function(env){

    var ctest = require('tests/modules/ui/Compositer');
    ctest.test(); 
//    var ui =  new (require('modules/ui/Compositer'));
//    console.log(ui);
//    var frame = new ui.frame({ width : '80%', height : '80%'});
//    frame.add(new ui.image({ width : '100%', height : '100%',source : require('images/red')}));
//    ui.root.add(frame);

 //   var capsule = env.capsule;
//    capsule.tests.modules.transport.direct.test(capsule);
//    capsule.tests.modules.timer.test(capsule);
    
//    var thsocket = capsule.tests.modules.transport.http.socket_cli;
    
//    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule.modules);
//    var thttp = capsule.tests.modules.transport.http.client;
    
//    thttp.test({ 'url' : 'http://localhost:8810/krevetk/o', 'method' : 'POST'}, capsule);
//    capsule.tests.modules.storage.low_level.test();

};


