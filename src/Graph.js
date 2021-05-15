import {define, predefine, Record, shared} from 'type-r';

const jsonData = require('../data/test_data.json');

const FLEXIBILITY = 3; // small value - quick and unstable - large - slower nodes but stable result

@predefine
class LinkModel extends Record {
}

@define
class NodeModel extends Record {
  static attributes = {
    id: '',
    name: '',
    radius: 1,
    x: 0,
    y: 0,
    links: LinkModel.Collection.Refs,
    fixed: false,
  }

  __nx = 0;
  __ny = 0;

  parse(json) {
    json.radius = json.r || json.d / 2 || 10;

    return json;
  }

  calcNewPos(addRandom) {
    let dx = 0;
    let dy = 0;

    this.links.each(joint => {
      const tension = joint.tension / (2 * FLEXIBILITY);  // *2 because tension shared between both sides of the joint
      const p = joint.n1 === this ? joint.n2 : joint.n1;

      dx += (this.x - p.x) * tension;
      dy += (this.y - p.y) * tension;
    })

    this.__nx = this.x + dx + (addRandom ? Math.random() : 0);
    this.__ny = this.y + dy + (addRandom ? Math.random() : 0);
  }

  changePos() {
    if (!this.fixed) {
      this.x = this.__nx;
      this.y = this.__ny;
    }
  }
}

LinkModel.define({
  attributes: {
    n1: shared(NodeModel),
    n2: shared(NodeModel),
    w: 0,
    type: '',
  },

  get length() {
    const {n1, n2} = this;

    if (!n1 || !n2) {
      return 0;
    }

    const {x: x1, y: y1, radius: r1} = n1;
    const {x: x2, y: y2, radius: r2} = n2;

    return Math.max(0, Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - r1 - r2);
  },

  get tension() {
    const len = this.length;

    if (!len || this.w === len) {
      return 0;
    }

    return (this.w - len) / len;
  }
})

@define
export class GraphModel extends Record {
  static attributes = {
    nodes: NodeModel.Collection,
    links: LinkModel.Collection,
    addRandom: true,
  }

  init() {
    this.transaction(() => {
      this.nodes.reset(jsonData.nodes);

      _.each(jsonData.links, link => {
        const n1 = this.nodes.get(link.n1);
        const n2 = this.nodes.get(link.n1);

        if (n1 && n2) {
          this.links.add({...link, n1, n2});
        } else {
          console.error('Link', link, 'node(s) not found:', n1, n2)
        }
      })

      this.nodes.each(node => {
        const relatedLinks = this.links.filter(link => link.n1 === node || link.n2 === node);

        if (!relatedLinks > length) {
          console.warn('Node', node, 'has no related links')
        } else {
          node.links.reset(relatedLinks);
        }
      })
    });
  }

  iterator() {
    this.transaction(() => {
      _.each(this.nodes, node => node.calcNewPos(this.addRandom));
      _.each(this.nodes, node => node.changePos());
    })
  }
}
