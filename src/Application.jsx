import React from 'react-mvx'
import {Record, define, predefine, shared, type} from 'type-r'

import {Controls} from './Controls';
import {Canvas} from './Canvas';
import {GraphModel} from './Graph';

@define
export class AppState extends Record {
  static attributes = {
    stopped: type(Boolean).value(true).watcher('onStartStop'),
    t_zoom: 1,
    t_dx: 0,
    t_dy: 0,
    t_rot: 0,
    graph: GraphModel,
  }


  cycleInterval = null;

  constructor() {
    super();

    setTimeout(()=>this.graph.init(), 5000);

    //this.onStartStop();
  }

  onStartStop() {
    clearInterval(this.cycleInterval);

    if (!this.stopped) {
      this.cycleInterval = setInterval(() => this.graph.iterator(), 200);
    }
  }
}

@define
export class Application extends React.Component {
  static state = AppState;

  render() {
    return <>
      <Canvas state={this.state}/>
      <Controls state={this.state}/>
    </>;
  }
}
