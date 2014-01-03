exports.msg_queue = function(){
    var cb;
    var queue = [];
    this.add = function(msg){
	queue.push(msg);
	cb(msg);
    }
    this.pop = function(){
	return queue.pop();
    }
    this.on_add = function(callback){
	cb = callback;
    }
}