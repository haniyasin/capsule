/*
  В общем ноги этой концепции можно найти в plans/statethrower
  Это так сказать дальнейшие мысли по этому поводу уже на ином уровне, на уровне языка. В виде примеров
*/
meta.activate.simpleflex()
//расширения sphere как уже говорилось в data.mt, включают в себя расширения dsa, а те в свою очередь async
//ну и в данном случае statethrower, поскольку поидее вся сфера должна быть вдоль и поперёк завязана на
//порождение, откатывание и сохранение состояний. Зачем? Да потому что среда неустойчива и только непрерывная
//_работа_ и _движение_ делает её устойчивой. Ну и потому что удаление и дестуктивные изменения - это не наш
//метод.
meta activate sphere

//example 1
/*Все действия объединены в блок и только после выполнение всего блока будет выполняться следующее за блоком
*/
{
    data create->
    failed(current){
        ui freeze ->
	card create {
	    label {
	        height : 3
	        width : 6
		text : lang 'storage is failed, please try later'
	    }
	    click {
	        width : 4
		on : {
		    ui unfreeze
		}		
	    }
	}	
    }   
    ui create->
    videolist create
}-> 
ok(current){
    data extract smallobjects { name : /cristmas, type : 'video', length : '>100min'} ->
    readed(list){	      
        videolist load list	
    },
    failed(current){
	//если условие исполняется, значит мы уже здесь 2й раз и пора выбрасывать неудачу выше
	if(current failed > 1)
	    curennt finish [data] 'не получается работать с хранилищем' /*data значит пробовали восстановить		 не только это действие, но и переинициализровать data*/
        //пытаемся восстановить data и пустить заново цепочку, если не выходит, выбрасываем неудачу выше
	data create ->
	current again
    }   
}
	 	 	

