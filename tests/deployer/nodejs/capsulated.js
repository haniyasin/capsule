var capsule = require('./assembled/capsule_constructor.js').capsule.capsule;

//capsule.tests.modules.transport.direct.test(capsule);
//capsule.tests.modules.timer.test(capsule);

//parse arguments for testing
var cli_serv = process.argv[2];

var thsocket = cli_serv == 'cli' ? capsule.tests.modules.transport.http.socket_cli : capsule.tests.modules.transport.http.socket_srv;

thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule.modules);

var thttp = cli_serv == 'cli' ? capsule.tests.modules.transport.http.client : capsule.tests.modules.transport.http.server;

//thttp.test({ 'url' : 'http://localhost:8810/privetiki', 'method' : 'POST'}, capsule.modules);
