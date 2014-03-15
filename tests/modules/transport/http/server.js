/* Test for capsule module - transport.http with transport.features.server
 * 
 */

exports.test = function(context, modules){
    var trans = modules.transport.http.create(context, modules.transport.features.server, modules);

    trans.on_connect(function(tr){
			 tr.on_msg(function(msg){
				       console.log('prishlo chtoto', msg);
				       tr.send('voz*mi ko obranto ' + msg);
				   })
			 tr.send('teg');
		 })
}