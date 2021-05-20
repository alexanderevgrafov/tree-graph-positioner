import React from 'react-mvx'
import {define} from 'type-r'
import {Controls} from './Controls';
import {Canvas} from './Canvas';
import {AppState} from './AppState'

@define
export class Application extends React.Component {
  static state = AppState;

  render() {
    return <div id='wrapper'>
      <Canvas state={this.state}/>
      <Controls state={this.state}/>
    </div>
  }
}
