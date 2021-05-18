const FLEXIBILITY = 3;

function regular(link, node, p) {
  const tension = link.tension() / (2 * FLEXIBILITY);  // *2 because tension shared between both sides of the link

  return {x: (node.x - p.x) * tension, y: (node.y - p.y) * tension}
}

function hor(link, node, p) {
  return {x: 0, y: (p.y - node.y) / 10}
}

function vert(link, node, p) {
  return {x: (p.x - node.x) / 10, y:0}
}

function lined(link, node, p) {
  // try {
  //   const add = link.add.split('-');
  //   const links = link.getOwner();
  //   const refLink = links.find(link=>)
  //   return {x: (p.x - node.x) / 10, y:0}
  // } catch(e) {
    return {x:0,y:0};
//  }
}

function deg90(link, node, p) {
  // try {
  //   const add = link.add.split('-');
  //   const links = link.getOwner();
  //   const refLink = links.find(link=>)
  //   return {x: (p.x - node.x) / 10, y:0}
  // } catch(e) {
  return {x:0,y:0};
//  }
}

const linkTypes = {
  hor,
  vert,
  lined,
  deg90,
  regular
}

export function getLinkForce(link, node) {
  const {type} = link;
  const res = {x: 0, y: 0};
  const opositeNode = link.n1 === node ? link.n2 : link.n1;

  if (type) {
    const func = linkTypes[type];

    if (func) {
      const special = func(link, node, opositeNode);

      res.x += special.x;
      res.y += special.y;
    }
  }

  if (link.weight) {
    const regular = linkTypes.regular(link, node, opositeNode);

    res.x += regular.x;
    res.y += regular.y;
  }

  return res;
}
