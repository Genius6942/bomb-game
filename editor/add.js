/**
 * @param {string} selected
 */
const addItem = (selected) => {
  if (![""].includes(selected)) {
    const cursorXOnGrid =
      cursor.x - blockSize / 2 - renderer.width / 2 + renderer.camera.pos.x;
    const cursorYOnGrid =
      cursor.y - blockSize / 2 - renderer.height / 2 + renderer.camera.pos.y;
    const itemX = Math.round(cursorXOnGrid / blockSize);
    const itemY = Math.round(cursorYOnGrid / blockSize);

    if (selected.startsWith("block")) {
      renderer.add(
        new StaticBody({
          x: itemX * blockSize + blockSize / 2,
          y: itemY * blockSize + blockSize / 2,
          width: blockSize,
          height: blockSize,
          image: images[selected],
        })
      );

      level.push({ type: "block", x: itemX, y: itemY, img: selected });
    } else if (selected.startsWith("spike")) {
      const spike = renderer.add(
        new Spike({
          x: itemX,
          y: itemY,
          dir: selected.slice(6),
          images,
        })
      );

      level.push({ type: "spike", x: itemX, y: itemY, dir: spike.dir });
    } else if (selected.startsWith("checkpoint")) {
      renderer.add(new Checkpoint({ x: itemX, y: itemY, images }));
      level.push({ type: "checkpoint", x: itemX, y: itemY });
    } else if (selected.startsWith("trash")) {
      renderer.objects = [...renderer.objects].reverse().filter((object) => {
        const res = !object.collides({
          x: cursorXOnGrid + blockSize / 2,
          y: cursorYOnGrid + blockSize / 2,
          width: 2,
          height: 2,
        });
        return res;
      });
    }
  }
};
