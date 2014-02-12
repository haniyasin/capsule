var fs = require('fs');
var dutils = require('../../parts/deployer_utils.js');

var assembler_constructor = dutils.assembler_constructor;
assembler_constructor.prototype.block = '';
assembler_constructor.prototype.block_load = '';
assembler_constructor.prototype.files_to_copy = '';
assembler_constructor.prototype.generate = function(){
    var generated = {
	constructor : '',
	files_to_copy : ''
    }
    
    for(child_ind in this.childs){
	var child = this.childs[child_ind];
	    var child_generated = child[1].generate();
	
        this.block += 'current.' + child[0] + ' = ' + child_generated.constructor;
	generated.files_to_copy += child_generated.files_to_copy;
    }
    
    generated.constructor += "(function(current){" + this.block;
    
    if(this.s.flags.preload == false){
	generated.constructor += 'current.load=' + '(function(current){ return function(){' + this.block_load  + '}})(current);';			         
    }else
	generated.constructor += this.block_load;
    generated.constructor += 'return current;})({});\n'; //тут надо вписать имя родителя	
    
    generated.files_to_copy += this.files_to_copy;
    
    return generated;
}

assembler_constructor.prototype.do_file = function(module_name, file_path){
    this.block_load += 'current';
    if(module_name != 'this')
	this.block_load += '.' + module_name;
    
    this.block_load += ' = ' + "require('" + file_path + "');\n";	    

    this.files_to_copy += file_path + ',' + this.dir + '/assembled/' + file_path + "\n";
}




exports.assemble = function(dir){
    dutils.assemble(dir, assembler_constructor);
}

exports.deploy = function(dir){
    //копируем все файлы в папку для развёртывания, указанную в конфиге развёртывателя
},

exports.run = function(dir){
    //запускаем, в качестве параметра запуска используем id, выданный при развёртывании
}        
