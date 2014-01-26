var fs = require('fs');

// собираем капсулу + набор нужных модулей по конфигурации под конкретную платформу
// исходными данными является каталог с конфигами, которые обрабатываются в числовом порядке
// каждый конфиг подобен по структуре тому, что используется exporter.js и по задумке просто
// копируется из конкретного проекта, который должен быть добавлен в результатирующий набор,
// например platforms/browser/capsule.json, dsa_mq.json, dsa_manager.json и тд.
// но конфиги можно писать и вручную, это целесообразно либо для каких-то особенных сборок,
// либо для добавления своих проектов в набор
// По идее, никакой работы особенной ручной работы для поддержки той или иной платформы не нужно
// делать, потому как для конкретной платформы уже есть конфиг капсулы. Но, всякое может быть.
// Также стоит подумать как правильно отработать зависимости, которые в браузере подгружаются
// как script/js, а в nodejs могут быть подгружены как модули. То есть как это оформлять в конфиге
// ведь изначально конфиг exporter для этого не задумывался, ну по крайней мере не в таком объёме.
function assemble(){
    
}

// развёртываем собранный набор и готовим к запуску
// на этом этапе также имеет значения обработка конфигов, наверное. потому как для развёртывания
// на разные платформы есть нюасны, которые указаны в конфигах, но возможен также вариант, что
// эти нюансы уже учтены в сгенерированных js файлах, то есть подобно тому, как exporter генерирует
// конструкторы для конфигов
function deploy(){
    
}

//запускаем развёрнутый набор
function run(){
}

var types = {"envelop" : 1,
	     "module" : 2,
	     "script" : 3
	    };

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
	head : null //html head tag
    }
    
    var files = [];
    var constructor = '';
    var block = '';
    var block_load ='';
    

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
    
    this.set_state = function(state){
	s = state;
    }

    this.get_state = function(){
	return s;
    }

    this.start_block = function(block_name){
	block = '';
    }

    this.end_block = function(block_name){
	constructor +=  'current.' + block_name + "= ";
	constructor += '(function(current){';
	if(!s.flags.preload){
	    constructor += 'current.load=' + '(function(current){ return function(){' + block_load + '}})(current);';			         
	}
	constructor += 'return current;})({});';
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

function nodejs_assembler(){
    var s = {	
	flags : {
	},
	type : types.envelope,
    }
    
    var constructor = '';
    var block = '';
    var block_load ='';
    

    this.set_flag = function(name, value){
	s.flags[name] = value;
    }
    
    this.set_type = function(name){
	if(name == 'module')
	    s.type = types.module;			
    }
    
    this.set_state = function(state){
	s = state;
    }

    this.get_state = function(){
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
	//cleaning all allocated for block resources
	block = '';
	block_load = '';
    }

    this.do_file = function(module_name, file_name){
	var _block_load = 'current';
	if(module_name != 'this')
	    _block_load += '.' + module_name;
	_block_load += ' = ' + "require(" + file_name + ');\n';	    
	if(!s.flags.preload)
	    block_load += _block_load;
	else 
	    block += _block_load;
    }

    this.print = function(){
	console.log(constructor);
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
	    var state = assembler.get_state();
	    assembler.start_block(key);
	    tree_walker(tree[key], assembler);
	    assembler.end_block(key);
	    assembler.set_state(state);
	}
    }
}

var deployers = {
    'nodejs' : {
	"assemble" : function(dir){
	    var filenames = fs.readdirSync(dir);
	    var config = { };
	    try {
		config = JSON.parse(fs.readFileSync(dir + '/config.json').toString());		
	    } catch (x) {
		console.log('config.json не существует, а надо бы');
		console.log(x.message);
	    }
	    var assembler = new nodejs_assembler();
	    for(ind in filenames){
		if(filenames[ind].substr(filenames[ind].length - 4,4) == 'json' &&
		   filenames[ind] != 'config.json'){
		    tree_walker(JSON.parse(fs.readFileSync(dir + '/' + filenames[ind]).toString()), assembler);
		}
	    }
	    console.log('eeeeeeeeeeeeeeeee\n\n')
	    assembler.print();		    
	},
	"deploy" : function(dir){
	    //копируем все файлы в папку для развёртывания, указанную в конфиге развёртывателя
	},
	"run" : function(dir){
	    //запускаем, в качестве параметра запуска используем id, выданный при развёртывании
	}        
    },
    'browser' : {
	"assemble" : function(){
	    
	},
	"deploy" : function(){
	    //копируем все файлы в папку для развёртывания, указанную в конфиге развёртывателя
	    //далее либо используя exporter.js приготавливаем все файлы к раздаче через http
	    //либо используя его же, упаковываем все файлы в парочку .js файлов и htm для локального
	    //запуска в браузере или запуске в браузере с любого http сервера, способного раздавать файлы
	},
	"run" : function(){
	    //запускаем, в качестве параметра запуска используем id, выданный при развёртывании
	    //запуск фактически означает открытие в браузере адреса, по которому расположен набор
	    //что-то иначе надо делать, если набор сделан для раздачи произвольным http сервером
	}    
    },
    'node-webkit' : {
	"assemble" : function(){
	},
	"deploy" : function(){
	},
	"run" : function(){
	}
    }    
}


var params = {
    'platforms' :{
	'--nodejs' : 'nodejs',
	'--node-webkit' : 'node-webkit',
	'--browser' : 'browser'
    },
    'actions' : {
	'assemble' : 'assemble',
	'deploy' : 'deploy',
	'run' : 'run'	
    }
}

function parse_args(argv){
    var config = {
	'platform' : 'nodejs',
	'action' : 'assemble',
	'dir' : null
    };

    for(arg in argv){
	if(params.platforms.hasOwnProperty(argv[arg]))
	    config.platform = params.platforms[argv[arg]];
	else if(params.actions.hasOwnProperty(argv[arg]))
	    config.action = params.actions[argv[arg]];	
	else if(arg > 1)
	config.dir = argv[arg];
    }
    
    if(!config.dir)
	config.fail = true;

    return config;
}

var config = parse_args(process.argv);
var deployer;
if(deployers.hasOwnProperty(config.platform))
    deployer = deployers[config.platform];
else config.fail = true;

if(config.fail)
    console.log("использовать надо как-то так deployer params [action] [directory]");

deployer[config.action](config.dir);

//console.log(config);