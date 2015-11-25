/*
 * эмуляция окружения капсулы, ну или пока скорее окружения nodejs для запуска deployer в неродной среде
 */

var g = imports.gi.GLib;

/*
 * пока будем эмулировать nodejs process, но как и в случае с fs, кто его знает. Кроме того, поддерживать всё
 * нет смысла наверное.
 */
var proc = {
    argv : ARGV,
    platform : "gjs"
};

proc.argv.unshift(proc.platform);

/*
 * console.log wrapper around gjs print
 */
var console = { log : function(){print.apply(null, arguments);} };

/*
 * lite commonjs require implemetation
 */

var cache = {};

function _load_module(path){
    var match = /(.*).js$/.exec(path);
    if(match != null)
	path = match[1];

    if(cache.hasOwnProperty(path))
	return cache[path];

    var exports = {}, //a litle hack, exports must be in global visibility

    module_def = {
	exports : exports
    };

    var module_str;
    try{
	module_str = g.file_get_contents(path = path + '.js')[1];
    } catch (x) {
	throw { message : '[Error] cannot found \'' + path + '\' module.'};
    }
    
    var module = new Function('console', 'proc', 'module', 'exports', 'require', module_str);
    try{
	module(console, proc, module_def, exports, _load_module);	
    } catch (x) {
	print('[Error] in ' + path + ' module');
	throw x;
    }
    cache[path] = exports;

    return exports;
}

//print(ARGV, ARGV.length);
var main_loop = new g.MainLoop(null, false);

try{
    _load_module('deployer/deployer');    
} catch (x) {
    print(x.message);
}
main_loop.unref();
main_loop.run();

