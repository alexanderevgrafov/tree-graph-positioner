import React from 'react-mvx'
import {Record, define, type} from 'type-r'

import {Controls} from './Controls';
import {Canvas} from './Canvas';
import {iterator} from './iterator';

@define
export class LinkModel extends Record {
  static attributes = {
    n1: 0,
    n2: 0,
    w: 0,
  }
}

@define
export class NodeModel extends Record {
  static attributes = {
    id: 0, name: '', d: 1,
  }
}

@define
export class GraphModel extends Record {
  static attributes = {
    nodes: NodeModel.Collection,
    links: LinkModel.Collection,
  }
}

@define
export class AppState extends Record {
  static attributes = {
    stopped: false,
    addRandom: true,
    t_zoom: 1,
    t_dx: 0,
    t_dy: 0,
    t_rot: 0,
    graph: GraphModel,
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
