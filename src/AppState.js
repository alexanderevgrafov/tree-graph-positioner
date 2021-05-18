import React from 'react-mvx';
import {define, Record, type} from 'type-r';
import {GraphModel} from './Graph';


@define
export class AppState extends Record {
  static attributes = {
    stopped: type(Boolean).value(false).watcher('onStartStop'),
    t_zoom: 1,
    t_dx: 0,
    t_dy: 0,
    t_rot: 0,
    graph: GraphModel,
  }

  cycleInterval = null;

  constructor() {
    super();

    //setTimeout(()=>this.graph.init(), 500);
    this.graph.init()

    this.onStartStop();
  }

  onStartStop() {
    clearInterval(this.cycleInterval);

    if (!this.stopped) {
      this.cycleInterval = setInterval(() => this.graph.iterator(), 200);
    }
  }
}

export const StateContext = React.createContext(null);
