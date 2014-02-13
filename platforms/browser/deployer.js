var fs = require('fs');
var dutils = require('../../parts/deployer_utils.js');
var cb_synchronizer = require('../../parts/cb_synchronizer.js');

function module_load_emitter(path, code, module_name, inline){
   
    this.emit_declare = function(){
	if(inline){
	    var func_name = module_name;
	    if(module_name == 'this')
		func_name = 'upper';
	    return "function _" + func_name + "(module, exports, require){\n" + code + "\n};" + 
		"module_loader.add(\"" + path + "\",_" + func_name + ");";
	} else 
	    return  "module_loader.add(\"" + path + "\"," + JSON.stringify(code) + ");";
    }
    
    this.emit_load = function(){
	if(module_name == 'this')
	    return "current = module_loader.load(\'" + path + "\');";
	
	return 'current.'+ module_name  + ' = ' + "module_loader.load(\'" + path + "\');";
    }    
}

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

    assembler.do_file = function(name, file_path){
	if(this.s.type == dutils.types.script){
	    var tag = '_' + name;
	    this.block += tag + " = document.createElement('script');" + tag + ".setAttribute('type', 'text/javascript');" + tag + ".setAttribute('src', '" + name +  "');" +  "head.appendChild(" + tag + ");";

	    this.files_to_copy.push([file_path, this.dir + '/assembled/' + file_path]);	
	} else {
	    var content = fs.readFileSync(file_path,"utf8");
	    if(this.s.type == dutils.types.module){
		var module_load = new module_load_emitter(file_path, content, name, this.s.flags.inline);
		this.block +=  module_load.emit_declare();
		var _block_load = module_load.emit_load();
		
		if(!this.s.flags.preload)
		    this.block_load += _block_load; //НЕРОБЕД
		else 
		    this.block += _block_load;
	    }
	}
    }

    return assembler;
}



exports.assemble = function(dir){
    var assembler = assembler_constructor(dir);
    var generated = dutils.assemble(dir, assembler);
    generated.constructor = "var head = document.getElementsByTagName('head')[0];" + generated.constructor;  
    fs.writeFileSync(dir + '/assembled/capsule_constructor.js', generated.constructor);
    var files_to_copy = assembler.files_to_copy;
    var cb_sync = cb_synchronizer.create();
    cb_sync.after_all = function(){
	fs.writeFile(dir + '/assembled/files_to_copy.json', JSON.stringify(files_to_copy));	
    }
    for(file in files_to_copy){
	(function(file){
	     fs.readFile(files_to_copy[file][0], cb_sync.add(function(err, content){
			     if(!err){
				 files_to_copy[file][0] = content.toString();
			     }else
				 console.log('something is going wrong in file reading')
			 }));	    
	 })(file)
    }
}

exports.deploy = function(){
	    //копируем все файлы в папку для развёртывания, указанную в конфиге развёртывателя
	    //далее либо используя exporter.js приготавливаем все файлы к раздаче через http
	    //либо используя его же, упаковываем все файлы в парочку .js файлов и htm для локального
	    //запуска в браузере или запуске в браузере с любого http сервера, способного раздавать файлы
}

exports.run = function(){
    //запускаем, в качестве параметра запуска используем id, выданный при развёртывании
    //запуск фактически означает открытие в браузере адреса, по которому расположен набор
    //что-то иначе надо делать, если набор сделан для раздачи произвольным http сервером
}    

