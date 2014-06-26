using Gtk;

class Demo : GLib.Object{
  public static int main(string[] args){
    var pipe = new Pipe({"mplayer", "-slave", "/home/ix/Загрузки/Pyatyi_element_HDRip_Gavrilov.avi"}, "");
    //    pipe.on_out((st) => { stdout.printf(st); });
    pipe.spawn();
    Timeout.add(5000, () => { pipe.in("pause\n");return false; });
    Gtk.main();
    return 0;
  }
}

class Pipe : GLib.Object{
  private string[] _argv;
  private string _work_dir;
  private IOChannel output;
  private IOChannel input;
  private Pid child_pid;
  private outfunc _on_out = (str) => { stdout.printf("out stub" + str);};
  
  public Pipe(string[] argv,  string working_directory){
    _argv = argv;
    _work_dir = working_directory;
  }

  public bool spawn(){
    string[] env = Environ.get();
    
    int cin, cout, cerr;
    try{
      Process.spawn_async_with_pipes(null, _argv, env, GLib.SpawnFlags.SEARCH_PATH, null, out child_pid, out cin, out cout, out cerr);
    } catch(SpawnError e){
      return false;
    }

    ChildWatch.add (child_pid, (pid, status) => {
	Process.close_pid (pid);
      });
    input = new IOChannel.unix_new(cin);
    output = new IOChannel.unix_new(cout);
    output.add_watch(IOCondition.IN | IOCondition.HUP, (channel, condition) => {
	if(condition == IOCondition.HUP)
	  return false;
	if(condition == IOCondition.IN){
	  string line;
	  try{
	    channel.read_line(out line, null, null);
	  } catch (IOChannelError e){
	  }
	  _on_out(line);
	}
	return true;
    });
    return true;
  }

  public void in(string str){
    size_t written;
    try{
      input.write_chars((char[])str.data, out written);
      input.flush();
    } catch(IOChannelError ioe){
    }
  }

  public delegate void outfunc(string str);

  public void on_out(outfunc callback){
    _on_out = callback;
  }

  public void destroy(){
    Process.close_pid(child_pid);
  }
}

