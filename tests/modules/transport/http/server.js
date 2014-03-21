/* Test for capsule module - transport.http with transport.features.server
 * 
 */

exports.test = function(context, capsule){
    var trans = capsule.modules.transport.http.create(context, capsule.modules.transport.features.server, capsule);

    trans.on_connect(function(tr){
			 tr.on_msg(function(msg){
				       console.log('prishlo chtoto', msg);
				       tr.send('voz*mi ko obranto ' + msg);
				   })
			 tr.send('teg');
		     })
}