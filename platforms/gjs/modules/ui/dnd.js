/*
 * drag and drop interface. It is mostly like a Gtk DND API.
 */
var comp = require('./Compositer');

function dnd(){
    return new comp.element_proto('dnd', 
				  {
				      /*
				       * DND source constructor
				       * comp_element : 
				       * + if element then source binded to it
				       * + if null then new frame is created
				       * К сожалению не все element могут выступать в роли source или destination, это связано с тем, что как
				       * правило dnd работает поверх концепции окон(справедливо для windows, Gtk и некоторых других). Поэтому
				       * в ряде случае вместо создания source|destination будет выбрасываться исключение. Пока ещё думаю как бы
				       * это элегантно обойти, но в крайнем случае приложения должны использовать гланый фрейм - 0.  
				       */
				      actions : {
					  copy : 1,
					  move : 2
				      },
				      source : function(comp_element, options, target_list, action_after){
					  this.element;
					  //data_request, data_delete, begin, end
					  this.on = function(){
					      
					  };
					  this.destroy = function(){
					  };
				      },
				      //				     var widget = new Gtk.Entry();
				      //				     widget.set_placeholder_text(info.placeholder);
				      //				     var element = new element_obj_proto(GtkClutter.Actor.new_with_contents(widget), info);
				      //				     element.widget = widget;
				      //				     element.actor.show();
				      //				     return elements.put(element);
				      //return elements.take(id).control;				     

				      /*
				       * DND destination constructor
				       */
				      destination : function(comp_element, options, target_list, action_after){
					  this.element;
					  //data, leave, motion, drop
					  print('ulalal');
					  this.on = function(){
					      
					  };
					  this.destroy = function(){
					  };
				      }
				      //
				      //				     var element = elements.take(id);
				      //				     element.actor.unref();
				      //				     element.widget.unref();
				      //				     elements.free(id);
				      //				 }
			     });
}

comp.manager.add(dnd);    
//    print('la', JSON.stringify(comp.manager), 'ho', comp.element_proto, 'dra');

