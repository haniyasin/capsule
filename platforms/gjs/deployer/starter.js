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
 * commonjs require emulation over gjs imports
 */
var exports = {}, //a litle hack, exports must be in global visibility
    module = {
	exports : exports
    },
    cache = {}  ;

function require(path){
    var match = /(.*).js$/.exec(path);
    if(match != null)
	path = match[1];

    if(cache.hasOwnProperty(path))
	return cache[path];
    var prev_exports = exports;
    exports = {};
    module.exports = exports;
//    print(path);
    imports[path]; //importing module
    var _module = module.exports;
    cache[path] = _module;
    module.exports = exports = prev_exports;
    //stacKKKKK
    return _module;
}

//print(ARGV, ARGV.length);
var main_loop = new g.MainLoop(null, false);
imports['deployer/deployer'];
main_loop.unref();
main_loop.run();

