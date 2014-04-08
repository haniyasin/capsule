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
    var stor = capsule.modules.storage;
//    ll.append(id, 'vataing', function(){console.log('written');});
//    ll.read(id, 0, 3, function(err,data){console.log(data);});    
    ll.delete(id, function(){console.log('object is deleted');});

    console.log(JSON.stringify(stor));
    stor.update(id, {
		    "blini" : {
			"s_tvorogom" : {
			    "odin" : "vkusniy",
			    "dva" : "klassniy",
			    "chetire" : "uzhasen",
			    "nichego" : 0,
			    "eshechego" : 0
			},
			"yagodnie" : {
			    "s_chernikoy" : {
			    },
			    "s_malinoy" : {
				"tri" : "myagkiy",
				"DESatiy" : "sochniy",
				"vkusniye" : true
			    }
			}
		    },
		    "yagodi" : {
			"lesniye": {
			    "polyannie" : {
				"zelen" : 88,
				"lubyashie_svet" : {
				    "shipovnik" : "vkusnota"
				}
			    }
			}
		    }
		}, function(){
		    stor.update(id, { blini : { yagondie : "fufel" }}, 
				stor.extract(id, { blini : {} }, function(err, object){console.log(object);}, capsule), capsule
			       );
		}, capsule);
}
