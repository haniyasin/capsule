var capsule = require('./assembled/capsule_constructor.js').capsule.capsule;

//capsule.tests.transport.direct.test(capsule);
//capsule.tests.timer.test(capsule);

var seq = capsule.modules.sequence;
var fs = require('fs');

seq.sequence(['c', fs.readFile, 'todo.org'],
	     ['c', fs.writeFile, 'todo.org.copy', 'stack.last[1]'],
	     ['fn', function(context, stack){
		  //печатаем текст файла
		  console.log(stack.first[1].toString())
	      }]
	    );
