import {define, predefine, Record, shared} from 'type-r';
import {getLinkForce} from './LinkForce';
const jsonData = require('../data/trees_02.json');
//const jsonData = require('../data/test_data.json');


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
    debugJsx: null,
  }

  get radius(){
    return this.d / 2;
  }
  __nx = 0;
  __ny = 0;


  calcNewPos(addRandom, relatedLinks) {
    let dx = 0;
    let dy = 0;

    _.each(relatedLinks, link => {
      const force = getLinkForce(link, this);

      if (force) {
        dx += force.x;
        dy += force.y;
      }
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
    add:'',
    ref: shared(LinkModel),
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
    addRandom: false,
    showDelta:false,
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

      this.links.each(link => {
        if (link.add) {
          const refIds = link.add.split('-');
          const ref = this.links.find(link=>(link.n1.id===refIds[0]&&link.n2.id===refIds[1])||(link.n1.id===refIds[1]&&link.n2.id===refIds[0]));
          if (ref) {
            link.ref = ref;
          }
        }
      })
    });
  }

  iterator() {
    this.transaction(() => {
      this.nodes.each(node => {
        const relatedLinks = this.links.filter(link => link.n1 === node || link.n2 === node);
        node.calcNewPos(this.addRandom, relatedLinks)
      });
      this.nodes.each(node => node.changePos());
    })
  }

  makeChaos(){
    this.nodes.each(node => [node.x, node.y] = [ Math.random()*1000,Math.random()*1000]);
  }
}
