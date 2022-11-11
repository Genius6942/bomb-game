class Enemy extends PhysicalBody {
  constructor({x = 0, y = 0, mass = 1, maxHealth = 15, width = 30, height = 30}) {
    super({
      x,
      y,
      width,
      height,
      color: "red",
			mass,
      render: (ctx) => {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

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
        if (this.y - this.height / 2 > renderer.height) {
          this.v.y = 0;
          this.v.x = 0;
          this.x = 30;
          this.y = 30;
        }
      },
    });

    this.maxHealth = maxHealth;
    this.health = this.maxHealth;
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
