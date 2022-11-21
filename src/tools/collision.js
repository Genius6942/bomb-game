/**
 * returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
 * @param {{ x: number, y: number }} x1
 * @param {{ x: number, y: number }} y1
 * @param {{ x: number, y: number }} x2
 * @param {{ x: number, y: number }} y2
 * @returns
 */
const lineIntersects = (
  { x: a, y: b },
  { x: c, y: d },
  { x: p, y: q },
  { x: r, y: s }
) => {
  let det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
};

/**
 * @param {{ x: number, y: number, width: number, height: number}} rect
 */
const verticesFromRect = ({ x, y, width, height }) => {
  return [
    // top left
    {
      x: x - width / 2,
      y: y - height / 2,
    },
    // top right
    {
      x: x + width / 2,
      y: y - height / 2,
    },
    // bottom right
    {
      x: x + width / 2,
      y: y + height / 2,
    },
    // bottom left
    {
      x: x - width / 2,
      y: y + height / 2,
    },
  ];
};

/**
 *
 * @param {[{ x: number, y: number }, { x: number, y: number }, { x: number, y: number }]} triangle
 * @param {{ x: number, y: number, width: number, height: number}} rect
 */
const triangleRectIntersection = (triangle, rect) => {
  const rectPoints = verticesFromRect(rect);
  console.log(rectPoints);

  for (const triangleLine of [
    [triangle[0], triangle[1]],
    [triangle[1], triangle[2]],
    [triangle[2], triangle[0]],
  ]) {
    for (const rectangleLine of [
      [rectPoints[0], rectPoints[1]],
      [rectPoints[1], rectPoints[2]],
      [rectPoints[2], rectPoints[3]],
      [rectPoints[3], rectPoints[0]],
    ]) {
      if (
        lineIntersects(
          triangleLine[0],
          triangleLine[1],
          rectangleLine[0],
          rectangleLine[1]
        )
      )
        return true;
    }
  }

  return false;
};
