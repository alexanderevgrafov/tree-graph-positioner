import React from 'react-mvx'
import {createContext, useState} from 'react'
import {Record, define, predefine, shared, type} from 'type-r'

import {Controls} from './Controls';
import {Canvas} from './Canvas';

import {AppState} from './AppState'


//const DragContext = createContext(null);

@define
export class Application extends React.Component {
  static state = AppState;

  render() {
    return <>
      <Canvas state={this.state}/>
      <Controls state={this.state}/>
    </>
  }
}

// export const Application = ()=> {
//   const [state] = useState(new AppState())
//
//   return <StateContext.Provider value={state}>
//     <Canvas/>
//     <Controls/>
//   </StateContext.Provider>
// };
