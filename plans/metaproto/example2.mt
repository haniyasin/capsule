meta.activate.simpleflex();
meta activate sphere;
config languages {
       russian {
           english : 'английский'
	   russian : 'русский'
           ok : 'принять'
	   cancel : 'отказаться'
	   'choose language' : 'выбрать язык'
	   'main' : 'основное окно'
       }
}

config.languages lang

card create 'choose language' {
     click {
         label : lang english
         config.lang = english
     }
     click russian {
         label : lang russian
         config.lang = russian
     }        
}

card create main {
     image {
         height : 6
         width : 4
         source : "img/main.svg"
     }
     click ok {
         label : lang ok
         width : 2
	 do {
	    card focus chooser 
	 }	 
     }
     click cancel {
         label : lang cancel
         width : 2
	 do{
	    card create failed {
	        image {
		    height : 5
		    width : 4
		}
	    	click back {
		    width : 4
		    card main focus
		}	 
	    }
	 }	 
     }
}