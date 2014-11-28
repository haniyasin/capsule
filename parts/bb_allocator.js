//универсальный выделятор переиспользуемых кирпичей
exports.id_allocator = function(){
    var counter = 0;
    this.create = function(){
        return ++counter;
    }
    this.destroy = function(){
        //надо бы подумать об удалении, но в обычной ситуации скорее будет переиспользоваться
    }
}

//black box allocalor
exports.create = function(allocator){
    var busy = [];
    var free = [];
    var _allocator =  new allocator();
    this.alloc = function(){
//	console.log(free.length);
//	console.log(busy.length);
        if (free.length) {
            var obj = free.pop();
            busy.push(obj);
            return obj;
        } else {
            var obj = _allocator.create(arguments);
            busy.push(obj);

            return obj;
        }   
    };
    this.free = function(obj){
        for (ind in busy){
            if(busy[ind] == obj){
//		console.log("freeing");
                busy.splice(ind,1);
                free.push(obj);
            }
        }
    };
};

//конец универсального выделятора