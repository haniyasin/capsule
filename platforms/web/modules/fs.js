/*
 * implementation of fs(nodejs) api over XmlHttpRequest(for file reading) and blob, FileReader, FileWriter for
 * everything else
 * 
 */

module.exports = {
    existsSync : function(path){
	
    },
    readdirSync : function(path){
	
    },
    mkdir : function(path){
	
    },
    readFileSync : function(path, options){
	var req = new XMLHttpRequest();
	req.open('GET', path, false);
	req.send(null);
	if(req.status == 200){
	    return req.responseText;
	}
    },
    readFile : function(path, options){
	req.onreadystatechange = function(){
	    if (req.readyState == 4) {
		// для статуса "OK"
		//        if (req.status == 200) {
		//  req.open('GET', 'capsule/todo.org', true);
		//    req.send(null);
		alert(req.responseText);
		//        } else {
		//            alert("Не удалось получить данные:\n" +
		//              req.statusText);
		//      }
	    }
	};	
    },
    writeFileSync : function(path, data){
	
    },
    writeFile : function(path, data, options, callback){
    }
};