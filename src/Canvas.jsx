import React from 'react-mvx'
import {createContext, useContext, useState, useEffect, useRef} from 'react'
import {TransformContext} from './AppState'

const convert = (x, pres) => !pres ? Math.round(x / 10) : Math.round(x * pres / 10) / pres;
const transfer = (x, y) => {
  const t = useContext(TransformContext);
  return [t.dx + x * t.zoom, t.dy + y * t.zoom];
};
const transferBack = (x, y, t) => {
  return [(x - t.dx) / t.zoom, (y - t.dy) / t.zoom];
}

const DragContext = createContext(null);

const Node = ({obj}) => {
  const setDragged = useContext(DragContext);
  const [x, y] = transfer(obj.x, obj.y);

  return <g className="node"
            onDoubleClick={e => obj.fixed = !obj.fixed}
            onMouseDown={e => {
              setDragged(obj);
              e.stopPropagation();
            }}
  >
    <circle cx={x} cy={y} r={obj.radius / 10}/>
    <text x={x + 3} y={y - 3}>{obj.name || obj.id}</text>
    {obj.dragged ? <circle cx={x} cy={y} r={obj.radius / 5} fill="none" stroke="red"/> : null}
    {obj.fixed ? <circle cx={x} cy={y} r={obj.radius / 5} fill="#ffff0050" stroke="none"/> : null}
  </g>
}
const Link = ({obj}) => {
  const {n1, n2} = obj;
  const text = convert(obj.length(), 10);
  const [x1, y1] = transfer(n1.x, n1.y);
  const [x2, y2] = transfer(n2.x, n2.y);

  return <g className="link">
    <line x1={x1} x2={x2} y1={y1} y2={y2}/>
    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2}>{text}</text>
  </g>;
}


const Graph = ({graph}) =>
  <g>
    {graph.links.map((link, i) => <Link obj={link} key={i}/>)}
    {graph.nodes.map((node, i) => <Node obj={node} key={i}/>)}
  </g>

export const Canvas = ({state}) => {
  const canvasEl = useRef();
  const [clicked, setDragNode] = useState(null);
  const [canvasDrag, setCanvasDrag] = useState(null);
  const {graph} = state;
  let pt;

  useEffect(() => {
    pt = canvasEl.current.createSVGPoint();
  })

  function setDragged(node) {
    if (node) {
      node.dragged = true;
      setDragNode(node);
    } else {
      if (clicked) {
        clicked.dragged = false
        setDragNode(null);
      }
    }
  }

  function stopDrag() {
    setDragged();
    setCanvasDrag(null);
  }

  return <div id="canvas-box">
    <svg id="canvas" ref={canvasEl} viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg"
         onMouseLeave={stopDrag}
         onMouseUp={stopDrag}
         onMouseDown={e => setCanvasDrag([e.clientX, e.clientY])}
         onMouseMove={e => {
           if (clicked) {
             pt.x = e.clientX;
             pt.y = e.clientY;
             let svgP = pt.matrixTransform(canvas.getScreenCTM().inverse());

             [clicked.x, clicked.y] = transferBack(svgP.x, svgP.y, state.transform);
             //    console.log('[' + e.clientX + 'x' + e.clientY + '] --> [' + clicked.x + 'x' + clicked.y + ']');
           } else if (canvasDrag) {
            // const [dx, dy] = transferBack(e.clientX - canvasDrag[0], e.clientY - canvasDrag[1], state.transform);
             const [dx, dy] = [e.clientX - canvasDrag[0], e.clientY - canvasDrag[1]];
             const {zoom} = state.transform;
             state.transform.dx += dx*zoom;
             state.transform.dy += dy*zoom;
             setCanvasDrag([e.clientX, e.clientY]);
           }
         }}
    >
      <DragContext.Provider value={setDragged}>
        <TransformContext.Provider value={state.transform}>
          <Graph graph={graph}/>
        </TransformContext.Provider>
      </DragContext.Provider>
    </svg>
  </div>
}
