var fs = require('fs');
var dutils = require('../../parts/deployer_utils.js');

function assembler_constructor(dir){
    var assembler = new dutils.assembler_constructor(dir);

    assembler.constructor = assembler_constructor;
    assembler.block = '';
    assembler.block_load = '';
    assembler.files_to_copy = [];

    assembler.generate = function(){
	var generated = {
	    constructor : ''
	}
	
	for(child_ind in this.childs){
	    var child = this.childs[child_ind];
	    var child_generated = child[1].generate();
	    
            this.block += 'current.' + child[0] + ' = ' + child_generated.constructor;
	    this.files_to_copy = this.files_to_copy.concat(child[1].files_to_copy);
	}
	
	generated.constructor += "(function(current){" + this.block;
	
	if(this.s.flags.preload == false){
	    generated.constructor += 'current.load=' + '(function(current){ return function(){' + this.block_load  + '}})(current);';			         
	}else
	    generated.constructor += this.block_load;
	generated.constructor += 'return current;})({});\n'; //тут надо вписать имя родителя	
	
	return generated;
    }

    assembler.do_file = function(module_name, file_path){
	this.block_load += 'current';
	if(module_name != 'this')
	    this.block_load += '.' + module_name;
	
	this.block_load += ' = ' + "require('" + file_path + "');\n";	    

	this.files_to_copy.push([file_path, this.dir + '/assembled/' + file_path]);
    }

    return assembler;
}

exports.assemble = function(dir){
    var assembler = assembler_constructor(dir);
    var generated = dutils.assemble(dir, assembler);
    fs.writeFileSync(dir + '/assembled/capsule_constructor.js', generated.constructor);
    console.log(assembler.files_to_copy)
}

exports.deploy = function(dir){
    //копируем все файлы в папку для развёртывания, указанную в конфиге развёртывателя
},

exports.run = function(dir){
    //запускаем, в качестве параметра запуска используем id, выданный при развёртывании
}        
