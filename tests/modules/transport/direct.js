var DEBUG = 1;
exports.test = function(capsule){
    var transport = capsule.modules.transport;
    console.log("transport module's testing is started...")
    //создаём транспорт, для каждого вида транспорта по своему

    var c = transport.direct.create({ "url" : "blah" }, transport.features.client, capsule);
    var s = transport.direct.create({ "url" : "blah" }, transport.features.server, capsule);

    var c1 = transport.direct.create({ "url" : "blahe" }, transport.features.client, capsule);
    var c2 = transport.direct.create({ "url" : "blahe" }, transport.features.client, capsule);
    var c3 = transport.direct.create({ "url" : "blahe" }, transport.features.client, capsule);
    var s1 = transport.direct.create({ "url" : "blahe" }, transport.features.server, capsule);    

    var return_summ = 0;
    var control_summ = 0;

    //a test of the single dealer and a recustion call
    c.connect();
    c.on_msg(function(body){
		   return_summ += JSON.parse(body).counter;
	       });
    for(var ind = 1; ind < 4; ind++){
	c.send(JSON.stringify({'haha' : 'ha', 'counter' : ind }));
    }

    s.on_connect(function(client){
		     client.on_msg(function(body){
				  client.send(body);
				   })
		 })

    c.connect();
    for(var ind = 1; ind < 11; ind++){
	control_summ += ind;
	c.send(JSON.stringify({'haha' : 'ha', 'counter' : ind }));
    }

    if(control_summ == return_summ){
	if(DEBUG)
	    console.log("DEBUG: control_summ[", control_summ, "], return_summ[", return_summ, ']');
	console.log("a test of the single dealer and a recustion call [PASSED]");
    }


    //a test of the multiple dealers and recustion calls
    control_summ = 0;
    return_summ = 0;
    s1.on_connect(function(client){
		      client.on_msg(function(body){
					client.send(body);
				    })
		 });

    c1.connect();
    c1.on_msg(function(body){
		  return_summ += JSON.parse(body).counter;
	       });

    for(var ind = 1; ind < 40; ind++){
	control_summ += ind;
	c1.send(JSON.stringify({'haha' : 'ha', 'counter' : ind }));
    }

    //deep callback trace
    c2.connect();
    c2.on_msg(function(body){
		  return_summ += JSON.parse(body).counter;
//		  c2.send(JSON.stringify({'haha' : 'ha', 'counter' : ind }));
	      })

    for(var ind = 1; ind < 20000; ind++){
	control_summ += ind;
	c2.send(JSON.stringify({'haha' : 'ha', 'counter' : ind }));
    }

    c3.connect();
    c3.on_msg(function(body){
		  return_summ += JSON.parse(body).counter;
	      });
    for(var ind = 1; ind < 200; ind++){
	control_summ += ind;
	c3.send(JSON.stringify({'haha' : 'ha', 'counter' : ind }));
    }
    
    
    if(control_summ == return_summ){
	if(DEBUG)
	    console.log("DEBUG: controlsumm[", control_summ, "], returnsumm[", return_summ, ']');
	console.log("a test of the multiple dealers and recustion calls [PASSED]");
    }


}
