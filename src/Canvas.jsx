import React from 'react-mvx'
import {createContext, useContext, useState, useEffect, useRef} from 'react'
import {TransformContext} from './AppState'
import cx from 'classnames'

const convert = (x, pres=10) =>  Math.round(x * pres) / pres;
export const transfer = (x, y) => {
  const t = useContext(TransformContext);
  return [t.dx + x * t.zoom, t.dy + y * t.zoom];
};
export const transferBack = (x, y, t) => {
  return [(x - t.dx) / t.zoom, (y - t.dy) / t.zoom];
}

const DragContext = createContext(null);

const Node = ({obj}) => {
  const setDragged = useContext(DragContext);
  const t = useContext(TransformContext);
  const {x,y,radius,dragged,fixed, name,id} = obj;
  const [tx, ty] = transfer(x, y);
  const r = radius * t.zoom;

  let debugLine = null;

  if (obj.debugJsx) {
    const [a,b,tx,ty] = obj.debugJsx;
    const [dx1,dy1] = transfer(a,b);
    const [dx2,dy2] = transfer(tx,ty);

    debugLine = <><line x1={dx1} y1={dy1} x2={dx2} y2={dy2} stroke='blue' width=".3"/><circle cx={dx2} cy={dy2} r={5} fill='none' stroke='red'/></>
  }

  return <g className={cx("node",{dragged,fixed})}
            onDoubleClick={e => obj.fixed = !fixed}
            onMouseDown={e => {
              setDragged(obj);
              e.stopPropagation();
            }}
  >
    <circle cx={tx} cy={ty} r={r}/>
    <text x={tx + 1} y={ty - 1}>{name || id}</text>
    { debugLine }
  </g>
}
const Link = ({obj, showDelta}) => {
  const {n1, n2} = obj;
  const text = convert(showDelta ? obj.tension()*obj.length() : obj.length(), 1);
  const [x1, y1] = transfer(n1.x, n1.y);
  const [x2, y2] = transfer(n2.x, n2.y);

  return <g className="link">
    <line x1={x1} x2={x2} y1={y1} y2={y2}/>
    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2}>{text}</text>
  </g>;
}

const Graph = ({graph}) =>
  <g>
    {graph.links.map((link, i) => <Link obj={link} showDelta={graph.showDelta} key={i}/>)}
    {graph.nodes.map((node, i) => <Node obj={node} key={i}/>)}
  </g>

export const Canvas = ({state}) => {
  const canvasEl = useRef();
  const [clicked, setDragNode] = useState(null);
  const [canvasDrag, setCanvasDrag] = useState(null);
  const {graph} = state;

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
             let pt = canvasEl.current.createSVGPoint();
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
