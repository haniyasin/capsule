/*
  пример использования meta возможностей для упрощения работы ui с хранением данных. За одно ипользуется
  упрощение представление асинхронного кода. 
*/

// данная модификация отвечает за css подобный язык и возможность не использовать () при вызове функций и 
//методов.
meta.activate.simpleflex();
//поддежка api sphere и dsa в языке. Это апи не только просто представляет вызовы как simpleflex, но и
//дополнительно скрывает работу со stack, state и прочим
meta activate sphere
//позвозволяет как писать асинхронный код просто, так и вызывать. В данном случае это только для примера
//потому как sphere включает dsa, а та в свою очередь включает async всё равно, потому как вся работа с dsa
//сервисами идёт асинхронно, а в нашем случае это даже card create
meta activate async
config languages {
    russian {
        'form to add user' : 'форма добавления пользователя'
	'user name' : 'имя пользователя'
	'age' : 'возраст'
	'add' : 'добавить'
    }      
}

config.languages lang

card create 'form to add user' {
    entry name {
        width : 4
	advertisement : lang 'user name'
    }    
    entry age {
        width : 1
	advetrisement : lang age
    } 
    click add {
        width : 1
	on : {
	    var user = { 
	                    name : name.content
			    age : age.content 
		       }
            //асинхронный код, специальная модификация языка
	    //можно было бы использовать и просто append с аргументом создания, если несуществует
	    data search ourcollection user : result{
	        if(result == data exists)
		    return;
		data append ourcollection user
	    }    
	}	
    }           
}

//ну и так уж, чтобы не забыть, несколько примеров с работы с data, который в облаке естественно

data get ourcollection { name : 'vasya'} -> result {
     if(result != data exists)
         return;
     result.name += result.name + ' pupkin';
     data update ourcollection result; 
}

//естественно, что никто не запрещает писать как принято в js, но всё равно не совсем, ибо async используется
// data.get(ourcollection, {name : 'vasya'}) -> (result) { }
