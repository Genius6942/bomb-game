class Player extends ControlledBody {
  /**
   * @param {object} options
   * @param {number?} options.health
   * @param {{[key: string]: HTMLImageElement}?} options.images
   */
  constructor({ health = 100, images = {} }) {
    super({
      x: 30,
      y: 30,
      width: 30,
      height: 30,
      layer: 1,
      image: images.player_walk_1,
      wallJump: true,
      jumpVel: 15.5,
      maxXSpeed: 7,
      render: (ctx) => {
        if (this.dir === 0) {
          ctx.scale(-1, 1);
        }
        ctx.drawImage(
          this.image,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      },
      update: () => {
        if ((this.keys.a || this.keys.left) && !(this.keys.d || this.keys.right)) {
          this.dir = 0;
        } else if (!(this.keys.a || this.keys.left) && (this.keys.d || this.keys.right)) {
          this.dir = 1;
        }

        if (!this.isOnBody) {
          if (this.jumpFrames < 3) {
            this.image = images.player_jump_1;
          } else if (this.jumpFrames < 7) {
            this.image = images.player_jump_2;
          } else {
            this.image = images.player_jump_3;
          }
          this.jumpFrames++;
        } else {
          this.jumpFrames = 0;
          if (this.walkFrames % 20 < 5) {
            this.image = images.player_walk_1;
          } else if (this.walkFrames % 20 < 10) {
            this.image = images.player_walk_2;
          } else if (this.walkFrames % 20 < 15) {
            this.image = images.player_walk_3;
          } else {
            this.image = images.player_walk_4;
          }

          !!this.v.x && this.walkFrames++;
        }
      },
    });

    this.jumpFrames = 0;
    this.walkFrames = 0;
    this.dir = 1;

    this.maxHealth = health;
    this.health = this.maxHealth;
    this.displayedHealth = this.health;

    this.startPos = { x: this.x, y: this.y };
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  drawStats(ctx) {
    const healthBar = {
      x: renderer.width / 2 - Player.Stats.healthBarWidth / 2,
      y: renderer.height - Player.Stats.healthBarBottom - Player.Stats.healthBarHeight,
      width: Player.Stats.healthBarWidth,
      height: Player.Stats.healthBarHeight,
    };

    if (this.displayedHealth > this.health) {
      this.displayedHealth -= Player.Stats.displayedHealthDecreaseSpeed;
    }
    if (this.displayedHealth < this.health) {
      this.displayedHealth = this.health;
    }

    ctx.fillStyle = Player.Stats.healthBarBgColor;
    ctx.fillRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height);

    ctx.fillStyle = Player.Stats.healthBarHealthColor;
    ctx.fillRect(
      healthBar.x,
      healthBar.y,
      healthBar.width * (this.health / this.maxHealth),
      healthBar.height
    );

    ctx.fillStyle = Player.Stats.healthBarDecreaseColor;
    ctx.fillRect(
      healthBar.x + healthBar.width * (this.health / this.maxHealth),
      healthBar.y,
      healthBar.width * ((this.displayedHealth - this.health) / this.maxHealth),
      healthBar.height
    );

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "18px Arial";
    ctx.fillText(
      Math.round(this.health).toString() + " / " + this.maxHealth.toString(),
      renderer.width / 2,
      healthBar.y + healthBar.height / 2
    );
  }

  takeDamage(damage = 1) {
    if (this.health <= 0) return;
    this.health -= damage;
    if (this.health <= 0) {
      renderer.destroy(this);
      enemies.splice(enemies.indexOf(this), 1);
      explode(this.x, this.y, this.maxHealth, "blue");
      setTimeout(() => {
        renderer.add(this);
        this.health = this.maxHealth;
        try {
          const [checkpoint] = checkpoints.filter((checkpoint) => !checkpoint.locked);
          this.x = checkpoint.x;
          this.y = checkpoint.y;
        } catch (e) {
          this.x = this.startPos.x;
          this.y = this.startPos.y;
        }
        this.v.x = 0;
        this.v.y = 0;
        renderer.camera.lock(this);
      }, 2000);
    }
    this.health = Math.max(0, this.health);
    return this.health;
  }

  static Stats = {
    healthBarWidth: 400,
    healthBarHeight: 18,
    healthBarBottom: 30,
    healthBarBgColor: "#777777",
    healthBarHealthColor: "#00FF00",
    healthBarDecreaseColor: "#FFFF00",
    displayedHealthDecreaseSpeed: 0.5,
  };
}
