/*
 * коллекция это объект, в который можно записать произвольное количество объектов любого из возможных 
 * типов capsule. Коллекция плоская, что-то вроде hash или ассоциативного массива. Для чего это нужно?
 * Для прозрачной упаковки разных объектов в один объект. Удобно, когда нужно взять несколько объектов,
 * засунуть их в один и отдать этот объект как файл. Вот пример:
 * 
 * var col = new collection();
 * col.set('background', bg_image);
 * col.set('current_media', cur_video);
 * file_droper.load(new file(col)); 
 */

module.exports = function(){
    //internal browser api
    
    //getting url of blob object
    this._get_link = function(){
	
    };

    //public api
     
    //добавляет данные в коллекцию
    this.push = function(object){
	return key;
    };
    this.set = function(key, data){
    };
    this.get = function(key, data){
	return key;
    };    
};