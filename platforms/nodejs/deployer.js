var fs = require('fs');

var types = {"envelop" : 1,
	     "module" : 2,
	     "script" : 3
	    };

function nodejs_assembler(dir){
    var s = {
	flags : { 'preload' : false
		},
	type : types.envelope,
    }
    
    var block = '',
    block_load  = '',
    files_to_copy = '';

    var childs = [];
    

    this.set_flag = function(name, value){
	s.flags[name] = value;
    }
    
    this.set_type = function(name){
	if(name == 'module')
	    s.type = types.module;			
    }
    
    this.push_state = function(state){
	for(key in state){
	    s[key] = state[key]
	}
    }

    this.pop_state = function(){
	return s;
    }

    this.create_child = function(name){
	var assembler = new nodejs_assembler(dir);
	childs.push([name, assembler]);
	return assembler;
    }

    this.find_child = function(name){
	for(child in childs){
	    if(childs[child][0] == name)
		return childs[child][1];
	}
	return null;
    }

    this.generate = function(){
	var generated = {
	    constructor : '',
	    files_to_copy : ''
	}

	for(child_ind in childs){
	    var child = childs[child_ind];
	    var child_generated = child[1].generate();
	    
            block += 'current.' + child[0] + ' = ' + child_generated.constructor;
	    generated.files_to_copy += child_generated.files_to_copy;
 	}

	generated.constructor += "(function(current){" + block;

	if(s.flags.preload == false){
	    generated.constructor += 'current.load=' + '(function(current){ return function(){' + block_load  + '}})(current);';			         
	}else
	    generated.constructor += block_load;
	generated.constructor += 'return current;})({});\n'; //тут надо вписать имя родителя	

	generated.files_to_copy += files_to_copy;

	return generated;
    }

    this.do_file = function(module_name, file_path){
	block_load += 'current';
	if(module_name != 'this')
	    block_load += '.' + module_name;

	block_load += ' = ' + "require('" + file_path + "');\n";	    

	files_to_copy += file_path + ',' + dir + '/assembled/' + file_path + "\n";
    }
}    


function tree_walker(tree, assembler){
    for(var key in tree){
	if(typeof(tree[key]) == 'boolean')
	    assembler.set_flag(key,tree[key]);

	if(typeof(tree[key]) == 'string'){
	    if(key == 'type')
		assembler.set_type(tree[key]);
	    else 
		assembler.do_file(key, tree[key]);
	}
	else if(typeof(tree[key]) == 'object'){
	    var child_assembler = assembler.find_child(key);
	    if(!child_assembler){
		var state = assembler.pop_state();
		var child_assembler = assembler.create_child(key);
		child_assembler.push_state(state);		
	    }
	    tree_walker(tree[key], child_assembler);
	}
    }
}

exports.assemble = function(dir){
    var filenames = fs.readdirSync(dir);
    var config = { };
    try {
	config = JSON.parse(fs.readFileSync(dir + '/config.json').toString());		
    } catch (x) {
	console.log('config.json не существует, а надо бы');
	console.log(x.message);
    }
    var assembler = new nodejs_assembler(dir);
    for(ind in filenames){
	if(filenames[ind].substr(filenames[ind].length - 4,4) == 'json' &&
	   filenames[ind] != 'config.json'){
	    tree_walker(JSON.parse(fs.readFileSync(dir + '/' + filenames[ind]).toString()), assembler);
	}
    }

    dir += '/assembled/';
    if(!fs.existsSync(dir))
	fs.mkdir(dir);
    var generated = assembler.generate();
    fs.writeFileSync(dir + 'constructor.js', generated.constructor);
    console.log(generated.files_to_copy)
//    eval(generated.files_to_copy);
}

exports.deploy = function(dir){
    //копируем все файлы в папку для развёртывания, указанную в конфиге развёртывателя
},

exports.run = function(dir){
    //запускаем, в качестве параметра запуска используем id, выданный при развёртывании
}        
