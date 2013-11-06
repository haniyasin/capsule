var fs = require('fs');
exports.test = function(http_respondent){
//раздача зачаток браузерной капсулы

    http_respondent.node.on_recv({ 'url' : "http://localhost:8081/capsule.htm"}, 
				 function (context, response){
				     fs.readFile('browser/capsule.htm', function(err, data)
						 {
						     response.end(data);
						 });
				 },
				 function(error){console.log('failed', error)})    
    http_respondent.node.on_recv({ 'url' : "http://localhost:8081/module_loader.js"}, 
				 function (context, response){
				     fs.readFile('browser/module_loader.js', function(err, data)
						 {
						     response.end(data);
						 });
				 },
				 function(error){console.log('failed', error)})    
    http_respondent.node.on_recv({ 'url' : "http://localhost:8081/dependencies/uuid.js"}, 
				 function (context, response){
				     fs.readFile('dependencies/uuid.js', function(err, data)
						 {
						     response.end(data);
						 });
				 },
				 function(error){console.log('failed', error)})    
    http_respondent.node.on_recv({ 'url' : "http://localhost:8081/tests/timer.js"}, 
				 function (context, response){
				     fs.readFile('tests/timer.js', function(err, data)
						 {
						     response.end(data);
						 });
				 },
				 function(error){console.log('failed', error)})    
    http_respondent.node.on_recv({ 'url' : "http://localhost:8081/tests/transport_direct.js"}, 
				 function (context, response){
				     fs.readFile('tests/transport_direct.js', function(err, data)
						 {
						     response.end(data);
						 });
				 },
				 function(error){console.log('failed', error)})    
    http_respondent.node.on_recv({ 'url' : "http://localhost:8081/modules/uuid.js"}, 
				 function (context, response){
				     fs.readFile('modules/uuid.js', function(err, data)
						 {
						     response.end(data);
						 });
				 },
				 function(error){console.log('failed', error)})    
    http_respondent.node.on_recv({ 'url' : "http://localhost:8081/modules/timer.js"}, 
				 function (context, response){
				     fs.readFile('modules/timer.js', function(err, data)
						 {
						     response.end(data);
						 });
				 },

				 function(error){console.log('failed', error)})    
    http_respondent.node.on_recv({ 'url' : "http://localhost:8081/modules/transport.js"}, 
				 function (context, response){
				     fs.readFile('modules/transport.js', function(err, data)
						 {
						     response.end(data);
						 });
				 },
				 function(error){console.log('failed', error)})    
    http_respondent.node.on_recv({ 'url' : "http://localhost:8081/modules/transport/direct.js"}, 
				 function (context, response){
				     fs.readFile('modules/transport/direct.js', function(err, data)
						 {
						     response.end(data);
						 });
				 },
				 function(error){console.log('failed', error)})    
}
