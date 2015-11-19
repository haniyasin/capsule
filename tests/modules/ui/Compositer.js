var DEBUG = 1;

function slideup_cubes_test(comp){
    var image = new comp.image({ x : "2%", y : "2%", width : "20%", height : "20%", opacity : 1});
    comp.root.add(image);
    var green = new comp.image({ x : "3%", y : "10%", width : "20%", height : "30%", opacity : 1,
				 source : require('images/green')});
    comp.root.add(green);
    var red = new comp.image({ x : "20%", y : "32%", width : "20%", height : "30%", opacity : 1,
				    source : require('images/red')});
    comp.root.add(red);
    var anim = new comp.anim([
				 {
				     duration : 1000,
				     actions : {
					 x : 30
				     }
				 },
				 {
				     duration : 1000,
				     actions : {
					 width : 20,
					 height : 20
				     }
				 },
				 {
				     duration : 500,
				     actions : {
					 y : -20
				     }
				 },
				 {
				     duration : 500,
				     actions : {
					 y : 20
				     }
				 },
				 {
				     duration : 1000,
				     actions : {
					 width : -20,
					 height : -20
				     }
				 },
				 {
				     duration : 1000,
				     actions : {
					 x : -30
				     }
				 }
			     ]);

    anim.bind(red);
    anim.bind(green);
    anim.start(red);
    anim.start(green);
    red.on('animation_stopped', function(){
	       anim.start(red);
	       anim.start(green);
	   });
}

function original_test2(comp){
    var frame = new comp.frame(
        {
            width : '25%',
            height : '25%',

            x : '0%',
            y : '0%',

            z_index : '1'
        }
    ),

    image_red = new comp.image(
        {
            width : '100%',
            height : '100%',

            x : '0%',
            y : '0%',

            z_index : '1',

            source : require('images/red')
        }
    ),

    image_green = new comp.image(
        {
            width : '80%',
            height : '80%',

            x : '10%',
            y : '10%',

            z_index : '2',

            source : require('images/green')
        }
    ),

    image_blue = new comp.image(
        {
            width : '60%',
            height : '60%',

            x : '20%',
            y : '20%',

            z_index : '3',

            source : require('images/blue')
        }
    ),

    anim = new comp.anim([
			     {
				 duration : 1000,
				 
				 actions :
				 {
				     x : 75
				 }
			     },
			     {
				 duration : 1000,
				 
				 actions :
				 {
				     y : 75
				 }
			     },
			     {
				 duration : 1000,
				 
				 actions :
				 {
				     x : -75
				 }
			     },
			     {
				 duration : 1000,
				 
				 actions :
				 {
				     y : -75
				 }
			     }
			 ]);

    anim.bind(frame);

    frame.on('animation_stopped', function(eventName, eventData){
		 anim.start(frame);
	     });

    frame.add(image_red);
    frame.add(image_green);
    frame.add(image_blue);
    comp.root.add(frame);

    anim.start(frame);
}

function original_test1(comp){
    var frame = new comp.frame(
        {
            width : '25%',
            height : '25%',

            x : '0%',
            y : '0%',

            z_index : '1'
        }
    ),

    image_red = new comp.image(
        {
            width : '100%',
            height : '100%',

            x : '0%',
            y : '0%',

            z_index : '1',

            source : require('images/red')
        }
    ),

    image_green = new comp.image(
        {
            width : '80%',
            height : '80%',

            x : '10%',
            y : '10%',

            z_index : '2',

            source : require('images/green')
        }
    ),

    image_blue = new comp.image(
        {
            width : '60%',
            height : '60%',

            x : '20%',
            y : '20%',

            z_index : '3',

            source : require('images/blue')
        }
    ),

    anim_right = new comp.anim([
				   {
				       duration : 0,
				       
				       actions :
				       {
					   x : 25
				       }
				   }
			       ]),

    anim_down = new comp.anim([
				  {
				      duration : 0,
				      
				      actions :
				      {
					  y : 25
				      }
				  }
			      ]),
    
    anim_left = new comp.anim([
				  {
				      duration : 0,
				      
				      actions :
				      {
					  x : -25
				      }
				  }
			      ]),

    anim_up = new comp.anim([
				{
				    duration : 0,
				    
				    actions :
				    {
					y : -25
				    }
				}
			    ]),
    
    animation = {
        counter : 0,
        animation : 0,

        animations :
        [
	    anim_right,
	    anim_down,
	    anim_left,
	    anim_up
        ],

        get : (function () {
                   if (this.counter++ === 3) {
                       this.counter = 1;

                       if (this.animation++ === 3) {
                           this.animation = 0;
                       }
                   }

                   return this.animations[this.animation];
               })
    };

    anim_right.bind(frame);
    anim_down.bind(frame);
    anim_left.bind(frame);
    anim_up.bind(frame);


    frame.on('pointer_down',function(eventData){
		 (animation.get()).start(frame);
	     });

    frame.add(image_red);
    frame.add(image_green);
    frame.add(image_blue);
    
    comp.root.add(frame);    
}

function create_move_remove_test(comp){    
    var rand = new comp.image({ x : 70, y : 10, width : 50, height : 50, opacity : 0.8, z_index : 1}),
    green = new comp.image({ width : '100%', height : '100%', opacity : 1, z_index : 1,
				source : require('images/green')}),
    text = new comp.text({ x : '10%', y : '5%', width : '80%', height : '90%', opacity : 0.9, text : 'haha'}),
    frame = new comp.frame( { x : '5%', y : '5%', width : '50%', height : '50%', opacity : 0.5, z_index : 2 }),
    frame_t = new comp.frame( { x : 40, y : 40, width : 50, height : 50, opacity : 0.8, z_index : 2 });
    frame_t.add(green);
    frame_t.add(text);

    var button = new comp.button( { x : 70, y : 60, width : 100, height : 50, z_index : 1, label : 'click' });
    button.on('press', function(){
		  print('button is pressed');
	      });
    var entry = new comp.entry( { x : 40, y : 100, width : 150, height : 30, placeholder : 'печатайте что-нибудь' });
    entry.on('text-change',function(){
		 print('text is changed');
	     });

    frame.add(rand);
    frame.add(frame_t); 
    frame.add(button);
    frame.add(entry);
    comp.frame.add(frame);

    var anim = new comp.anim([
				 {
				     duration : 500,
				     actions : {
					 y : 30,
					 x : 30,
					 width : 30,
					 height : 30
				     }
				 },
				 {
				     duration : 1000,
				     actions : {
					 y : 20,
					 x : -30,
					 width : 100,
					 height : 50
				     }
				 }
			     ]);

    frame_t.on('pointer_in', function(event_data){
		   print('in', JSON.stringify(event_data)); 
	       });
    frame_t.on('pointer_out', function(event_data){
		   print('in', JSON.stringify(event_data)); 
	       });
    frame_t.on('pointer_down', function(event_data){
		   print('in', JSON.stringify(event_data)); 
	       });
    frame_t.on('pointer_up', function(event_data){
		   print('in', JSON.stringify(event_data)); 
	       });

    var bind = anim_.ind(frame_t);
    bind.start();

    bind.on('animation_stopped', function(){
		comp.root.remove(frame);
		frame.destroy();
	    });
}

exports.test = function(){
    var comp = new (require('modules/ui/Compositer'));
    slideup_cubes_test(comp);   
    original_test2(comp);
    original_test1(comp);
//    create_move_remove_test(comp); //this test is depends of gjs
};