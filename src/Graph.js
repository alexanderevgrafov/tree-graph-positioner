import {define, predefine, Record, shared} from 'type-r';

const jsonData = require('../data/trees_02.json');

const FLEXIBILITY = 3; // small value - quick and unstable - large - slower nodes but stable result

@predefine
export class LinkModel extends Record {
}

@define
export class NodeModel extends Record {
  static attributes = {
    id: '',
    name: '',
    d: 1,
    type: '',
    x: 0,
    y: 0,
    links: LinkModel.Collection.Refs,
    fixed: false,
    dragged: false,
  }

  get radius(){
    return this.d / 5;
  }
  __nx = 0;
  __ny = 0;

  parse(json) {
    json.radius = json.r || json.d / 2 || 10;

    return json;
  }

  calcNewPos(addRandom) {
    const relatedLinks = this.getOwner().links.filter(link => link.n1 === this || link.n2 === this);
    let dx = 0;
    let dy = 0;

    _.each(relatedLinks, joint => {
      const tension = joint.tension() / (2 * FLEXIBILITY);  // *2 because tension shared between both sides of the joint
      const p = joint.n1 === this ? joint.n2 : joint.n1;

      dx += (this.x - p.x) * tension;
      dy += (this.y - p.y) * tension;
    })

    this.__nx = this.x + dx + (addRandom ? Math.random() : 0);
    this.__ny = this.y + dy + (addRandom ? Math.random() : 0);
  }

  changePos() {
    if (!this.fixed && !this.dragged) {
      this.x = this.__nx;
      this.y = this.__ny;
    }
  }
}

LinkModel.define({
  attributes: {
    n1: shared(NodeModel),
    n2: shared(NodeModel),
    weight: 0,
    type: '',
  },
  length() {
    const {n1, n2} = this;

    if (!n1 || !n2) {
      return 0;
    }

    const {x: x1, y: y1, radius: r1} = n1;
    const {x: x2, y: y2, radius: r2} = n2;

    return Math.max(0, Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - r1 - r2);
  },
  tension() {
    const len = this.length();

    if (!len) {
      return 1;
    }

    return (this.weight - len) / len;
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
        const n2 = this.nodes.get(link.n2);

        if (n1 && n2) {
          this.links.add({...link, n1, n2});
        } else {
          console.error('Link', link, 'node(s) not found:', n1, n2)
        }
      })

      // this.nodes.each(node => {
      //
      //   if (!relatedLinks.length) {
      //     console.warn('Node', node.id, 'has no related links')
      //   } else {
      //     node.links.add(relatedLinks.map(link=>link.id));
      //   }
      // })
    });
  }

  iterator() {
    this.transaction(() => {
      this.nodes.each(node => node.calcNewPos(this.addRandom));
      this.nodes.each(node => node.changePos());
    })
  }
}
