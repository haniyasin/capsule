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
	next : null,
	word : 0
    },
    word_types = {
	label : {
	    regexp : /^\D\w*/
	}	
    },
    words = {
	var : {
	    next : [
		{
		    name : 'name',
		    type : 'label'
		}
	    ],
	    handler : function(context, name){
		if(!context.hasOwnProperty('vars'))
		    context.vars = {};
		context.vars[name] = {};
		context.cur_var = name;
	    }
	}
    };

    function do_word(_word){
	if(words.hasOwnProperty(_word)){
	    var cur_word = words[_word];
	    if(cur_word.next.length){
		context = context.next = { prev : context,
					   args : [],
					   args_cur_num : 0,
					   args_num : cur_word.next.length,
					   word : cur_word
					 };
	    }
	}else{
	    if(context.word){
		with(context){
//		    print(JSON.stringify(context));
			  if(args_cur_num != args_num){
			      var type = word_types[word.next[args_cur_num].type];
			      if(type.hasOwnProperty('regexp'))
				  if(type.regexp.exec(_word) != null){
				      args[args_cur_num++] = _word;
				  }else{
				      print('label is incorrect', _word);
				  };
			  }else{
			      args.unshift(context);
			      word.handler.apply(null, args);
			      args = [];
			      args_cur_num = 0;
			  }		    
		}		
	    }
	}
	print('It is word:' + _word);			
    }
    this.do = function(){
	while((chunk =_lex.next()) != null){
	    if(!chunk[0]){
		do_word(chunk[1]);
	    }
	    else
		print('It is delimeter:' + chunk[1]);
	}
	return status;
    };
    this.next = function(chunk){
    };
}

var content = g.file_get_contents('metaproto/example.js');

var _lex = new lex(content[1].toString(), '\n; ,\t:+-)(*&^%$#@!~`\'\"<>./');
var _parser = new parser();
_parser.do();
