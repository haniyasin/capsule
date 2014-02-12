var dutils = require('../../parts/deployer_utils.js');

function module_load_emitter(path, code, current,  module_name, inline){
   
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

var assembler_constructor = dutils.assembler_constructor;

assembler_constructor.prototype.block = '';
assembler_constructor.prototype.block_load = '';
assembler_constructor.prototype.files_to_copy = '';

head : null, //html head tag
block += "var head = document.getElementsByTagName('head')[0];";		
    
assembler_constructor.prototype.generate = function(){
    
}
    this.end_block = function(block_name){
	constructor +=  'current.' + block_name + "= ";
	constructor += '(function(current){';
	if(!s.flags.preload){
	    constructor += 'current.load=' + '(function(current){ return function(){' + block_load + '}})(current);';			         
	}
	constructor += 'return current;})({});';

	s.block = '';
	s.block_load = '';
    }

assembler_constructor.prototype..do_file = function(name){
    var content = fs.readFileSync(name,"utf8");
    if(s.type == types.script){
	var tag = '_' + key;
	block += tag + " = document.createElement('script');" + tag + ".setAttribute('type', 'text/javascript');" + tag + ".setAttribute('src', '" + name +  "');" +  "head.appendChild(" + tag + ");";
	files.push([name, content]);
    } else {
	if(s.type == types.module){
	    var module_load = new module_load_emitter(name, content, current, key, s.flags.inline);
	    //тут сплошные недоработаки с текущей позицией		
	    block +=  module_load.emit_declare();
		var _block_load = module_load.emit_load();
	    
	    if(!flags.preload)
		block_load += _block_load; //НЕРОБЕД
	    else 
		block += _block_load;
	}
    }
}

exports.assemble = function(dir){
    dutils.assemble(dir, assembler_constructor);    
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

