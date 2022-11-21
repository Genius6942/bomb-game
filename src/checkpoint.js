/**
 * @type {Checkpoint[]}
 */
const checkpoints = [];

class Checkpoint extends GameObject {
  constructor({ x = 0, y = 0, images = {} } = {}) {
    const aspectRatio = 111 / 139;
    super({
      x: x * blockSize + blockSize / 2,
      y: y * blockSize + blockSize / 2 - ((1 / aspectRatio - 1) * blockSize) / 2,
      width: blockSize,
      height: blockSize * (1 / aspectRatio),
      image: images.checkpoint,
      onCollide: (object) => {
				if (object !== player) return;
        checkpoints.forEach((checkpoint) => (checkpoint.locked = true));
        this.locked = false;
      },
    });

    this._locked = checkpoints.length > 0;
    this.locked = this._locked;
    checkpoints.push(this);
  }

  get locked() {
    return this._locked;
  }

  set locked(val) {
    this._locked = val;
    this.image = this.locked ? images.checkpointLocked : images.checkpoint;
  }
}
