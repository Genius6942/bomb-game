const pointerLockEl = document.querySelector(".pointerlock");
document.querySelector(".run").addEventListener("click", ({ clientX, clientY }) => {
  if (pointerLocked) return;
  renderer.requestPointerLock();
  cursor.x = clientX;
  cursor.y = clientY;
});

const blockSize = 64;

let pointerLocked = false;
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === renderer) {
    pointerLocked = true;
  } else {
    pointerLocked = false;
  }
  if (pointerLocked) {
    pointerLockEl.style.display = "none";
    renderer.camera.lock(player);
  } else {
    // pointerLockEl.style.display = "flex";
    renderer.camera.unlock();
  }
});

/**
 * @type {Player}
 */
let player;
/**
 * @type {Enemy[]}
 */
let enemies = [];
loadImages(
  {
    bg: "/img/bg_blue.png",

    // blocks
    block_snow_left: "/img/block_snow_2_left@3x.png",
    block_snow_mid: "/img/block_snow_2_mid_3@3x.png",
    block_snow_right: "/img/block_snow_2_right@3x.png",
    block_snow_single: "/img/block_snow_2_single@3x.png",
    block_ground_single: "/img/block_ground_00_single@3x.png",
    block_ground_top_left: "/img/block_ground_01_top_left@3x.png",
    block_ground_top_mid: "/img/block_ground_02_top_mid@3x.png",
    block_ground_top_right: "/img/block_ground_03_top_right@3x.png",
    block_ground_mid_left: "/img/block_ground_04_mid_left@3x.png",
    block_ground_mid: "/img/block_ground_05_mid@3x.png",
    block_ground_mid_right: "/img/block_ground_06_mid_right@3x.png",
    block_ground_bottom_left: "/img/block_ground_7_bottom_left@3x.png",
    block_ground_bottom_mid: "/img/block_ground_08_bottom_mid@3x.png",
    block_ground_bottom_right: "/img/block_ground_09_bottom_right@3x.png",
    block_ground_top_bottom: "/img/block_ground_10_top_bottom@3x.png",
    block_ground_left_right: "/img/block_ground_11_left_right@3x.png",
    block_ground_left: "/img/block_ground_12_left@3x.png",
    block_ground_right: "/img/block_ground_12_right@3x.png",
    block_ground_top: "/img/block_ground_13_top@3x.png",
    block_ground_bottom: "/img/block_ground_14_bottom@3x.png",

    // player
    player_die_1: "/img/player/penguin_die01@2x.png",
    player_die_2: "/img/player/penguin_die02@2x.png",
    player_die_3: "/img/player/penguin_die03@2x.png",
    player_die_4: "/img/player/penguin_die04@2x.png",
    player_hurt: "/img/player/penguin_hurt@2x.png",
    player_jump_1: "/img/player/penguin_jump01@2x.png",
    player_jump_2: "/img/player/penguin_jump02@2x.png",
    player_jump_3: "/img/player/penguin_jump03@2x.png",
    player_slide_1: "/img/player/penguin_slide01@2x.png",
    player_slide_2: "/img/player/penguin_slide02@2x.png",
    player_walk_1: "/img/player/penguin_walk01@2x.png",
    player_walk_2: "/img/player/penguin_walk02@2x.png",
    player_walk_3: "/img/player/penguin_walk03@2x.png",
    player_walk_4: "/img/player/penguin_walk04@2x.png",

    // bomb
    bomb_1: "/img/bomb/bomb_1.png",
    bomb_2: "/img/bomb/bomb_2.png",
    bomb_3: "/img/bomb/bomb_3.png",
    bomb_4: "/img/bomb/bomb_4.png",
    bomb_5: "/img/bomb/bomb_5.png",
    bomb_6: "/img/bomb/bomb_6.png",
    bomb_7: "/img/bomb/bomb_7.png",
    bomb_8: "/img/bomb/bomb_8.png",
    bomb_9: "/img/bomb/bomb_9.png",
    bomb_10: "/img/bomb/bomb_10.png",

    // spikes
    spike_left: "/img/spike/spike_left.png",
    spike_down: "/img/spike/spike_down.png",
    spike_up: "/img/spike/spike_up.png",
    spike_right: "/img/spike/spike_right.png",
  },
  (loaded, total) => {
    console.log((loaded / total) * 100, "% complete");
    document.querySelector(".loading").style.width =
      ((loaded / total) * 100).toString() + "%";
  }
)
  .then((images) => {
    document.querySelector(".loading").parentElement.parentElement.style.display = "none";

    // Create a player
    // Giving it a "color" property will make it render as that color.
    player = new Player({ health: 50, images });

    // Add the player to the renderer's list of objects to draw / update
    renderer.add(player);

    // enable keyboard controls
    player.bindKeyboardControls({});

    // create a body for the player to land / jump on
    renderer.add(
      new StaticBody({ x: 0, y: 500, width: 300, height: 100, color: "black" })
    );
    renderer.add(
      new StaticBody({ x: 500, y: 800, width: 300, height: 100, color: "black" })
    );

    enemies = [
      new Enemy({ x: 500, y: 0 }),
      new Enemy({ x: 600, y: 0, mass: 3, maxHealth: 100, width: 60, height: 60 }),
    ];

    enemies.forEach((enemy) => renderer.add(enemy));

    const fps = 60;
    const msPerFrame = 1000 / fps;
    let lastUpdateTime = performance.now();

    const bg = renderer.ctx.createPattern(images.bg, "repeat");

    renderer.beforeRender(() => {
      const ctx = renderer.ctx;
      ctx.fillStyle = bg;
      ctx.save();

      ctx.translate(
        renderer.width / 2 - renderer.camera.pos.x / 2,
        renderer.height / 2 - renderer.camera.pos.y / 2
      );

      ctx.fillRect(
        renderer.camera.pos.x / 2 - renderer.width / 2,
        renderer.camera.pos.y / 2 - renderer.height / 2,
        renderer.width,
        renderer.height
      );

      ctx.restore();
    });

    let mouseDown = false;
    let ogMousePoint = { x: 0, y: 0 };
    renderer.addEventListener("mousedown", ({ clientX, clientY }) => {
      if (pointerLocked) return;
      mouseDown = true;
      ogMousePoint = { x: clientX, y: clientY };
    });

    window.addEventListener("mousemove", ({ movementX, movementY }) => {
      if (pointerLocked || !mouseDown) return;
      renderer.camera.pos.x -= movementX;
      renderer.camera.pos.y -= movementY;
    });

    window.addEventListener("mouseup", () => {
      try {
        mouseDown = false;
        if (cursor.x === ogMousePoint.x && cursor.y === ogMousePoint.y) {
          if (!["", "trash"].includes(getSelected())) {
            const cursorXOnGrid =
              cursor.x - blockSize / 2 - renderer.width / 2 + renderer.camera.pos.x;
            const cursorYOnGrid =
              cursor.y - blockSize / 2 - renderer.height / 2 + renderer.camera.pos.y;
            const itemX = Math.round(cursorXOnGrid / blockSize);
            const itemY = Math.round(cursorYOnGrid / blockSize);

            if (getSelected().startsWith("block")) {
              renderer.add(
                new StaticBody({
                  x: itemX * blockSize + blockSize / 2,
                  y: itemY * blockSize + blockSize / 2,
                  width: blockSize,
                  height: blockSize,
                  image: images[getSelected()],
                })
              );
            } else if (getSelected().startsWith("spike")) {
              renderer.add(
                new Spike({
                  x: itemX,
                  y: itemY,
                  dir: getSelected().slice(6),
                  images,
                })
              );
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    });

    const fpsEl = document.querySelector(".fps");

    const fpsRecord = [];

    // rendering loop
    /**
     * @param {number} time
     * @returns
     */
    const animationLoop = (time) => {
      const timeDiff = time - lastUpdateTime;
      lastUpdateTime = time;
      const multiplier = timeDiff / msPerFrame;

      fpsRecord.push(Math.round(1000 / timeDiff));
      if (fpsRecord.length > 20) {
        const avgFps = Math.round(fpsRecord.reduce((a, b) => a + b) / fpsRecord.length);
        fpsRecord.length = 0;
        fpsEl.innerHTML = avgFps.toString() + " fps";
      }

      if (pointerLocked) renderer.update(multiplier);

      // respawn player if needed
      if (player.y - player.height / 2 > 4000) {
        player.v.y = 0;
        player.v.x = 0;
        player.x = 30;
        player.y = 30;
      }

      // draw everything
      renderer.render();

      const ctx = renderer.ctx;

      pointerLocked &&
        (async () => {
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
            ctx.fillRect(
              -lineWidth / 2,
              -lineHeight / 2 - lineSpace,
              lineWidth,
              lineHeight
            );

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
        })();

      // draw predicted bomb path
      pointerLocked &&
        false &&
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
                  (object) =>
                    object._randomId !== player._randomId && object.collides(big)
                ).length > 0
              )
                break;

              points.push([...point]);
            }

            const { x: cameraX, y: cameraY } = renderer.camera.pos;

            renderer.ctx.save();
            renderer.ctx.translate(
              renderer.width / 2 - cameraX,
              renderer.height / 2 - cameraY
            );
            renderer.ctx.beginPath();
            renderer.ctx.setLineDash([7, 17]);
            renderer.ctx.moveTo(points[0][0], points[[0][1]]);
            points
              .slice(1)
              .forEach((linePoint, idx) =>
                renderer.ctx.lineTo(linePoint[0], linePoint[1])
              );
            renderer.ctx.stroke();
            renderer.ctx.restore();
          } catch (e) {
            console.error(e.message);
          }
        })();

      !pointerLocked &&
        (async () => {
          const selected = getSelected();
          if (selected.length === 0) return;
          const selectedImg = images[selected];
          if (!selectedImg) return;
          const cursorXOnGrid =
            cursor.x - blockSize / 2 - renderer.width / 2 + renderer.camera.pos.x;
          const cursorYOnGrid =
            cursor.y - blockSize / 2 - renderer.height / 2 + renderer.camera.pos.y;
          const itemX = Math.round(cursorXOnGrid / blockSize) * blockSize;
          const itemY = Math.round(cursorYOnGrid / blockSize) * blockSize;

          ctx.save();
          renderer.ctx.translate(
            renderer.width / 2 - renderer.camera.pos.x,
            renderer.height / 2 - renderer.camera.pos.y
          );
          renderer.ctx.drawImage(selectedImg, itemX, itemY, 64, 64);
          ctx.restore();
        })();

      player.drawStats(renderer.ctx);

      requestAnimationFrame(animationLoop);
    };

    requestAnimationFrame(animationLoop);

    const getSelected = initEditor(images);
  })
  .catch((e) => console.error(e));