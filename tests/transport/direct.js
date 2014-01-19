var DEBUG = 1;
exports.test = function(transport){
    console.log("transport module's testing is started...")
    //создаём транспорт, для каждого вида транспорта по своему

    var d = transport.direct.create('blah', transport.features.dealer);
    var r = transport.direct.create('blah', transport.features.router);

    var d1 = transport.direct.create('blahe', transport.features.dealer);
    var d2 = transport.direct.create('blahe', transport.features.dealer);
    var d3 = transport.direct.create('blahe', transport.features.dealer);
    var r1 = transport.direct.create('blahe', transport.features.router);    

    var returnsumm = 0;
    var controlsumm = 0;

    //a test of the single dealer and a recustion call
    for(var ind = 1; ind < 4; ind++){
	d.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
		   returnsumm += JSON.parse(body).counter;
	       });
    }

    r.on_msg(0, function(id, body){
		 r.send(id, body);
	     })

    for(var ind = 1; ind < 11; ind++){
	controlsumm += ind;
	d.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
		   returnsumm += JSON.parse(body).counter;
	       });
    }

    if(controlsumm == returnsumm){
	if(DEBUG)
	    console.log("DEBUG: controlsumm[", controlsumm, "], returnsumm[", returnsumm, ']');
	console.log("a test of the single dealer and a recustion call [PASSED]");
    }

    //a test of the multiple dealers and recustion calls
    controlsumm = 0;
    returnsumm = 0;
    r1.on_msg(0, function(id, body){
		 r1.send(id, body);
	     })

    for(var ind = 1; ind < 40; ind++){
	controlsumm += ind;
	d1.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
		   returnsumm += JSON.parse(body).counter;
	       });
    }

    //deep callback trace
    for(var ind = 1; ind < 20000; ind++){
	controlsumm += ind;
	d2.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
		    d2.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
				d2.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
					    d2.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
							returnsumm += JSON.parse(body).counter;
						    });
					});
	            });
	       });
    }
    for(var ind = 1; ind < 200; ind++){
	controlsumm += ind;
	d3.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
		   returnsumm += JSON.parse(body).counter;
	       });
    }

    
    if(controlsumm == returnsumm){
	if(DEBUG)
	    console.log("DEBUG: controlsumm[", controlsumm, "], returnsumm[", returnsumm, ']');
	console.log("a test of the multiple dealers and recustion calls [PASSED]");
    }


}
