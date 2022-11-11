class Spike extends StaticBody {
  constructor({ x = 0, y = 0, dir = "up", images = {} } = {}) {
    super({
      x: x * blockSize + blockSize / 2,
      y: y * blockSize + blockSize / 2,
      width: blockSize,
      height: blockSize,
      image: (() => {
        switch (dir) {
          case "up":
            return images.spike_up;
            break;
          case "right":
            return images.spike_right;
            break;
          case "down":
            return images.spike_down;
            break;
          case "left":
            return images.spike_left;
            break;
          default:
            return images.spike_up;
            break;
        }
      })(),
      update: () => {
        const margin = 2;
        if (
          player.collides({
            x: this.x - margin,
            y: this.y - margin,
            width: this.width + margin * 2,
            height: this.height + margin * 2,
          })
        ) {
          player.takeDamage(Infinity);
        }
      },
    });
  }
}
