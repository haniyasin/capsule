/*
 * packing, upacking complex objects to,from arrays. Like a perl pack, unpack and serialization, deserialization 
 */

function pack(definition, object){
    var packed = '';
    for(key in definition){
	var nametype = definition[key].split(':');
	switch(nametype[1]){
	case 'Cstring' :
	    packed +=  object[nametype[0]] + '\0';
	    break;
	case 'uint8' :
	    packed += object[nametype[0]];
	    var counter = 3 - ('' + object[nametype[0]]).length;
	    while(counter--)
		packed += ' ';
	    break;
	}
    }

    return packed;
}

function unpack(definition, array){
    var object = {}, pointer = 0, field;
    for(key in definition){
	var nametype = definition[key].split(':');
	switch(nametype[1]){
	case 'Cstring' :
	    field = '';
	    while(array[pointer] != '\0')
		field += array[pointer++];
	    pointer++;
	    object[nametype[0]] = field;
	    break;
	case 'uint8' :
	    field = object[nametype[0]] = '';
	    field += array[pointer++];
	    field += array[pointer++];
	    field += array[pointer++];
	    object[nametype[0]] = parseInt(field);
	    break;
	}	
    }

    return object;
}

function binary(definition, object){
    this.packed = pack(definition, object);
}

binary.prototype = {
    serialize : function(){
	return this.packed;
    },
    deserialize : function(definition, array){
	return unpack(definition, array);	
    },
    from_binary : function(type_definition, array){
	//создать объект из массива по описанию
    }, 
    get : function(offset, type_definition){
	//получить структуру по смещению
    },
    get_next : function(type_definition){
	// получить следующую структуру	
    },
    set : function(offset, type_definition, object){
	//переписать структуру по смещению
    }, 
    append : function(type_definition, object){
	// добавить структуру
    } 
    
};

module.exports = binary;