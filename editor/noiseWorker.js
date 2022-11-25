importScripts("/lib/noise.js");

function log(...args) {
  postMessage({ type: "log", value: args });
}

const generateNoise = async (width, height, onProgress = (loaded, total) => {}) => {
  const data = Array(width * height).fill();

  const start = Date.now();

  for (let x = 0; x < width; x++) {
    await onProgress(x, width);
    for (let y = 0; y < height; y++) {
      const value = Math.abs(noise.perlin2(x / 100, y / 100));

      const cell = x + y * width;
      data[cell] = value;
    }
  }
  const end = Date.now();

  return data;
};

const condenseNoise = async (
  noise,
  width,
  height,
  compressionFactor,
  onProgress = (loaded, total) => {}
) => {
  try {
		log()
    const data = Array(noise.length / compressionFactor ** 2);

    const start = Date.now();

    for (let x = 0; x < width / compressionFactor; x += 1) {
      await onProgress(x, width);
      for (let y = 0; y < height / compressionFactor; y += 1) {
        const cells = [
          // top left
          noise[x * compressionFactor + y * compressionFactor * width],
          // top right
          noise[x * compressionFactor + 1 + y * compressionFactor * width],
          // bottom left
          noise[x * compressionFactor + (y * compressionFactor + 1) * width],
          // bottom right
          noise[x * compressionFactor + 1 + (y * compressionFactor + 1) * width],
        ];

        const avg = cells.reduce((a, b) => a + b) / cells.length;

        data[x + (y * width) / compressionFactor] = avg;
      }
    }

    const end = Date.now();

    return data;
  } catch (e) {
    postMessage({ type: "error", value: e });
  }
};

/**
 *
 * @param {{top: boolean, left: boolean, right: boolean, bottom: boolean }} neighbors
 */
const getType = (neighbors) => {
  if (!neighbors.top && !neighbors.bottom && !neighbors.right && !neighbors.left) {
    return "mid";
  } else if (!neighbors.top && !neighbors.left && !neighbors.bottom) {
    return "mid_right";
  } else if (!neighbors.left && !neighbors.bottom && !neighbors.right) {
    return "top_mid";
  } else if (!neighbors.bottom && !neighbors.right && !neighbors.top) {
    return "mid_left";
  } else if (!neighbors.right && !neighbors.top && !neighbors.left) {
    return "bottom_mid";
  } else if (!neighbors.top && !neighbors.right) {
    return "bottom_left";
  } else if (!neighbors.right && !neighbors.bottom) {
    return "top_left";
  } else if (!neighbors.bottom && !neighbors.left) {
    return "top_right";
  } else if (!neighbors.left && !neighbors.top) {
    return "bottom_right";
  } else if (!neighbors.top) {
    return "bottom";
  } else if (!neighbors.right) {
    return "left";
  } else if (!neighbors.bottom) {
    return "top";
  } else if (!neighbors.left) {
    return "right";
  } else {
    return "single";
  }
};

const processNoise = async (noise, width, height, onProgress = (loaded, total) => {}) => {
  const data = Array(noise.length).fill(false);

  const start = Date.now();

  const threshold = 0.1;

  const c = (x, y) => {
    if (x < 0 || y < 0 || x > width || y > height) {
      return true;
    }
    const val = noise[x + y * width];
    return val < threshold;
  };

  for (let x = 0; x < width; x += 1) {
    await onProgress(x, width);
    for (let y = 0; y < height; y += 1) {
      if (noise[x + y * width] < threshold) {
        continue;
      }

      const neighbors = {
        top: c(x, y - 1),
        left: c(x - 1, y),
        bottom: c(x, y + 1),
        right: c(x + 1, y),
      };
      // if (noise[x + y * width] === undefined) log(x, y);

      data[x + y * width] = { image: getType(neighbors), value: noise[x + y * width] };
    }
  }

  const end = Date.now();

  return data;
};

onmessage = async (e) => {
  try {
    const [width, height, compressionFactor] = [...e.data];
    const generateRes = await generateNoise(width, height, (loaded, total) =>
      postMessage({ type: "progress", value: loaded / total, job: "generate" })
    );
    const condenseRes = await condenseNoise(
      generateRes,
      width,
      height,
      compressionFactor,
      (loaded, total) =>
        postMessage({ type: "progress", value: loaded / total, job: "condense" })
    );

    const processRes = await processNoise(
      condenseRes,
      width / compressionFactor,
      height / compressionFactor,
      (loaded, total) =>
        postMessage({ type: "progress", value: loaded / total, job: "process" })
    );

    // must be divisible into full size
    const loadingChunkSize = 10 ** 5;
    const chunks = generateRes.length / loadingChunkSize;

    for (let i = 0; i < chunks; i += 1) {
      postMessage({
        type: "progress",
        data: processRes.slice(
          i * loadingChunkSize,
          i * loadingChunkSize + loadingChunkSize
        ),
        value: i / chunks,
        index: i * loadingChunkSize,
        job: "load",
      });
    }

    postMessage({ type: "complete", value: true, job: "finish" });
  } catch (e) {
    postMessage({ type: "error", value: e });
  }
};
