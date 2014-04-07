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

exports.update = function(id, update_tree, callback, capsule){
    capsule.modules.storage.low_level.append(id, make_update_block(update_tree), callback);
}

function modify_tree(tree, mask_tree, content){
    var object_start_re = /^s(\w+)\|/g;
    var object_end_re = /^(e)\|/g;
    var element_re = /^o(\w+)\!(\d+)\!(\d+)\|/g; //type, name, offset, length
    var re_result,
    cur_item_length,
    current = tree,
    map_to_read = [];

    while(true){
	if(re_result = object_start_re.exec(content)){
	    cur_item_length = object_start_re.lastIndex;
	    object_start_re.lastIndex = 0;

	    var next = {_p : current};
//	    if(mask_tree.hasOwnProperty(re_result[1])){
		current[re_result[1]] = next;
		current = current[re_result[1]];		
//	    }
	}else if(re_result = object_end_re.exec(content)){
	    cur_item_length = 2;
	    object_end_re.lastIndex = 0;
	    
	    var next = current;
	    current = current._p;
	    delete next._p;
	}else if(re_result = element_re.exec(content)){
	    cur_item_length = element_re.lastIndex;
	    element_re.lastIndex = 0;
	    //parent object, field, offset in data section, length
	    map_to_read.push([current, re_result[1], parseInt(re_result[2]) + 1, parseInt(re_result[3])]);
	    current[re_result[1]] = undefined;
	} else break;
	content = content.substring(cur_item_length);
//	console.log(content + '\n\n');
    }
    
    return map_to_read;
}

function data_reader(tree, id, callback, read){
    var blocks_counter = 0,
    work_done = false;
    
    this.sealed = false;

    this.block_add = function(map_to_read, offset){
	blocks_counter += map_to_read.length;
//	console.log(map_to_read);
	for(key in map_to_read){
	    (function(offset, length, parent_object, field){
		 console.log('gaa', offset, length);
		 read(id, offset, length, function(err, content){
			  if(err)
			      callback(err);				  
			  else
			      parent_object[field] = content;
			  
			  console.log(tree);
			  if(this.sealed && !--blocks_counter)
			      callback(undefined, tree);
		      });
		 
	     })(offset + map_to_read[key][2], map_to_read[key][3], map_to_read[key][0], map_to_read[key][1]);
	}
    };
}

function parse_block(id, mask_tree, callback, read){
    var tree = {},
    offset = 0,
    _data_reader = new data_reader(tree, id, callback, read);  

    function next_block_parse(){
	read(id, offset, 20, function(err, content){
		 if(err){
		     if(err.msg == 'readed few'){
			 data_reader.sealed = true;
			 return; //object readed to end
		     }
		     else
			 callback(err); //something is happend in low_level
		 }

		 var offsets = /^(\d+)\|(\d+)\|/.exec(content);
		 var head_len = parseInt(offsets[1]);
		 var data_len = parseInt(offsets[2]);

		 offset += offsets[1].length + offsets[2].length + 2;
		 (function(offset, head_len){		      
 		 read(id, offset, head_len, function(err, content){
			  if(err)
			      callback(err);
			  _data_reader.block_add(
			      modify_tree(tree, mask_tree, content), 
			      offset + head_len);
		      });
		  })(offset, head_len);
		 offset += head_len + data_len;
		 next_block_parse();
	     });
    }
    
    next_block_parse();

}

/*
 * extracting content from object by mask_tree
 */

exports.extract = function(id, mask_tree, callback, capsule){
    parse_block(id, mask_tree, callback, capsule.modules.storage.low_level.read);
}