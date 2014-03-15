var fs = require('fs');

exports.test = function(capsule){
var seq = capsule.modules.sequence;
    
seq.sequence(['c', fs.readFile, 'todo.org'],
	     ['c', fs.writeFile, 'todo.org.copy', 'stack.last[1]'],
	     ['fn', function(context, stack){
		  //печатаем текст файла
		  console.log(stack.first[1].toString())
	      }]
	    );
}
