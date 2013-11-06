exports.test = function(uuid){
    //ищем тут подходящий uuid объект
    var uuid_s = uuid.node.generate_str();
    var uuid_n = uuid.node.parse(uuid_s);
    console.log(uuid_s, uuid_n, uuid.node.unparse(uuid_n));
}
