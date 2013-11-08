exports.test = function(uuid){
    //ищем тут подходящий uuid объект
    var uuid_s = uuid.generate_str();
    var uuid_n = uuid.parse(uuid_s);
    console.log(uuid_s, uuid_n, uuid.unparse(uuid_n));
}
