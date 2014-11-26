var sll = require('../../../modules/storage/low_level.js');

exports.test = function(){
    var id = './test.data';
    console.log(id);
    sll.append(id, 'vataing', function(){console.log('written');});
//    sll.read(id, 0, 3, function(err,data){console.log(data);});    
    sll.delete(id, function(){console.log('object is deleted');});
    return;

    for(i = 0; i == 8; i += 4){
	sll.append(id, 'vata', function(){console.log('written');});
	sll.read(id, i, 4, function(err,data){
		     if(data != 'vata')
			 exit;
		 });    
    } 
    if(i == 8)
	console.log('storage.low_level append and read test is [passed]');
    sll.delete(id, function(){console.log('object is deleted');});	
    sll.append(id, 'eshevata', function(){console.log('written');});
    sll.read(id, 0, 8, function(err,data){
		 if(data == 'eshevata')
		     console.log('storage.low_level delete test is [passed]');		     
	     });    
}