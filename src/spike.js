const getImageName = (dir = "up") => {
  switch (dir) {
    case "up":
      return "spike_up";
      break;
    case "right":
      return "spike_right";
      break;
    case "down":
      return "spike_down";
      break;
    case "left":
      return "spike_left";
      break;
    default:
      return "spike_up";
      break;
  }
};

class Spike extends StaticBody {
  constructor({ x = 0, y = 0, dir = "up", images = {} } = {}) {
    super({
      x: x * blockSize + blockSize / 2,
      y: y * blockSize + blockSize / 2,
      width: blockSize,
      height: blockSize,
      image: images[getImageName(dir)],
			layer: 1,
      onCollide: (object) => {
        if (triangleRectIntersection(this.getVertices(), player)) {
          player.takeDamage(Infinity);
        }
      },
    });

    this.dir = dir;
  }

  getImageName(dir) {
    return getImageName(dir);
  }

  getVertices() {
    switch (this.dir) {
      case "up":
        return [
          // bottom right
          {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
          },
          // bottom left
          {
            x: this.x - this.width / 2,
            y: this.y + this.height / 2,
          },
          // top middle
          {
            x: this.x,
            y: this.y - this.height / 2,
          },
        ];
        break;
      case "right":
        return [
          // top left
          {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
          },
          // middle right
          {
            x: this.x + this.width / 2,
            y: this.y,
          },
          // bottom left
          {
            x: this.x - this.width / 2,
            y: this.y + this.height / 2,
          },
        ];
        break;
      case "down":
        return [
          // top left
          {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
          },
          // top right
          {
            x: this.x + this.width / 2,
            y: this.y - this.height / 2,
          },
          // bottom middle
          {
            x: this.x,
            y: this.y + this.height / 2,
          },
        ];
        break;
      case "left":
        return [
          // top right
          {
            x: this.x + this.width / 2,
            y: this.y - this.height / 2,
          },
          // bottom right
          {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
          },
          // middle left
          {
            x: this.x - this.width / 2,
            y: this.y,
          },
        ];
        break;
      default:
        // default up
        return [
          // bottom right
          {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
          },
          // bottom left
          {
            x: this.x - this.width / 2,
            y: this.y + this.height / 2,
          },
          // top middle
          {
            x: this.x,
            y: this.y - this.height / 2,
          },
        ];
        break;
    }
  }
}
