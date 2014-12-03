/*
 * эмуляция окружения капсулы, ну или пока скорее окружения nodejs для запуска deployer в неродной среде
 */

/*
 * пока будем эмулировать nodejs process, но как и в случае с fs, кто его знает. Кроме того, поддерживать всё
 * нет смысла наверное.
 */
var process;

/*
 * пока не забыл. Необходимо сделать такую фичу, как пометка под какой платформой мы реально работаем
 * Например мы запускаем deployer для browser. Но ведь этот deployer может быть запущен как под nodejs,
 * так и под gjs. Нужно лишь сообщить deployer browser реальное название платформы и тогда он подгрузит
 * mkpath, fs, http_responder из нужной платформы. 
 * Это также значит, что запускать такие deployer как браузерный, надо из-под той платформы, которая
 * хостовая. Задачка однако:)
*/

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
    print(path);
    imports[path]; //importing module
    var module = exports;
    cache[path] = module;
    exports = {};

    return module;
}

imports.deployer
