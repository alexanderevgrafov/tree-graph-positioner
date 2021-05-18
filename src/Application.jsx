import React from 'react-mvx'
import {useState} from 'react'
import {Record, define, predefine, shared, type} from 'type-r'

import {Controls} from './Controls';
import {Canvas} from './Canvas';

import {StateContext, AppState} from './AppState'


//
// @define
// export class ApplicationOld extends React.Component {
//   static state = AppState;
//
//
//
//   render() {
//     return <>
//       <Canvas state={this.state}/>
//       <Controls state={this.state}/>
//     </>;
//   }
// }

export const Application = ()=> {
  const [state] = useState(new AppState())

  return <StateContext.Provider value={state}>
    <Canvas/>
    <Controls/>
  </StateContext.Provider>
};
