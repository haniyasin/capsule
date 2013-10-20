function frame_info(void){
    return { 
	//перечисление поддерживаемых элементов и возможных свойств этих элементов
	elements : {
	    frame : {
		properties : ['bg', 'x', 'y', 'width', 'height', 'opacity']
	    },
	    image : {
		properties : ['data', 'x', 'y', 'width', 'height', 'opacity']
	    }, 
	    text : {
		properties : ['text', 'color', 'x', 'y', 'width', 'height', 'opacity']
	    }
	},

	//описание возможностей анимации
	animation :{	    
	    //указание максимально возможного duration(в случаях типа operamini тут может быть 1-2 секунды)
	    duration_max
	},
	
	renderer : {
	    /*скорость обновления содержимового. Возможные варианты : slow, normal, fast. 
	     * Fast - это обычные рендереры типа десктопных браузеров или evas, где изменения с помощью compositer api видны немедленно.
	     * normal - не извествено:)
	     * Slow - рендереры типа opera mini или web static version, где изменения применяются при наступлении некоторого события(взаимодействия пользователя, по таймауту обновления в html и тд)
	     */
	    speed
	}
    }
}