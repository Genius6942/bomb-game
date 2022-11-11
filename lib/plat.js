(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    : ((global = typeof globalThis !== "undefined" ? globalThis : global || self),
      factory((global.plat = {})));
})(this, function (exports) {
  "use strict";

  const aabb = (object1, object2) => {
    // AABB collision with x and y as center
    return (
      object1.x - object1.width / 2 < object2.x + object2.width / 2 &&
      object1.x + object1.width / 2 > object2.x - object2.width / 2 &&
      object1.y - object1.height / 2 < object2.y + object2.height / 2 &&
      object1.y + object1.height / 2 > object2.y - object2.height / 2
    );
  };

  class GameObject {
    constructor({
      x = 0,
      y = 0,
      rotation = 0,
      width = 0,
      height = 0,
      image = null,
      color = null,
      layer = 0,
      render = null,
      update = () => {},
    }) {
      Object.defineProperty(this, "x", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "y", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "rotation", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "width", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "height", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "image", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "render", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "update", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "color", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "layer", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "_randomId", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      this.x = x;
      this.y = y;
      this.rotation = rotation;
      this.width = width;
      this.height = height;
      this.image = image;
      this.color = color;
      this.render = render;
      this.update = update;
      this.layer = layer;
      this._randomId = Math.random();
    }
    _render(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      if (this.render) {
        try {
          this.render.apply(this, [ctx, this]);
        } catch (e) {
          this.render(ctx, this);
        }
      } else if (this.image) {
        ctx.drawImage(
          this.image,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      } else if (this.color) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      }
      ctx.restore();
    }
    collides(object) {
      return aabb(this, object);
    }
  }

  // import ControlledBody from "./controlledBody";
  class PhysicalBody extends GameObject {
    constructor({
      x = 0,
      y = 0,
      rotation = 0,
      width = 0,
      height = 0,
      image = null,
      color = null,
      layer = 0,
      mass = 1,
      interactsWithPhysicalBodies = true,
      friction = 0.3,
      render = null,
      update = () => {},
    }) {
      super({
        x,
        y,
        rotation,
        width,
        height,
        image,
        color,
        layer,
        render,
        update: (multiplier) => {
          update(multiplier, this);
          this.applyFriction(multiplier);
        },
      });
      Object.defineProperty(this, "v", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "isOnBody", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "friction", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "mass", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "interactsWithPhysicalBodies", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      this.v = {
        x: 0,
        y: 0,
      };
      this.interactsWithPhysicalBodies = interactsWithPhysicalBodies;
      this.mass = mass;
      this.friction = friction;
      this.isOnBody = false;
    }
    applyFriction(multiplier) {
      if (!this.isOnBody) return;
      // @ts-ignore
      if (this.keys && this.getPreventFriction()) return;
      if (this.friction * multiplier > Math.abs(this.v.x)) {
        this.v.x = 0;
      } else {
        if (this.v.x > 0) {
          this.v.x -= this.friction * multiplier;
        } else {
          this.v.x += this.friction * multiplier;
        }
      }
    }
  }

  class ControlledBody extends PhysicalBody {
    constructor({
      x = 0,
      y = 0,
      rotation = 0,
      width = 0,
      height = 0,
      image = null,
      color = null,
      layer = 0,
      mass = 1,
      render = null,
      update = () => {},
      maxXSpeed = 5,
      jumpVel = 13,
      maxJumps = 1,
      wallJump = false,
      wallPushOffSpeed = 3,
    }) {
      super({
        x,
        y,
        rotation,
        width,
        height,
        image,
        color,
        layer,
        mass,
        render,
        update: (mulitplier) => {
          update(this);
          this.updateHorizontalMovement(mulitplier);
        },
      });
      Object.defineProperty(this, "maxXSpeed", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "jumpVel", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "keys", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "xAcceleration", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "jumps", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "maxJumps", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "wallJumps", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "wallPushOffSpeed", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      /**
       * 0 for left, 1 for center, 2 for right
       */
      Object.defineProperty(this, "wallSide", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      this.maxXSpeed = maxXSpeed;
      this.jumpVel = jumpVel;
      this.maxJumps = maxJumps;
      this.jumps = 0;
      this.wallJumps = wallJump;
      this.wallPushOffSpeed = wallPushOffSpeed;
      this.wallSide = 1;
      this.keys = {
        w: false,
        a: false,
        s: false,
        d: false,
        top: false,
        bottom: false,
        right: false,
        left: false,
      };
      this.xAcceleration = 0.3;
    }
    getPreventFriction() {
      let val = 0;
      if (this.keys.right) val++;
      if (this.keys.left) val--;
      if (this.keys.d) val++;
      if (this.keys.a) val--;
      return val !== 0;
    }
    jump() {
      if (this.jumps < this.maxJumps) {
        this.v.y = -this.jumpVel;
        this.jumps++;
        if (this.wallSide === 0) {
          this.v.x = -this.wallPushOffSpeed;
        } else if (this.wallSide === 2) {
          this.v.x = this.wallPushOffSpeed;
        }
      }
    }
    bindKeyboardControls({ wasd = true, arrowKeys = true, spaceJump = true }) {
      if (wasd) {
        window.addEventListener("keydown", this.wasdKeyListener.bind(this), true);
        window.addEventListener("keyup", this.wasdKeyListener.bind(this), true);
      }
      if (arrowKeys) {
        window.addEventListener("keydown", this.arrowKeyListener.bind(this), true);
        window.addEventListener("keyup", this.arrowKeyListener.bind(this), true);
      }
      if (spaceJump) {
        window.addEventListener("keydown", this.spaceKeyListener.bind(this), true);
        window.addEventListener("keyup", this.spaceKeyListener.bind(this), true);
      }
    }
    wasdKeyListener({ key, repeat, type }) {
      if (repeat) return;
      const val = type === "keydown";
      if (val && key.toLowerCase() === "w") {
        this.jump();
      }
      if (key.toLowerCase() === "d") {
        this.keys.d = val;
      }
      if (key.toLowerCase() === "s") {
        // maybe do something?
        this.keys.left = val;
      }
      if (key.toLowerCase() === "a") {
        this.keys.a = val;
      }
    }
    arrowKeyListener({ key, type, repeat }) {
      if (repeat) return;
      const val = type === "keydown";
      if (val && key === "ArrowUp") {
        this.jump();
      }
      if (key === "ArrowRight") {
        this.keys.right = val;
      }
      if (key === "ArrowDown") {
        this.keys.bottom = val;
      }
      if (key === "ArrowLeft") {
        this.keys.left = val;
      }
    }
    spaceKeyListener({ key, repeat, type }) {
      const val = type === "keydown";
      if (repeat) return;
      if (val && key === " ") {
        this.jump();
      }
    }
    updateHorizontalMovement(mulitplier) {
      if (this.keys.a || this.keys.left) {
        if (this.v.x > -this.maxXSpeed) this.v.x -= this.xAcceleration * mulitplier;
      }
      if (this.keys.d || this.keys.right) {
        if (this.v.x < this.maxXSpeed) this.v.x += this.xAcceleration * mulitplier;
      }
      // this.v.x = Math.max(-this.maxXSpeed, Math.min(this.maxXSpeed, this.v.x));
    }
  }

  class Camera {
    constructor(renderer, defaultPos) {
      Object.defineProperty(this, "renderer", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "lockedObject", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "defaultPos", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "pos", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "minimums", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      this.renderer = renderer;
      this.lockedObject = null;
      this.defaultPos = defaultPos || {
        x: renderer.width / 2,
        y: renderer.height / 2,
      };
      this.pos = this.defaultPos;
      this.minimums = { x: Infinity, y: Infinity };
    }
    lock(object, { minXSpace = Infinity, minYSpace = Infinity } = {}) {
      this.lockedObject = object;
      this.minimums = {
        x: minXSpace,
        y: minYSpace,
      };
    }
    unlock() {
      this.lockedObject = null;
      this.pos = this.defaultPos;
    }
    update() {
      if (this.lockedObject) {
        if (this.minimums.x >= this.renderer.width / 2) {
          this.pos.x = this.lockedObject.x;
        } else if (
          this.lockedObject.x - this.pos.x + this.renderer.width / 2 <
          this.minimums.x
        ) {
          this.pos.x = this.lockedObject.x - this.minimums.x + this.renderer.width / 2;
        } else if (
          this.lockedObject.x - this.pos.x >
          this.renderer.width / 2 - this.minimums.x
        ) {
          this.pos.x = this.lockedObject.x + this.minimums.x - this.renderer.width / 2;
        }
        if (this.minimums.y >= this.renderer.height / 2) {
          this.pos.y = this.lockedObject.y;
        }
      }
      return this.pos;
    }
  }

  class StaticBody extends GameObject {
    constructor({
      x = 0,
      y = 0,
      rotation = 0,
      width = 0,
      height = 0,
      image = null,
      color = null,
      layer = 0,
      render = null,
      update = () => {},
    }) {
      super({
        x,
        y,
        rotation,
        width,
        height,
        image,
        color,
        layer,
        render,
        update,
      });
    }
  }

  class Renderer extends HTMLCanvasElement {
    constructor() {
      super();
      Object.defineProperty(this, "ctx", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "objects", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "physics", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "camera", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "forceNotInObject", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, "beforeRenderFuncs", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      });
      window.addEventListener("resize", () => this.resize());
      this.ctx = this.getContext("2d");
      this.objects = [];
      this.render = this.render.bind(this);
      this.camera = new Camera(this);
      this.forceNotInObject = true;
      this.beforeRenderFuncs = [];
    }
    beforeRender(func) {
      this.beforeRenderFuncs.push(func);
      return this;
    }
    /**
     * Makes images not blur when scaled
     */
    enablePixelated() {
      // allow for pixelated look when scaling
      // @ts-ignore
      this.ctx.webkitImageSmoothingEnabled = false;
      // @ts-ignore
      this.ctx.mozImageSmoothingEnabled = false;
      this.ctx.imageSmoothingEnabled = false;
      return this;
    }
    enablePhysics({ gravity = 0.7 }) {
      this.physics = {
        gravity,
      };
      return this;
    }
    enableFixedPosition() {
      this.style.position = "fixed";
      this.style.top = "0px";
      this.style.left = "0px";
      return this;
    }
    resize() {
      if (this.parentElement) {
        this.width = this.parentElement.offsetWidth;
        this.height = this.parentElement.offsetHeight;
      } else {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
      }
      return this;
    }
    add(object) {
      this.objects.push(object);
      return object;
    }
    destroy(item) {
      if (typeof item === "number") {
        this.objects.filter((object) => object._randomId === item);
      } else {
        this.objects = this.objects.filter((object) => object !== item);
      }
      return item;
    }
    /**
     * Mounts renderer to the dom
     */
    mount(container) {
      container.appendChild(this);
      return this;
    }
    update(mulitplier = 1) {
      this.objects.forEach((object) => {
        if (this.physics) {
          if (object instanceof PhysicalBody) {
            object.v.y += this.physics.gravity * mulitplier;
            object.update(mulitplier);
            const { x: startX, y: startY } = object;
            object.x += object.v.x * mulitplier;
            object.y += object.v.y * mulitplier;
            const bigX = (startX + object.x) / 2;
            const bigY = (startY + object.y) / 2;
            const bigWidth = Math.abs(startX - object.x) + object.width;
            const bigHeight = Math.abs(startY - object.y) + object.height;
            const big = {
              x: bigX,
              y: bigY,
              width: bigWidth,
              height: bigHeight,
            };
            object.isOnBody = false;
            if (object instanceof ControlledBody) object.wallSide = 1;
            for (const body of this.objects) {
              if (
                (body instanceof StaticBody || body instanceof PhysicalBody) &&
                body._randomId !== object._randomId &&
                !(
                  body instanceof PhysicalBody &&
                  (!body.interactsWithPhysicalBodies ||
                    !object.interactsWithPhysicalBodies)
                )
              ) {
                if (body.collides(big)) {
                  // if started above then on platform
                  if (startY + object.height / 2 <= body.y - body.height / 2) {
                    object.y = body.y - body.height / 2 - object.height / 2;
                    if (body instanceof PhysicalBody) {
                      body.v.y += (object.v.y * object.mass) / body.mass;
                      object.v.y = 0;
                    } else {
                      object.v.y = 0;
                    }
                    object.isOnBody = true;
                    if (object instanceof ControlledBody) object.jumps = 0;
                  } else if (startY - object.height / 2 >= body.y + body.height / 2) {
                    object.y = body.y + body.height / 2 + object.height / 2;
                    if (body instanceof PhysicalBody) {
                      body.v.y += (object.v.y * object.mass) / body.mass;
                      object.v.y = 0;
                    } else {
                      object.v.y = 0;
                    }
                  } else if (startX + object.width / 2 <= body.x - body.width / 2) {
                    object.x = body.x - body.width / 2 - object.width / 2;
                    if (body instanceof PhysicalBody) {
                      body.v.x += (object.v.x * object.mass) / body.mass;
                      object.v.x = 0;
                    } else {
                      object.v.x = 0;
                    }
                    if (
                      object instanceof ControlledBody &&
                      !(body instanceof PhysicalBody) &&
                      object.wallJumps
                    ) {
                      object.jumps = 0;
                      object.wallSide = 0;
                    }
                  } else if (startX - object.width / 2 >= body.x + body.width / 2) {
                    object.x = body.x + body.width / 2 + object.width / 2;
                    if (body instanceof PhysicalBody) {
                      body.v.x += (object.v.x * object.mass) / body.mass;
                      object.v.x = 0;
                    } else {
                      object.v.x = 0;
                    }
                    if (
                      object instanceof ControlledBody &&
                      !(body instanceof PhysicalBody) &&
                      object.wallJumps
                    ) {
                      object.jumps = 0;
                      object.wallSide = 2;
                    }
                    object.v.x = 0;
                  } else {
                    if (this.forceNotInObject) {
                      // started in block
                      const left =
                        object.x - object.width / 2 - (body.x - body.width / 2);
                      const right =
                        body.x + body.width / 2 - (object.x + object.width / 2);
                      const top =
                        body.y - body.height / 2 - (object.y - object.height / 2);
                      const bottom =
                        body.y + body.height / 2 - (object.y + object.height / 2);
                      const val = Math.min(left, right, top, bottom);
                      if (val === top) {
                        object.y = body.y - body.height / 2 - object.height / 2;
                        if (body instanceof PhysicalBody) {
                          body.v.y += (object.v.y * object.mass) / body.mass;
                          object.v.y = 0;
                        } else {
                          object.v.y = 0;
                        }
                        object.isOnBody = true;
                        if (object instanceof ControlledBody) object.jumps = 0;
                      } else if (val === bottom) {
                        object.y = body.y + body.height / 2 + object.height / 2;
                        if (body instanceof PhysicalBody) {
                          body.v.y += (object.v.y * object.mass) / body.mass;
                          object.v.y = 0;
                        } else {
                          object.v.y = 0;
                        }
                      } else if (val === left) {
                        object.x = body.x - body.width / 2 - object.width / 2;
                        if (body instanceof PhysicalBody) {
                          body.v.x += (object.v.x * object.mass) / body.mass;
                          object.v.x = 0;
                        } else {
                          object.v.x = 0;
                        }
                        if (
                          object instanceof ControlledBody &&
                          !(body instanceof PhysicalBody) &&
                          object.wallJumps
                        ) {
                          object.jumps = 0;
                          object.wallSide = 0;
                        }
                      } else {
                        object.x = body.x + body.width / 2 + object.width / 2;
                        if (body instanceof PhysicalBody) {
                          body.v.x += (object.v.x * object.mass) / body.mass;
                          object.v.x = 0;
                        } else {
                          object.v.x = 0;
                        }
                        if (
                          object instanceof ControlledBody &&
                          !(body instanceof PhysicalBody) &&
                          object.wallJumps
                        ) {
                          object.jumps = 0;
                          object.wallSide = 2;
                        }
                        object.v.x = 0;
                      }
                    }
                  }
                }
              }
            }
          } else {
            object.update();
          }
        }
      });
    }
    render() {
      const { x: cameraX, y: cameraY } = this.camera.update();
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.beforeRenderFuncs.forEach((func) => func());
      this.ctx.translate(this.width / 2 - cameraX, this.height / 2 - cameraY);
      this.objects
        .sort((a, b) => a.layer - b.layer)
        .forEach((object) => object._render(this.ctx));
      this.ctx.translate(-this.width / 2 + cameraX, -this.height / 2 + cameraY);
    }
  }
  customElements.define("game-renderer", Renderer, { extends: "canvas" });

  /******************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  function loadImage(name, url, onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // img.addEventListener('load', () => {
      // 	resolve({name: name, img: img});
      // });
      // img.addEventListener('error', (e) => reject(e));
      // img.src = url;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const blob = new Blob([xhr.response]);
          img.addEventListener("load", () => {
            resolve({ name: name, img: img });
          });
          img.addEventListener("error", () => {
            reject("image failed to load");
          });
          img.src = URL.createObjectURL(blob);
        } else {
          reject("failed status: " + xhr.status.toString());
        }
      });
      xhr.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(e.loaded, e.total);
        } else {
          // average image size
          onProgress(0, 8.1 * 1000); // https://www.pingdom.com/blog/new-facts-and-figures-about-image-format-use-on-websites/#:~:text=Average%20image%20size%20per%20format,a%20Web%20page%20on%20average.
        }
      });
      xhr.addEventListener("error", () => {
        reject("Network error or blocked by cors");
      });
      xhr.send();
    });
  }
  function loadImages(images, onProgress = () => {}) {
    return __awaiter(this, void 0, void 0, function* () {
      const loadedNumbers = Object.keys(images).map(() => 0);
      const totalNumbers = Object.keys(images).map(() => 1);
      const imgs = Object.keys(images).map((key, idx) =>
        loadImage(key, images[key], (loaded, total) => {
          // console.log(key, (loaded / total) * 100);
          loadedNumbers[idx] = loaded;
          totalNumbers[idx] = total;
          onProgress(
            loadedNumbers.reduce((a, b) => a + b),
            totalNumbers.reduce((a, b) => a + b)
          );
        })
      );
      const loadedImgs = yield Promise.all(imgs);
      const finishedImgs = {};
      loadedImgs.forEach(({ name, img }) => {
        finishedImgs[name] = img;
      });
      return finishedImgs;
    });
  }

  exports.ControlledBody = ControlledBody;
  exports.GameObject = GameObject;
  exports.PhysicalBody = PhysicalBody;
  exports.Renderer = Renderer;
  exports.StaticBody = StaticBody;
  exports.loadImages = loadImages;
});
