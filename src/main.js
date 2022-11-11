// renderer.forceNotInObject = false;

const pointerLockEl = document.querySelector(".pointerlock");
pointerLockEl.addEventListener("click", ({ clientX, clientY }) => {
  renderer.requestPointerLock();
  cursor.x = clientX;
  cursor.y = clientY;
});

let pointerLocked = false;
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === renderer) {
    pointerLocked = true;
  } else {
    pointerLocked = false;
  }

  if (pointerLocked) {
    pointerLockEl.style.display = "none";
  } else {
    pointerLockEl.style.display = "flex";
  }
});

// Create a player
const player = new Player();

// Add the player to the renderer's list of objects to draw / update
renderer.add(player);

// enable keyboard controls
player.bindKeyboardControls({});

// lock the camera to the player (player stays at center of the screen)
renderer.camera.lock(player);

// create a body for the player to land / jump on
renderer.add(new StaticBody({ x: 0, y: 500, width: 300, height: 100, color: "black" }));
renderer.add(new StaticBody({ x: 500, y: 800, width: 300, height: 100, color: "black" }));

const enemies = [
  new Enemy({ x: 500, y: 0 }),
  new Enemy({ x: 600, y: 0, mass: 3, maxHealth: 100, width: 60, height: 60 }),
];

enemies.forEach((enemy) => renderer.add(enemy));

const fps = 60;
const msPerFrame = 1000 / fps;
let lastUpdateTime = performance.now();

// rendering loop
/**
 * @param {number} time
 * @returns
 */
const animationLoop = (time) => {
  const timeDiff = time - lastUpdateTime;
  lastUpdateTime = time;
  const multiplier = timeDiff / msPerFrame;

  if (!pointerLocked) return requestAnimationFrame(animationLoop);

  // update physics
  renderer.update(multiplier);

  // respawn player if needed
  if (player.y - player.height / 2 > renderer.height) {
    player.v.y = 0;
    player.v.x = 0;
    player.x = 30;
    player.y = 30;
  }

  // draw everything
  renderer.render();

  const ctx = renderer.ctx;
  // ---- draw cursor ----
  // setup
  ctx.fillStyle = "red";

  ctx.save();

  ctx.translate(cursor.x, cursor.y);

  ctx.beginPath();

  ctx.arc(0, 0, 5, 0, Math.PI * 2);

  ctx.fill();

  const lineWidth = 7;
  const lineHeight = 15;
  const lineSpace = 40;

  ctx.rotate(Math.PI / 4);

  for (let i = 0; i < 4; i++) {
    ctx.rotate((Math.PI / 2) * i);

    // rect
    ctx.fillRect(-lineWidth / 2, -lineHeight / 2 - lineSpace, lineWidth, lineHeight);

    // bottom circle
    ctx.beginPath();

    ctx.arc(0, -lineSpace + lineHeight / 2, lineWidth / 2, 0, Math.PI * 2);

    ctx.fill();

    // top circle

    ctx.beginPath();

    ctx.arc(0, -lineSpace - lineHeight / 2, lineWidth / 2, 0, Math.PI * 2);

    ctx.fill();
  }

  ctx.restore();

  // draw predicted bomb path
  (async () => {
    try {
      const bombSpeed = 20;
      const angle = Math.atan2(
        cursor.y - renderer.height / 2,
        cursor.x - renderer.width / 2
      );
      let vx = Math.cos(angle) * bombSpeed;
      let vy = Math.sin(angle) * bombSpeed;

      const points = [];
      let point = [player.x, player.y];
      points.push(point);
      while (
        // point greater than left
        point[0] > -renderer.width / 2 + renderer.camera.pos.x &&
        // point less than right
        point[0] < renderer.width / 2 + renderer.camera.pos.x &&
        // point greater than top
        point[1] > -renderer.height / 2 + renderer.camera.pos.y &&
        // point less than bottom
        point[1] < renderer.height / 2 + renderer.camera.pos.y
      ) {
        vy += renderer.physics.gravity;
        const [startX, startY] = point;
        point[0] += vx;
        point[1] += vy;

        const bigX = (startX + point[0]) / 2;
        const bigY = (startY + point[1]) / 2;
        const bigWidth = Math.abs(startX - point[0]) + 1;
        const bigHeight = Math.abs(startY - point[1]) + 1;
        const big = {
          x: bigX,
          y: bigY,
          width: bigWidth,
          height: bigHeight,
        };

        if (
          renderer.objects.filter(
            (object) => object._randomId !== player._randomId && object.collides(big)
          ).length > 0
        )
          break;

        points.push([...point]);
      }

      const { x: cameraX, y: cameraY } = renderer.camera.pos;

      renderer.ctx.save();
      renderer.ctx.translate(renderer.width / 2 - cameraX, renderer.height / 2 - cameraY);
      renderer.ctx.beginPath();
      renderer.ctx.setLineDash([7, 17]);
      renderer.ctx.moveTo(points[0][0], points[[0][1]]);
      points
        .slice(1)
        .forEach((linePoint, idx) => renderer.ctx.lineTo(linePoint[0], linePoint[1]));
      // renderer.ctx.stroke();
      renderer.ctx.restore();
    } catch (e) {
      console.error(e.message);
    }
  })();

  player.drawStats(renderer.ctx);

  requestAnimationFrame(animationLoop);
};

requestAnimationFrame(animationLoop);
