/*
 * storage module am using low-level modules as backends
 * 
 * API is async
 */

/*
 * getting stat info about object by id
 */

exports.stat = function(id, cb, capsule){
    capsule.modules.storage.low_level.stat(id, 
					   function(err, stat){
					       //как-то обрабатываем stat, пытаемся отобразить информацию о
					       //записях
					       return stat;
					   });    
}
/*
 * deleting object by id 
 */

exports.delete = function(id, cb, capsule){
    capsule.modules.storage.low_level.delete(id, cb);    
}

function compile_update_tree(tree, cur_offset){
    var head = '',
    data = '';
    for(key in tree){
	if(typeof(tree[key]) == 'object'){
	    head += 's' + key + "|"; //start new block
	    var result = compile_update_tree(tree[key], cur_offset);
	    head += result.head;
            data += result.data;
	    head += "e|"; //end block
	} else {
	    var obj = tree[key];
	    switch(typeof(tree[key])){
		case 'number' :
		obj = 'n' + obj;
		break;
		case 'string' : 
		obj = 's' + obj;
		break;
		case 'boolean' : 
		obj = 'b' + obj;
		break;
	    }
	    data += obj;
	    cur_offset += obj.length;
	    head += 'o' + key + '!' + cur_offset + '!' + obj.length + '|';
	}
    }
    return {
	"head" : head,
	"data" : data
    }
}

function make_update_block(update_tree){
    var compiled = compile_update_tree(update_tree, 0);
    return compiled.head.length + '|' +
	compiled.data.length + '|' +
	compiled.head + 
	compiled.data;
}

/*
 * updating content of object with update_tree
 */

exports.update = function(id, update_tree, cb, capsule){
    capsule.modules.storage.low_level.append(id, make_update_block(update_tree), cb);
}

function create_tree(content){
    var object_start_re = /^s(\w+)\|/g;
    var object_end_re = /^(e)\|/g;
    var element_re = /^(\w)(\w+)\!(\d+)\!(\d+)\|/g;
    var object = {},
    current = object;
    var re_result;
    var cur_item_length;
    while(true){
	if(re_result = object_start_re.exec(content)){
	    cur_item_length = object_start_re.lastIndex;
	    object_start_re.lastIndex = 0;

	    var next = {_p : current};
	    current[re_result[1]] = next;
	    current = current[re_result[1]];
	}else if(re_result = object_end_re.exec(content)){
	    cur_item_length = 2;
	    object_end_re.lastIndex = 0;
	    
	    var next = current;
	    current = current._p;
	    delete next._p;
	}else if(re_result = element_re.exec(content)){
	    cur_item_length = element_re.lastIndex;
	    element_re.lastIndex = 0;

	    current[re_result[1]] = 'figa';
	} else break;
	content = content.substring(cur_item_length);
//	console.log(content + '\n\n');
    }
    
    delete object._p;

    return object;
}

function parse_block(id, mask_tree, cb, read){
    var offset = 0;
    read(id, offset, 20, function(err, content){
	     var offsets = /^(\d+)\|(\d+)\|/.exec(content);
	     var head_len = parseInt(offsets[1]);
	     var data_len = parseInt(offsets[2]);
	     offset += offsets[1].length + offsets[2].length + 2;
	     read(id, offset, head_len, function(err, content){
		      console.log(JSON.stringify(create_tree(content)));
		  })
	     offset += head_len;
	     console.log(data_len);
	     console.log(offset);
	     read(id, offset, data_len, function(err, content){
		      console.log(content);
		  })
//	     console.log(offsets, content);
	 })
}

/*
 * extracting content from object by mask_tree
 */

exports.extract = function(id, mask_tree, cb, capsule){
    parse_block(id, mask_tree, cb, capsule.modules.storage.low_level.read);
}