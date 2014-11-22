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
	return null;
    };
}

var content = g.file_get_contents('metaproto/example.js');

var _lex = new lex(content[1].toString(), '\n; ,\t:+-)(*&^%$#@!~`\'\"<>./');

var chunk;
while((chunk = _lex.next()) != null){
    if(!chunk[0])
	print('It is word:' + chunk[1]);
    else
	print('It is delimeter:' + chunk[1]);
}
