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

//    var tcompositer = require('tests/modules/ui/Compositer');
//    tcompositer.test();

//    var fs = require('modules/fs');
//    alert(fs.readFileSync('./'));    
    alert('ddd');
    return;

    var comp = new (require('modules/ui/Compositer')).Compositer();
    var image = require('types/image');
    var iimage = new image('png', 'base64', "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY3growIAAycBLhVrvukAAAAASUVORK5CYII=");

    var cimage = comp.image_create({
				       x : '25%',
				       y : '25%',
				       width : '20%',
				       height : '20%',
				       source : iimage
				   });
    comp.frame_add(0, cimage);
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

