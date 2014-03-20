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
    var func = elem[0];
    elem.splice(0,1);

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
    var func = elem.shift();

//    console.log(stack);
    func(null, stack);

    element_execute(args, stack);
}

function do_s(elem, stack, args){
//    console.log("service elem is: " + elem);
    var service = elem. shift();
//    var method = elem.shift();    
    elem.unshift({"stack" : stack,
		 "args" : args});

    exports.mq_send(service, elem);
}

function do_ff(elem, stack, args){
 //   console.log("far function elem is: " + elem);
    var func = elem.shift();
    var return_value = null;
    func(function(){ return_value = arguments},
	stack,
	null); // need sequence push implementation    
    
    stack.push(return_value);
    element_execute(args, stack);
}

function element_execute(args, stack){
    if(!args.length)
	return;	
    var elem = Array.prototype.shift.call(args);
//    console.log("elem is: ", elem);
    var type = elem.shift();

    switch(type){
	// function with callback on last argument
    case 'c' : 
	do_c(elem, stack, args);
	break;
	
	//adapter
    case 'a':
	break;

	//message to service
    case 's' : 
	do_s(elem, stack, args);
	break;

	//function near. function within same context what and sequence runner
    case 'fn' : 
	do_fn(elem, stack, args);
	break;
	
	//function far. function which is executed in same place as element before
    case 'ff' : 
	do_ff(elem, stack, args);
    break;

	//parallel versions of elements
    case 'pc' : 
	break;

    case 'pa' : 
	break;

    case 'ps' : 
	break;

    case 'pfn' : 
	break;

    case 'pff' : 
	break;
   }    
}

exports.mq_send = function(){};

exports.sequence = function(){
    var stack = [];
    stack["last"] = null;
    stack["first"] = null;
    
    element_execute(arguments, stack);
//    console.log(stack);
}

exports.sequence_continue = function(args, stack){
    element_execute(args, stack);
}