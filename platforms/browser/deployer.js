//browser assembler
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

function browser_assembler(){
    var s = {	
	flags : {
	},
	type : types.envelope,
	head : null, //html head tag
	block : '',
	block_load : ''
    }
    
    var files = [];
    var constructor = '';
    

    this.set_flag = function(name, value){
	s.flags[name] = value;
    }
    
    this.set_type = function(name){
	if(name  == 'script'){
	    s.type = types.script;
	    if(!s.head){
		s.head = true;
		block += "var head = document.getElementsByTagName('head')[0];";		
	    }
	} else {
	    if(name == 'module')
		s.type = types.module;			
	}
    }
    
    this.push_state = function(state){
	for(key in state){
	    s[key] = state[key]
	}
    }

    this.pop_state = function(){
	return s;
    }

    this.start_block = function(block_name){
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

    this.do_file = function(name){
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
}

exports.assemble = function(){
	    
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

