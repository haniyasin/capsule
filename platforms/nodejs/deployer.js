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
	block : '',
	block_load  : ''
    }
    
    var constructor = '';
    

    this.set_flag = function(name, value){
	s.flags[name] = value;
    }
    
    this.set_type = function(name){
	if(name == 'module')
	    s.type = types.module;			
    }
    
    this.push_state = function(state){
	for(key in state){
	    if( key == 'block')
		s.block = state.block += s.block;
	    else
		s[key] = state[key]
	}
    }

    this.pop_state = function(){
	var state = {}
	for(key in s){
	    if( key == 'block')
		state.block = '';
	    else
		state[key] = s[key]
	}
	return state;
    }

    this.start_block = function(block_name){
    }

    this.end_block = function(block_name){
	s.block +=  'current.' + block_name + "= ";
	s.block += '(function(current){';
	if(!s.flags.preload){
	    s.block += 'current.load=' + '(function(current){ return function(){' + s.block_load + '}})(current);';			         
	}
	s.block += 'return current;})({});\n';
    }

    this.do_file = function(module_name, file_path){
	var _block_load = 'current';
	if(module_name != 'this')
	    _block_load += '.' + module_name;

	_block_load += ' = ' + "require(" + file_path + ');\n';	    
	if(!s.flags.preload)
	    s.block_load += _block_load;    
	else
	    s.block += _block_load + 'tttt' ;	    

//	block_load = '';
	console.log(file_path, dir + '/deploed/' + file_path); // копирование файлов
    }

    this.print = function(){
	console.log(s.block);
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
	    var state = assembler.pop_state();
	    console.log(key, state.flags.preload)
	    assembler.start_block(key);
	    tree_walker(tree[key], assembler);
	    assembler.end_block(key);
	    assembler.push_state(state);
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
    console.log('eeeeeeeeeeeeeeeee\n\n')
    assembler.print();		    
}

exports.deploy = function(dir){
    //копируем все файлы в папку для развёртывания, указанную в конфиге развёртывателя
},

exports.run = function(dir){
    //запускаем, в качестве параметра запуска используем id, выданный при развёртывании
}        
