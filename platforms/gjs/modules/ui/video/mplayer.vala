using Clutter;
using ClutterX11;

namespace mplayer{
  delegate void element_adder(element elem);
  delegate void timeupdate();

  class info {
    string source;
  }
  
  class element : GLib.Gobject {
    public Clutter.Actor actor;
    
    public void play(){};
    public void pause(){};
    public void set_position(int msecond){};
    public int get_position(){};
    public int get_duration(){};
    public int get_volume(){};
    public void set_volume(int volume){};
    public void on_timeupdate(timeupdate callback){};
  }

  public player create(info _info, element_adder adder){
    var elem = new element(_info);
    adder(elem);
  }
}
 
