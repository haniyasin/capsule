var sll = require('../../../modules/storage/low_level.js');

exports.test = function(){
    var id = 'test.data';

    var success = true;
    function delete_test(){
	sll.delete(id, function(){console.log('object is deleted');});	
	sll.append(id, 'eshevata', function(){
		       //console.log('written');});
		       sll.read(id, 0, 8, function(err,data){
				    if(data == 'eshevata')
					console.log('storage.low_level delete test is [passed]');	
				    sll.delete(id, function(){console.log('object is deleted');});	
				});   
		   });	
    }
    for(var i = 0; i != 8; i += 4){
	(function(i){
	     sll.append(id, 'vata', function(){
//			    console.log(i);
			    sll.read(id, i, 4, function(err,data){
					 if(data != 'vata')
					     success = false;
					 if(i == 4){
					     if(success){
						 console.log('storage.low_level append and read test is [passed]');
						 delete_test();						 
					     }
					     else
						 console.log('storage.low_level append and read test is [failed]');
					 }
				     });    			   
  			});
	 })(i);
    } 
};