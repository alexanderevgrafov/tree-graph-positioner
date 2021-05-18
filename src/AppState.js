import React from 'react-mvx';
import {define, Record, type} from 'type-r';
import {GraphModel} from './Graph';
import {createContext} from 'react';

@define
export class TransformModel extends Record {
  static attributes = {
    zoom: .1,
    dx: 250,
    dy: 100,
  }
}

@define
export class AppState extends Record {
  static attributes = {
    stopped: type(Boolean).value(false).watcher('onStartStop'),
    transform: TransformModel,
    graph: GraphModel,
  }

  links = {}

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

export const StateContext = createContext(null);
export const TransformContext = createContext(null);
