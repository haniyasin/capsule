
exports.features = {
    //коонектящийся, поддерживает множество входных и выходных сообщений асинхронно
    'dealer' : 0x00000001,
    //принимающий, поддерживает множество входных и выходных сообщений асинхронно
    'router' : 0x00000002,
    //нуждается в адресе при создании или нет. Если 1, то нужно, если 0, то не нуждается. Некоторые типы транспортов не могут иметь адреса впринципе, например принимающий сообщения вебворкер.
    'need_address' : 0x00000000,
    //только один экземпляр транспорта возможен, если 1. Опять же имеет смысл для webworker, ajax или когда создатель капсулы устанавливает подобные ограничения даже для tcp, udp и других транспортов
    'only_one_instance' : 0x00000000
}

exports.instance_interface = function(){
    this.send = function(msg_id, msg, callback){
    }

    this.callback_reg = function(msg_id, callback){
	
    }
    
    this.callback_unreg = function (msg_id){
	
    }

    this.error_callback = function(error){
    }

}
