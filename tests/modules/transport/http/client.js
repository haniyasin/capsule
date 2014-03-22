/* Test for capsule module - transport.http with transport.features.client
 * 
 */
var DEBUG = 1;

exports.test = function(context, capsule){
    var trans = capsule.modules.transport.http.create(context, capsule.modules.transport.features.client, capsule);
  
    trans.connect(function(){		     
		      trans.on_msg(function(msg){
				       console.log(msg);
				   })
		      for(var ind = 0; ind < 35; ind++){
			  trans.send('blah blah, tuk tuk lalala, hohoh, ya ya ya ga' + ind);			 
		      }
		  });
}

