import React from 'react-mvx'
import {useContext} from 'react';
import {StateContext} from './AppState';

/*

const FLEXIBILITY = 3; // small value - quick and unstable - large - slower nodes but stable result
const OriginalJson = require('../data/trees.json');

const convert = (x, pres) => !pres ? Math.round(x / 10) : Math.round(x * pres / 10) / pres;
const reConvert = x => x * 10;

let json = OriginalJson;
let stopped = false;
let addRandom = true;
const defaultTrans = {
  zoom:1,
  dx:0,
  dy:0,
  rot:0,
};
const trans = defaultTrans;

class Node {
  constructor(graph, obj) {
    Object.assign(this, obj);

    this.graph = graph;

    this.x = this.x || 250 //+ (Math.random() * 1000 - 500);
    this.y = this.y || 250 //+ (Math.random() * 1000 - 500);

    this.radius = this.r || this.d / 2 || 10;

    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttributeNS(null, 'class', 'node');
    let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.textContent = this.name || this.id;
    circle.setAttributeNS(null, 'r', convert(this.radius));
    group.appendChild(circle)
    group.appendChild(text)
    this.elem = group;
    this.graph.canvasNodes.appendChild(this.elem);

    group.onclick = e => {
      this.fixed = !this.fixed;
      this.elem.setAttributeNS(null, 'class', 'node' + (this.fixed ? ' fixed' : ''));
    }

    group.onmousedown = () => this.graph.clicked = this;
  }

  calcNewPos() {
    const joints = this.getLinks();
    let dx = 0;
    let dy = 0;

    _.each(joints, joint => {
      const tension = joint.tension() / (2 * FLEXIBILITY);  // *2 because tension shared between both sides of the joint
      const p = joint.p1 === this ? joint.p2 : joint.p1;

      dx += (this.x - p.x) * tension;
      dy += (this.y - p.y) * tension;
    })

    this.__nx = this.x + dx + (addRandom ? Math.random() : 0);
    this.__ny = this.y + dy + (addRandom ? Math.random() : 0);
  }

  getLinks() {
    return this.graph.links.filter(link => link.p1 === this || link.p2 === this);
  }

  changePos() {
    if (!this.fixed) {
      this.x = this.__nx;
      this.y = this.__ny;
    }
  }

  render() {
    let circle = this.elem.getElementsByTagName('circle')[0];

    if (circle) {
      let text = this.elem.getElementsByTagName('text')[0];

      circle.setAttributeNS(null, 'cx', convert(this.x));
      circle.setAttributeNS(null, 'cy', convert(this.y));

      if (text) {
        text.setAttributeNS(null, 'x', convert(this.x));
        text.setAttributeNS(null, 'y', convert(this.y));
      }
    }
  }
}

class Link {
  constructor(graph, obj) {
    Object.assign(this, obj);

    this.graph = graph;

    this.p1 = graph.getNode(this.n1);
    this.p2 = graph.getNode(this.n2);

    const uid = 'ppp' + this.n1 + '__' + this.n2;

    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttributeNS(null, 'class', 'link');

    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//    let textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
    line.setAttributeNS(null, 'stroke', 'pink');
    line.setAttributeNS(null, 'id', uid);
//    textPath.setAttributeNS(null, 'href', '#' + uid);
//    textPath.textContent = uid;
//    text.appendChild(textPath)
    group.appendChild(line)
    group.appendChild(text)
    this.elem = group;
    this.graph.canvasLinks.appendChild(this.elem);
  }

  length() {
    return Math.max(0, Math.sqrt((this.p1.x - this.p2.x) * (this.p1.x - this.p2.x) + (this.p1.y - this.p2.y) * (this.p1.y - this.p2.y))
      - this.p1.radius - this.p2.radius);
  }

  tension() {
    const len = this.length();

    if (!len || this.w === len) {
      return 0;
    }

    return (this.w - len) / len;
  }

  render() {
    let line = this.elem.getElementsByTagName('line')[0];

    if (line) {
      let text = this.elem.getElementsByTagName('text')[0];

      line.setAttributeNS(null, 'x1', convert(this.p1.x));
      line.setAttributeNS(null, 'y1', convert(this.p1.y));
      line.setAttributeNS(null, 'x2', convert(this.p2.x));
      line.setAttributeNS(null, 'y2', convert(this.p2.y));

      if (text) {
        text.setAttributeNS(null, 'x', convert((this.p2.x + this.p1.x) / 2));
        text.setAttributeNS(null, 'y', convert((this.p2.y + this.p1.y) / 2));
        text.textContent = convert(this.length(), 10);
      }
    }
  }
}

class Graph {
  constructor(canvas) {
    const pt = canvas.createSVGPoint();

    this.nodes = [];
    this.links = [];

    this.canvasNodes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.canvasNodes.setAttributeNS(null, 'class', 'nodes');
    this.canvasLinks = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.canvasLinks.setAttributeNS(null, 'class', 'links');

    canvas.appendChild(this.canvasLinks);
    canvas.appendChild(this.canvasNodes);

    canvas.onmouseleave = () => {
      this.clicked = null;
      console.log('canvas out');
    }
    canvas.onmouseup = () => {
      this.clicked = null;
      console.log('mouse up');
    }

    canvas.onmousemove = e => {
      if (this.clicked) {
        pt.x = e.clientX;
        pt.y = e.clientY;
        let svgP = pt.matrixTransform(canvas.getScreenCTM().inverse());

        this.clicked.x = reConvert(svgP.x);
        this.clicked.y = reConvert(svgP.y);

        console.log('[' + e.clientX + 'x' + e.clientY + '] --> [' + this.clicked.x + 'x' + this.clicked.y + ']');

        this.clicked.render();
      }
    }
  }

  addNode(obj) {
    let node = new Node(this, obj);
    this.nodes.push(node);
  }

  addLink(obj) {
    let link = new Link(this, obj);
    this.links.push(link);
  }

  getNode(id) {
    return _.find(this.nodes, node => node.id === id);
  }

  flexTick() {
    _.each(this.nodes, node => node.calcNewPos());
    _.each(this.nodes, node => node.changePos());
  }

  render() {
    _.each(this.links, link => link.render());
    _.each(this.nodes, node => node.render());
  }
}

const graph = new Graph(document.getElementById('canvas'));

function nextStep() {
  graph.flexTick()
  graph.render();

  if (!stopped) {
    startStep();
  }
}

function startStep() {
  setTimeout(nextStep, 200);
}

const DELTA_MOVE=50;

(function () {
  _.each(json.nodes, node => {
    graph.addNode(node);
  })
  _.each(json.links, link => {
    graph.addLink(link);
  })

  graph.render();
  startStep();

  _.each(buttonHandlers, (fn, key)=>{
    $('#' + key).click(fn)
  })
})();

*/

const DELTA_MOVE = 5;
const DELTA_ROT = 2;
const DELTA_ZOOM = 0.1

const hndl = [
  ['addrandom', 'Add Rand', s => s.graph.addRandom = !s.graph.addRandom],
  ['zoom_in', 'Zoom IN', s => s.t_zoom *= 1 + DELTA_ZOOM],
  ['zoom_out', 'Zoom Out', s => s.t_zoom *= 1 - DELTA_ZOOM],
  ['m_up', 'UP', s => s.t_dy -= DELTA_MOVE],
  ['m_down', 'Down', s => s.t_dy += DELTA_MOVE],
  ['m_left', 'Left', s => s.t_dx += DELTA_MOVE],
  ['m_right', 'Right', s => s.t_dx -= DELTA_MOVE],
  ['r_cw', 'CW', s => s.t_rot -= DELTA_ROT],
  ['r_ccw', 'CCW', s => s.t_rot += DELTA_ROT],
]

export const Controls = () => {
  const s = useContext(StateContext);

  return <>
    <button className='pause' onClick={e =>{
      s.stopped = !s.stopped;
    }}>{s.stopped ? 'Stopped' : 'Simulating'}</button>
    {_.map(hndl, ([id, name, cb]) => <button key={id} className={id} onClick={e => cb(s, e)}>{name}</button>)}
  </>
}
