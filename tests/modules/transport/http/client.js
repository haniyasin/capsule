/* Test for capsule module - transport.http with transport.features.client
 * 
 */
var DEBUG = 1;

exports.test = function(context, modules){
    var trans = modules.transport.http.create(context, modules.transport.features.client, modules);
    
    trans.on_msg(function(msg){
		     console.log(msg);
		 })
    
    trans.connect(function(){		     
		      for(var ind = 0; ind < 20; ind++){
			  trans.send('blah blah, tuk tuk lalala, hohoh, ya ya ya ga' + ind, function(msg){
					 console.log('hoi ', msg);
				     });			 
		      }
		  });
}

