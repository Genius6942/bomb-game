class Enemy extends PhysicalBody {
  constructor({ x = 0, y = 0, mass = 1, maxHealth = 15, width = 30, height = 30 }) {
    super({
      x,
      y,
      width,
      height,
      image: images.enemy_slime_1,
      mass,
			layer: 1,
      render: (ctx) => {
        ctx.drawImage(
          this.image,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );

        // health bar
        ctx.fillStyle = "#888888";

        // health bar information
        const hb = {
          width: 70,
          height: 25,
          ySpace: 10,
          margin: {
            x: 6,
            y: 6,
          },
        };

        ctx.fillRect(
          -hb.width / 2,
          -this.height / 2 - hb.ySpace - hb.height,
          hb.width,
          hb.height
        );

        const health = this.health / this.maxHealth;

        ctx.fillStyle = "red";

        ctx.fillRect(
          -hb.width / 2 + hb.margin.x,
          -this.height / 2 - hb.ySpace - hb.height + hb.margin.y,
          health * (hb.width - hb.margin.x * 2),
          hb.height - hb.margin.y * 2
        );
      },
      update: () => {

        if (
          this.animateFrames % this.animateDuration <
          (this.animateDuration / this.animateSteps) * 1
        ) {
          this.image = images.enemy_slime_1;
        } else if (
          this.animateFrames % this.animateDuration <
          (this.animateDuration / this.animateSteps) * 2
        ) {
          this.image = images.enemy_slime_2;
        } else if (
          this.animateFrames % this.animateDuration <
          (this.animateDuration / this.animateSteps) * 3
        ) {
          this.image = images.enemy_slime_3;
        } else if (
          this.animateFrames % this.animateDuration <
          (this.animateDuration / this.animateSteps) * 4
        ) {
          this.image = images.enemy_slime_4;
        } else if (
          this.animateFrames % this.animateDuration <
          (this.animateDuration / this.animateSteps) * 5
        ) {
          this.image = images.enemy_slime_5;
        } else if (
          this.animateFrames % this.animateDuration <
          (this.animateDuration / this.animateSteps) * 6
        ) {
          this.image = images.enemy_slime_6;
        } else if (this.animateFrames % this.animateDuration < this.animateDuration / this.animateSteps * 7) {
          this.image = images.enemy_slime_7;
        } else {
          this.image = images.enemy_slime_8;
        }

        this.animateFrames++;
      },
    });

    this.maxHealth = maxHealth;
    this.health = this.maxHealth;

    this.animateFrames = 0;
		this.animateDuration = 60;
		this.animateSteps = 8;
  }

  takeDamage(damage = 1) {
    this.health -= damage;
    if (this.health <= 0) {
      renderer.destroy(this);
      enemies.splice(enemies.indexOf(this), 1);
      explode(this.x, this.y, this.maxHealth, "red");
    }
    return this.health;
  }
}
