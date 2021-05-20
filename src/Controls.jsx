import React from 'react-mvx'

const DELTA_ZOOM = 0.1

export const Controls = ({state: s}) => <div id='controls'>
  <button  onClick={e =>s.stopped = !s.stopped}>Simulation [{s.stopped ? 'n' : 'y'}]</button>
  { s.stopped ?
    <button  onClick={e =>s.graph.iterator()}>Step</button> : null
  }
  <button onClick={e =>s.transform.zoom *= 1 + DELTA_ZOOM*(e.shiftKey ? -1:1)}>Zoom [{Math.round(s.transform.zoom*100)/100}]</button>
  <button onClick={e =>s.graph.addRandom = !s.graph.addRandom}>Random [{s.graph.addRandom ? 'y' : 'n'}]</button>
  <button onClick={e =>s.graph.showDelta = !s.graph.showDelta}>{s.graph.showDelta ? 'Show len' : 'Show delta'}</button>
  <button onClick={e=>s.makeLsSnap()}>LS Snap</button>
  <button onClick={e=>s.loadLsSnap()}>LS load</button>
  <button onClick={e=>s.graph.makeChaos()}>Chaos</button>

  [{Math.round(s.transform.dx)} x {Math.round(s.transform.dy)}]

  </div>
