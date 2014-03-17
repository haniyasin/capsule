/*
 * Хотя изначально, эта идея разработана для последовательного посыла сообщений, от одного другому третьему
 * сервису в рамках проекта sphere, здесь будет описана концепция в целом и приминительно к capsule.
 * А в сфере будет описано в коде приминительно к сервисам и будет реализация этой концепции в 
 * dsa.sequent. 
 * В то же время здесь, будут в основном идеи и прототипная часть, а воплощение будет только после завершения
 * всех работ с капсулой, включая чистку кода. Возможно во время чистки появится воплощение, но загадывать 
 * не буду. Главное сейчас описать всё что в голове:) В итоге должно появиться универсальное решение для 
 * капсулы и dsa, которое просто будет иметь опциональную поддержку dsa и других механизмов
 * И небольшая историческая справка, идея последовательности вызовов с сохранением результатов вызовов, 
 * появилая у меня ещё несколько лет назад, во время работы над первым поколением ui, до Compositer. Я тогда
 * не знал, что идея повторится в голове но в другом виде:) Хотя конечно, может это всё виноваты другие 
 * технологии, которые изучал:) 
 */

sequence(['c', fs.readFile, './sequence_proto.js'],
	 ['c', fs.writeFile, './sequence_proto.js.copy', 'stack[0][0]'],
	 ['fn', function(context, stack){
	     //печатаем текст файла
	     console.log(stack[0][1])
	 }]
	);

/*
 * Некоторые замечания
 * ret - массив хранит все результаты работы вызванных функций в последовательности
 * Сначала вся последовательность обрабатывается, и для тех где надо, создаются реальные функции, а уже 
 * затем последовательность запускается. В нашем случае fs.writeFile оборачивается в функцию, которая уже 
 * передаётся в качестве параметра fs.readFile
 */

sequence(['c', fs.readFile, './sequence_proto.js'],
	 ['s', 'storage', 'create', {'backend' : 'srb'}],
	 ['fn',function(context, stack){
	     //печатаем object_info для нахождения нашего файла
	     console.log(stack[1][0])
	 }],
	 ['s', 'storage', 'extract', 'stack[1][0]', '*'],
	 ['c', fs.writeFile, './sequence_proto.js.copy', 'stack[3][0]'],
	 ['fn',function(stack){
	     //печатаем содержимое файла
	     console.log(stack[3][0])
	 }]
	);

/* 
 * с, function name, arg1, arg2, etc - function with callback. Функция, где последний аргумент это callback, который вызывается,
 * когда дело, ради которой функцию вызвали - сделано. Поскольку существует множество различных соглашений
 * среди функций, делающих дело асинхронно(одни принимают один callback, другие несколько, одни в начале, 
 * другие в конце, а иные и возвращают некий объект, с помощью которого можно назначить callback или узнать
 * статус операции. В силу всего этого, function with callback будет иметь бекэнды, и когда то или иное 
 * соглашение не будет укладываться в концепт function with callback, будет добавлен ещё один тип
 * Один нюанс, цепочка, исполняющая таким образом функции должна быть в том же контексте, что и эти функции,
 * так как функции передаются как указатели
 *
 * s, service_id, message_name, arg1, arg2, etc - service. Сервис в рамках концепции dsa, то есть посыл ему сообщения. Тут тоже есть нюасны, так как
 * сервис может посылать в ответ разные сообщения, то надо доработать на какие сообщения реагировать и как
 *
 * fn, function(context, sequence, stack, next) - near function. Функция, исполняющаяся там, где была запущена последовательность. То есть можно
 * рассматривать её как каллбэк без замыкания
 * 
 * ff, function(sequence, stack, next) - far function. Функция, испольняющаяся там, где был исполнен последний элемент последовательности.
 * Предначначена для промежуточной обработки данных
 */

//juicer
react('squeeze_out', 
      function(next, fruit){
	  next( {"sort" : "second",
		 "aqua" : fruit.body += 'eennpp'
		}); //инопланетный способ выжимки из букв сока путём прибавление ещё буков:)
      });

react('filter', 
      function(next, juice){
	  juice.sort = 'first';
	  juice.aqua = 'cristal' + juice.aqua;
	  next(juice);
      });

react('prepare_finest_juice', 
      function(next, fruit){
	  sequence(['s', 'juicer', 'squeeze_out',  fruit],
		   ['ff', function(sequence, stack, next){
			  if(ret[0].sort == 'second') //juice first sort
			      sequence.push('s', 'juicer', 'filter', 'stack[0]')
			  else next(stack[0]);
		      }],
		   ['c', next, 'stack.last.aqua'])
      });


sequence(
    ['s', 'juicer', 'prepare_finest_juice', { "type" : "apple", "sort" : "golden", "body" : "ddffpp"}],
    ['s', context.service, 'set', 'cup', 'stack[0]']
);

/*
 * уже по сложнее, с модификацией последовательности. В последовательность можно вставлять, но только в то
 * место, где находишся. В данном случае, если сок получился не очень хорошего качестве, его фильтруют.
 * И уже после того, когда сок точно первого сорта, его наливают в кружку родительскому контексту
 * В этом примере появляется такая концепция как context. Если stack - это что-то вроде стека для всей 
 * последовательности, временные данные, то context - это данные над которыми идёт работа и одновременно место для результата работы. context нечно постоянное, потенциально приспособленное для сохранения в хранилище
 * и с прозрачным доступом. context  доступен как с помощью полей get и set, так и как сервис, используя
 * context.service. context хранится там, где чаще всего используется. Скорее всего это некоторое облако 
 * данных, часть из которых хранится у одного сервиса, часть у другого и работа с которым идёт с помощью id.
 * С другой стороны на начальной стадии context хранится на том сервисе, который с ним работает, в нашем случае это сервис some. Другие же сервисы работат с этим контекстом как с вервисом при помощи id, а сервис some
 * работает с context как с локальным объектом.
 * 
 */


function lamp(context, react, send, sequence){
    react('power_on', function(next){
	      context.set('power', 'on');
	  });
    react('power_off', function(next){
	      context.set('power', 'off');
	  })
}

function lamp_men(context, react, send, sequence){ 
    react('give', function(next){
	      //создаст контекст, который по id идентичен самому сервису
	      sequence(['c', dsa.get, lamp],
		       ['s', stack[0], 'power_on'],
		       ['s', next.service, 'stack[0]']);
	  });
    react('take', function(next, lamp){
	      sequence(['s', lamp, 'power_off'],
		       ['c', dsa.release, lamp]
		      );
	  });
}

//human

function human(context, react, send, sequence){
    react('put_lamp_on', function(next, table){
	      sequence(['s', 'lamp_men', 'give'],
		       ['s', human, 'put_on_the_table', table, 'stack[0]'],
		       ['c', next, 'stack[0]']
		      ) 
	  });
    
    react('remove_lamp_from', function(next, table, lamp){
	      
	  });    
}

// working with human
//ask put_lamp_on

sequence(['s',human, 'put_lamp_on', table],
	 ['s',context.service, 'set', 'lamp', 'stack[0]']);

//ask remove lamp from
sequence(['s', context.service, 'get', 'lamp'],
	 [human, 'remove_lamp_from', table, 'stack[0]']);

/*
 * самый сложный вариант, учитывающий уже нюансы, создания объектов, когда dsa создаёт контекст для сервиса.
 * В принципе ничего особенного в сравнении с предыдущими примерами, просто показывает как появляются объекты
 */


////////////////PARALLEL

sequence(['pc', fs.readFile, 'text.txt'],
	 ['pc', fs.readFile, 'image.gif'],
	 ['fn', function(context, stack){
	      console.log(stack[0].toString().length)
	      console.log(stack[1].toString().length)
	  }]
	)

/*
 * p - parallel. Можно ставить перед любым типом вызова - c,s,fn,ff. 
 * Parallel значит вызов будет сделан параллельно другому, не последовательно. В нашем случае два вызова
 * чтения файлов будут сделаны параллельно, а затем, когда их результаты будут получены - вызовется fn.
 * То есть был бы в нашем случае один вызов pc, а не два, он был бы вызван и затем уже был бы вызван fn.
 * Поэтому p имеет смысл для 2х и более элементов. 
 * 
 */

function read_text(callback){
    fs.readFile('text.txt', callback);
}

function read_image(callback){
    fs.readFile('image.gif', callback);
}

var adapter_text = sequence.alloc_adapter();
var adapter_image = sequence.alloc_adapter();

read_text(adapter_text);
read_image(adapter_image);

sequence(['pa', adapter_text],
	 ['pa', adapter_image],
	 ['fn', function(context, stack){
	      console.log(stack[0].toString().length)
	      console.log(stack[1].toString().length)
	  }]
)

/*
 * С точки зрения работы, этот пример делает тоже самое, что и предыдущий. Но использует адаптеры.
 * Adapter - это специальный объект-функция, которую можно передавать в любой вызов, где требуется
 * callback. Затем этот адаптер можно использовать как элемент последовательности, подобно обычному вызову.
 * adapter позволяет вставить в последовательность вызовы, которые совершаются где-то глубоко в фукнциях,
 * внедра которых вы не имете доступа, но передаёте callback.
 * Также adapter удобен тогда, когда вы просто физически не можете в рамках одной последовательности, в рамках
 *одной функции и контекста сделать всю нужную работу, но не хотите при этом терять связности кода.  
 *
 */