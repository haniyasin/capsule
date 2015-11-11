function type_record_test(){
    var rtype = require('types/record');
    var g = new rtype();
    g.data.t = 10;
    g.data.haha = 'uhaha';
    g.update();
    g.data.lala = 'hav';
    g.update();
    //    alert(JSON.stringify(g));	
}

exports.main = function(env){
    
//    capsule.tests.modules.transport.direct.test(capsule);
//    capsule.tests.modules.timer.test(capsule);
    
//    console.log(JSON.stringify(capsule.modules.transport.http));
//    var thsocket = capsule.tests.modules.transport.http.socket_cli;
    
//    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule);
    
//    var thttp = capsule.tests.modules.transport.http.client;
    
//    thttp.test({ 'url' : 'http://localhost:8810/krevetk/o', 'method' : 'POST'}, capsule);

    var tcompositer = require('tests/modules/ui/Compositer');
    tcompositer.test();

//    var fs = require('modules/fs');
//    alert(fs.readFileSync('./'));    

    return;

    var packer = require('types/packer'),
    definition = [
	'name:Cstring',
	'time:Cstring',
	'osen:uint8',
	'god:uint8'
    ],
    _pack = new packer(definition,
		       {
			   name : 'vahaha',
			   time : 'vsegda',
			   osen : 25,
			   god : 15
		       });
    var ser = _pack.serialize();
    alert(ser);
    alert(JSON.stringify(_pack.deserialize(definition, ser)));
};


