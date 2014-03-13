var DEBUG = 1;
exports.test = function(capsule){
    console.log("starting testing of timer module");
    
    //проверить наличие таймер модуля и его пригодность
    //подумать о том как проверить неработоспособность destroy
    //testing of timer's cyclic mode
    var start_seconds = (new Date()).getSeconds();
    var counter = 0;
    var seconds_left = 0;
    var interval = 50; //milisec
    var timeout = 4; //seconds
    var _timer  = capsule.modules.timer.js.create(function(){
//				     console.log(print++);
				     var cur_seconds =  (new Date()).getSeconds();
				     start_seconds <= cur_seconds ? seconds_left = cur_seconds - start_seconds : seconds_left = 60 - start_seconds + cur_seconds;
				     counter++;
				     if(seconds_left >= timeout){
					 _timer.destroy();
					 if(DEBUG)
					     console.log("DEBUG: seconds_left[",seconds_left,"], counter[", counter,"], start_seconds[", start_seconds, "], cur_seconds[", cur_seconds,"]");
					 if(counter > timeout*1000/interval*0.6)
					     console.log("test of cyclic mode [PASSED]");
					 else
					     console.log("test of cyclic mode [FAILED]");
				     }
				 }, interval, true);

    //testing of timer's single timeout mode

    var timeout_counter = 0;    
    for(var ind = 0; ind < 200; ind++){
	capsule.modules.timer.js.create(function(timeout){
			    //				      timeout.destroy();
			    timeout_counter++;
			}, interval + ind, false);	
	if(ind == 199)
	    capsule.modules.timer.js.create(function(){
				if(DEBUG)
				    console.log("DEBUG: timeout_counter[",timeout_counter,']');
				if(timeout_counter == 200)
				    console.log("test of single timeout mode [PASSED]");
				else
				    console.log("test of single timeout mode [FAILED]");
			    },5000,false);
    }    
}
