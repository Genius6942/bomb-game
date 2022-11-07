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
          try {
            renderer.destroy(this);
            renderer.objects.forEach((object) => {
              if (!(object instanceof PhysicalBody)) return;
              const distance = Math.sqrt(
                (object.x - this.x) ** 2 + (object.y - this.y) ** 2
              );
              if (distance > this.maxExplosionDistance) return;
              const force =
                ((this.maxExplosionDistance - distance) / this.maxExplosionDistance) *
                this.force;
              const angle = Math.atan2(object.x - this.x, object.y - this.y);

              object.v.x += Math.sin(angle) * force;
              object.v.y += Math.cos(angle) * force;
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
