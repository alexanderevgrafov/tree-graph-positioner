const FLEXIBILITY = 3;

function regular(link, node, p) {
  const tension = link.tension() / (2 * FLEXIBILITY);  // *2 because tension shared between both sides of the link

  return {x: (node.x - p.x) * tension, y: (node.y - p.y) * tension}
}

function hor(link, node, p) {
  return {x: 0, y: (p.y - node.y) / 10}
}

function vert(link, node, p) {
  return {x: (p.x - node.x) / 10, y: 0}
}

function getPointProjection(l1,l2,p) {
  const {x: x1, y: y1} = l1;
  const {x: x2, y: y2} = l2;
  const {x: a, y: b} = p;
  const delta = (y2 - y1) / (x2 - x1);
  const x = (b + a / delta + delta * x1 - y1) / (1 / delta + delta)
  const y = delta * (x - x1) + y1;

  return {x,y}
}

function lined(link, node, p) {
  try {
    const {ref} = link
    const {x,y} = getPointProjection(ref.n1,ref.n2,node);

    return {x: (x - node.x) / 10, y: (y - node.y) / 10}
  } catch (e) {
    return {x: 0, y: 0};
  }
}

function deg90(link, node, p) {
  try {
    const mp = {x:(node.x+p.x)/2, y:(node.y+p.y)/2};
    const {ref} = link
    const mproj = getPointProjection(ref.n1,ref.n2,mp);
    const {x,y} = getPointProjection(mp,mproj,node);

    return {x: (x - node.x) / 10, y: (y - node.y) / 10}
  } catch (e) {
    return {x: 0, y: 0};
  }
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
