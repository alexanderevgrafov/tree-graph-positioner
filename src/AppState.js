import React from 'react-mvx';
import {define, Record, type} from 'type-r';
import {GraphModel} from './Graph';
import {createContext} from 'react';
import {transform} from 'type-r/lib/object-plus/tools';

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
    this.loadLsSnap();
  }

  onStartStop() {
    clearInterval(this.cycleInterval);

    if (!this.stopped) {
      this.cycleInterval = setInterval(() => this.graph.iterator(), 200);
    }
  }

  makeLsSnap() {
    const nodesSnap = this.graph.nodes.map(node => [node.id, node.x, node.y]);
    const transformSnap = this.transform.toJSON();
    localStorage.setItem('tp_nodes', JSON.stringify(nodesSnap));
    localStorage.setItem('tp_transform', JSON.stringify(transformSnap));
  }

  loadLsSnap() {
    try {
      const data = JSON.parse(localStorage.getItem('tp_nodes'));
      const transform = JSON.parse(localStorage.getItem('tp_transform'));

      _.each(data, line => {
        const node = this.graph.nodes.get(line[0]);
        if (node) {
          node.x = line[1];
          node.y = line[2];
        }
      })

      this.transform.set(transform);

    } catch (e) {
      alert('ERROR: ' + e)
    }
  }
}

export const StateContext = createContext(null);
export const TransformContext = createContext(null);
