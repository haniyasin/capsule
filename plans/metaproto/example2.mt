config languages {
       russian {
           english : 'английский'
	   russian : 'русский'
           ok : 'принять'
	   cancel : 'отказаться'
	   
       }
}

config.lang.english _e

card create chooser {
     click {
         label : _e 'english'
         config.lang = english
     }
     click russian {
         label : _e 'russian'
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
         label : _e 'ok'
         width : 2
	 do {
	    card focus chooser 
	 }	 
     }
     click cancel {
         label : _e 'cancel'
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