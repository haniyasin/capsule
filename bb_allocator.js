//универсальный выделятор переиспользуемых кирпичей
function id_manager(){
    this.counter = 0;
    this.create = function(){
        return this.counter++;
    }
    this.destroy = function(){
        //надо бы подумать об удалении, но в обычной ситуации скорее будет переиспользоваться
    }
}

//black box allocalor
function bb_allocator(manager){
    this._busy = [];
    this._free = [];
    this._manager =  new manager();
    this.alloc = function(){
        //alert(_free.length);
        if (this._free.length) {
            var id = this._free.pop();
            this._busy.push(id);
            return id;
        } else {
            var id = this._manager.create();
            this._busy.push(id);

            return id;
        }   
    }
    this.free = function(id){
        for (ind in this._busy){
            if(this._busy[ind] == id){
                this._busy.splice(ind,1);
                this._free.push(id);
            }
        }
    }
}

//конец универсального выделятора