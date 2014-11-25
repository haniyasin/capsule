/*
    Несколько примеров как возможно использовать meta для реализации commonjs модулей и dsa сервисов, 
    которые являются прежде всего модулями, а затем уже имеют специальную структуру для того, чтобы
    загружаться dsa и встраиваться в прозрачную сетевую структуру
*/

///пример commonjs module

meta activate commonjs

module example //Можно здесь сразу и начать фигурную скобку, чтобы избежать дальше писать example something

example hello(string){
    print('hello' + string);
}  	 
example _ping{
        print('pong');
}

//такой вариант эквивалентен

module.name = 'example'
exports.hello = function(string){
    print('hello' + string);
}
exports._ping = function(){
    print('pong');
}

///пример dsa service

service simple_service {
    ping(arg){
        print(arg);
	//дальнейшая обработка sprout и в stack заносится значение answer_one
	sprout {
	     answer_one : arg + 'и тебе привет'
	}	
    }
}

service ponger {
    pong(arg){
        ss = dsa get('simple_service');
	ss pong('приветик')-> local{ /*означает, что блок кода будет выполняться в _этом_ контексте. По
	    умолчанию это не так и блок упаковывается в sprout и исполняется в контексте того сервиса,
	    который был вызван. Об это можно почитать в sprout. local же здесь регистрирует обработчик для
	    возвращаемого значения. Ну и конечно позволяет это дело оптимизировать, если взаимодействие
	    не сетевое, тогда просто преобразуется в код вызывающий друг дружку по старинке(функции с
	    возвращаемым результатом)*/
	     ss ping('и ещё раз привет' + answer_one);
	}
    } 
}
