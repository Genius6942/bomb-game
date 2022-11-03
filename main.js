/// <reference path="./plat.d.ts"/>
console.log(plat);
const { Renderer, ControlledBody, StaticBody, PhysicalBody, GameObject } = plat;
// Create a renderer
// This handles physics and rendering for you.
const renderer = new Renderer();
renderer.mount(document.body).enableFixedPosition().enablePhysics({});

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
// Giving it a "color" property will make it render as that color.
const player = new ControlledBody({
  x: 30,
  y: 30,
  width: 30,
  height: 30,
  layer: 1,
  color: "blue",
  wallJump: true,
  jumpVel: 17,
});

// Add the player to the renderer's list of objects to draw / update
renderer.add(player);

// enable keyboard controls
player.bindKeyboardControls({});

// lock the camera to the player (player stays at center of the screen)
renderer.camera.lock(player);

// create a body for the player to land / jump on
renderer.add(new StaticBody({ x: 0, y: 500, width: 300, height: 100, color: "black" }));

class ExplosionParticle extends PhysicalBody {
  constructor(x, y, velocity, angle, size) {
    super({
      x,
      y,
      width: size,
      height: size,
      color: "yellow",
      update: (multiplier) => {
        this.width -= this.shrinkSpeed;
        this.height -= this.shrinkSpeed;
        if (this.width <= 0) {
          renderer.destroy(this);
        }
      },
      mass: .1,
    });

    this.shrinkSpeed = 0.4;

    this.v.x = Math.cos(angle) * velocity;
    this.v.y = Math.sin(angle) * velocity;
  }
}

const random = (min, max) => Math.random() * (max - min) + min;

const explode = (x, y, particles) => {
  Array(particles)
    .fill()
    .map(() =>
      renderer.add(
        new ExplosionParticle(x, y, random(10, 20), random(0, Math.PI * 2), random(7, 12))
      )
    );
};

class Bomb extends PhysicalBody {
  constructor(x, y, vx, vy, damage = 3) {
    super({
      x,
      y,
      width: 20,
      height: 20,
      color: "red",
      update: (multiplier) => {
        this.ticks += multiplier;
        const rounded = Math.round(this.ticks);
        if (rounded > this.startBombTicks + this.explodeTicks) {
          explode(this.x, this.y, 30);
          renderer.destroy(this);
          return;
        }
        if (this.ticks > this.startBombTicks) {
          if ((rounded % this.flashLength) * 2 < this.flashLength) {
            this.color = "yellow";
          } else {
            this.color = "red";
          }
        }
      },
    });
    this.damage = damage;
    this.v = { x: vx, y: vy };
    this.ticks = 0;
    this.startBombTicks = 60;
    this.explodeTicks = 60;
    this.flashLength = 10;
  }
}

/**
 * @type {Bomb[]}
 */
const bombs = [];
const addBomb = (bomb) => {
  bombs.push(bomb);
  renderer.add(bomb);
};

const cursor = { x: 0, y: 0 };
window.addEventListener("mousemove", ({ movementX, movementY }) => {
  cursor.x += movementX;
  cursor.y += movementY;
  cursor.x = Math.max(0, Math.min(renderer.width, cursor.x));
  cursor.y = Math.max(0, Math.min(renderer.height, cursor.y));
});

window.addEventListener("mousedown", () => {
  try {
    const bombSpeed = 20;
    const angle = Math.atan2(
      cursor.y - renderer.height / 2,
      cursor.x - renderer.width / 2
    );
    const vx = Math.cos(angle) * bombSpeed;
    const vy = Math.sin(angle) * bombSpeed;
    addBomb(new Bomb(player.x, player.y, vx, vy));
  } catch (e) {
    console.error(e.message);
  }
});

// rendering loop
const animationLoop = () => {
  if (!pointerLocked) return requestAnimationFrame(animationLoop);

  // update physics
  renderer.update();

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

  requestAnimationFrame(animationLoop);
};

requestAnimationFrame(animationLoop);
