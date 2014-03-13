var fs = require('fs');

function do_args(args, stack){
    for(ind in args){
	if(typeof(args[ind]) == 'string'){
	    var result;
	    if(result = /stack[.]*\[*(\w+)\]*\[*(\d*)\]*/.exec(args[ind])){
		if(result.length == 2)
		    args[ind] = stack[result[1]];
		else if(result.length == 3)
		args[ind] = stack[result[1]][result[2]];
	    }
	}
    }
}
function do_c(elem, stack, args){
    var func = elem[1];
    elem.splice(0,2);

    do_args(elem, stack);

    elem[elem.length] = function(){
	if(!stack.first)
	    stack.first = arguments;
	stack.push(stack.last = arguments);
	element_execute(args, stack);	
    }
    func.apply(null,elem);
}

function do_fn(elem, stack, args){
    var func = elem[1];

//    console.log(stack);
    func(null, stack);
    element_execute(args, stack);
}

function element_execute(args, stack){
    if(!args.length)
	return;	
    var elem = Array.prototype.shift.call(args);

    switch(elem[0]){
	// function with callback on last argument
    case 'c' : 
	do_c(elem, stack, args);
	break;
	//function near. function within same context what and sequence runner
    case 'fn' : 
	do_fn(elem, stack, args);
	break;
    }    
}

exports.sequence = function(){
    var stack = [];
    stack["last"] = null;
    stack["first"] = null;
    
    element_execute(arguments, stack);
//    console.log(stack);
}