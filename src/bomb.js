class ExplosionParticle extends PhysicalBody {
  constructor(x, y, velocity, angle, size, color = "yellow") {
    super({
      x,
      y,
      width: size,
      height: size,
      color: color,
      update: (multiplier) => {
        this.width -= this.shrinkSpeed;
        this.height -= this.shrinkSpeed;
        if (this.width <= 0) {
          renderer.destroy(this);
        }
      },
      mass: 0.1,
      interactsWithPhysicalBodies: false,
    });

    this.shrinkSpeed = 0.4;

    this.v.x = Math.cos(angle) * velocity;
    this.v.y = Math.sin(angle) * velocity;
    this.x += this.v.x * 2;
    this.y += this.v.y * 2;
  }
}

const random = (min, max) => Math.random() * (max - min) + min;

const explode = (x, y, particles, color = "yellow") => {
  Array(particles)
    .fill()
    .map(() =>
      renderer.add(
        new ExplosionParticle(
          x,
          y,
          random(10, 20),
          random(0, Math.PI * 2),
          random(7, 12),
          color
        )
      )
    );
};

const numOfBombImages = 10;

const sourceX = 34;
const sourceY =  38;
const sourceWidth = 30;
const sourceHeight = 50;

class Bomb extends PhysicalBody {
  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} vx 
   * @param {number} vy 
   * @param {number} damage 
   */
  constructor(x, y, vx, vy, damage = 3) {
    super({
      x,
      y,
      width: 20,
      height: 20,
      image: images.bomb_1,
      render: (ctx) => {
        ctx.drawImage(
          this.image,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      },
      update: (multiplier) => {
        this.ticks += multiplier;
        const rounded = Math.round(this.ticks);
        if (rounded > this.startBombTicks + this.explodeTicks) {
          try {
            renderer.destroy(this);
            renderer.objects.forEach((object) => {
              if (!(object instanceof PhysicalBody)) return;
              const distance = Math.sqrt(
                (object.x - this.x) ** 2 + (object.y - this.y) ** 2
              );
              if (distance > this.maxExplosionDistance) return;
              const force =
                (((this.maxExplosionDistance - distance) / this.maxExplosionDistance) *
                  this.force) /
                object.mass;
              const angle = Math.atan2(object.x - this.x, object.y - this.y);

              object.v.x += Math.sin(angle) * force;
              object.v.y += Math.cos(angle) * force;
              if (object instanceof Enemy || object instanceof Player) {
                object.takeDamage(force * object.mass);
              }
            });
            explode(this.x, this.y, 30);
            return;
          } catch (e) {
            console.error(e.message);
          }
        }
        if (this.ticks > this.startBombTicks) {
          if ((rounded % this.flashLength) * 2 < this.flashLength) {
            this.color = "yellow";
          } else {
            this.color = "red";
          }
        }
        this.bombImage++;
        this.image = images[`bomb_${this.bombImage % numOfBombImages + 1}`];
      },
    });
    this.damage = damage;
    this.v = { x: vx, y: vy };
    this.x += this.v.x * 2;
    this.y += this.v.y * 2;
    this.ticks = 0;
    this.startBombTicks = 60;
    this.explodeTicks = 60;
    this.flashLength = 10;
    this.force = 12;
    this.maxExplosionDistance = 300;

    this.bombImage = 1;
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
window.addEventListener("mousemove", ({ movementX, movementY, clientX, clientY }) => {
  if (pointerLocked) {
    cursor.x += movementX;
    cursor.y += movementY;
  } else {
    cursor.x = clientX;
    cursor.y = clientY;
  }
  cursor.x = Math.max(0, Math.min(renderer.width, cursor.x));
  cursor.y = Math.max(0, Math.min(renderer.height, cursor.y));
});

renderer.addEventListener("mousedown", () => {
  if (!pointerLocked) return;
  try {
    const bombSpeed = 20;
    const angle = Math.atan2(
      cursor.y - renderer.height / 2,
      cursor.x - renderer.width / 2
    );
    const vx = Math.cos(angle) * bombSpeed;
    const vy = Math.sin(angle) * bombSpeed;
    addBomb(new Bomb(player.x, player.y, vx, vy, images));
  } catch (e) {
    console.error(e.message);
  }
});
