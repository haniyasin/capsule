/*
 * 
 * 
 list
 +-------------head--------------+
 list_body
 +-------------bottom------------+
 
 message
 +-------------------------------+
 | {who} : { message }           |
 +-------------------------------+
 * 
 * 
 * 
 * 
 */

function(){
  var list = template.get('list');
  var message = template.get('message');
  list.head.text = "Список задач";
  message.who = "Лунтик";
  message.message = "Привет";
  list.list_body.add(message);
  message.who = "Фантик";
  message.message = "И тебе привет";
  list.list_body.add(message);
  list.bottom.text = "Конец";
  window.message_list.add(list);
}

/*
 * Допустим мы сделали окно и маленький там есть titlebar, две третих слева название по середине, а справа кнопочка справка
 *
 * titlebar 
 * +------------------------------------------------------------+
 * |          {appname}                                   ?     |
 * +------------------------------------------------------------+
 * В свойствах ? указан id=babout
 */

var main = template.get('window'),
    titlebar = template.get('titlebar'),
    comp = new Compositer();

titlebar.appname.text = 'My first application';
titlebar.babout.on('pointer_down', function(){
		     titlebar.appname.text = 'My application is clicked';
		   });
main.content.add(titlebar);
comp.root.add(main.frame);

/*
 * Примерный формат хранимых ui templates
 * Сам template в конечном счёте можно добавлять как обычный frame.
 * Тем не менее это объект, который даёт всю необходимую функциональность для управление своим содержимым
 * Поскольку шаблоны это обычный JSON, и хранится они могут в капсулированном виде и подгружаться как обычные типы capsule
 */

var templates = [
  {
    name : "titlebar",
    elements : [
      {
	type : "frame",
	x : 0,
	y : 0,
	width : '100%',
	height : 2,
	color : black
      },
      {
	type : "frame",
	x : 0,
	y : 0,
	width : 2,
	height : '10%',
	color : black
      },
      {
	type : "frame",
	x : 0,
	y : '10%',
	width : '100%',
	height : 2,
	color : black
      },
      {
	type : "frame",
	x : 98,
	y : 0,
	width : 2,
	height : '10%',
	color : black
      },
      {
	name : appname,
	type : "text",
	x : '30%',
	y : 2
      },
      {
	name : babout,
	type : "image",
	x : '90%',
	y : 2,
	height : '8%',
	width : '4%'
      }
    ]
  }
];