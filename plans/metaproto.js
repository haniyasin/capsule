var g = imports.gi.GLib;

function str_find_char(string, character){
    for(var ind in string){
	if(string[ind] == character)
	    return ind;
    }
//    print(character);
    return -1;
}

function lex(text, delimeters){
    var index = 0;
    this.next = function(){
	var start = index;
	while(index != text.length){
	    if(str_find_char(delimeters, text[index]) != -1){
		if(index == start){
		    //delimeter
		    return [1, text.substring(start, ++index)];
		}else
		    return [0, text.substring(start, index)]; //word
		//print(start, index);
	    }
	    index++;
	}
	if(index != start)
	    return [0, text.substring(start, index)]; //word, end of file

	return null;
    };
}

function parser(){
    var chunk, status, context = {
	parent : null,
	children : [],
	next : null,
	word : 0
    },
    word_types = {
	label : {
	    regexp : /^\D\w*/
	},
	value : {
	    event : 'endblock'
	}	
    },
    ops = {
	var : {
	    next : [
		{
		    name : 'name',
		    type : 'label'
		}
	    ],
	    post_handler : function(context, name){
		if(!context.hasOwnProperty('vars'))
		    context.vars = {};
		context.vars[name] = {};
		context.cur_var = name;
	    }
	},
	'=': {
	    event : 'endblock',

	    pre_handler : function(context, new_context){
		if(context.hasOwnProperty('cur_var'))
		    new_context.place = context.vars[context.cur_var];
	    },

	    post_handler : function(context, name){
	    }
	}
    };

    /*
     * отвечает за обработку ключевых слов, операторов. Нет никакой разницы состоят ли эти операторы
     * из букв или спецсимволов 
     */
    function do_op(_op){
	var cur_op = ops[_op],
   	    new_context = { 
		op : cur_op
	    };
	print(_op);

	if(cur_op.hasOwnProperty('next') && cur_op.next.length){
	    new_context.args = [];
	    new_context.args_cur_num = 0;
	    new_context.args_num = cur_op.next.length;
	    
	    if(cur_op.hasOwnProperty('pre_handler'))
		cur_op.pre_handler(context, new_context);
	    context = context.next = new_context;
	}
	if(cur_op.hasOwnProperty('event')){
	    if(cur_op.event == 'endblock')
		context = context.next = new_context;
	}
    }
    
    this.do = function(){
	while((chunk =_lex.next()) != null){
	    if(ops.hasOwnProperty(chunk[1]))
		do_op(chunk[1]);
	    else if(!chunk[0]){
		if(context.op){
		    with(context){
			//operators with explicit arguments
			if(context.hasOwnProperty('args')){
			    if(args_cur_num == args_num){
				args.unshift(context);
				op.post_handler.apply(null, args);
				args = [];
				args_cur_num = 0;
			    }			    
			    var type = word_types[op.next[args_cur_num].type];
			    
			    if(type.hasOwnProperty('regexp'))
				if(type.regexp.exec(chunk[1]) != null){
				    args[args_cur_num++] = chunk[1];
				}else{
				    print('label is incorrect', chunk[1]);
				};
			}
			
			//найти переменную
			print(chunk[1]);
			if(op.hasOwnProperty('event')){
			    switch(op.event){
			    case 'endblock':
//				print('гграааапа');
			    }
			}
		    }		
		}
	    }
	}
	return status;
    };
}

var content = g.file_get_contents('metaproto/example.js');

var _lex = new lex(content[1].toString(), '\n; ,\t:+-)(*&^%$#@!~`\'\"<>./=');
var _parser = new parser();
_parser.do();
