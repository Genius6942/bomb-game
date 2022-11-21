importScripts("/lib/noise.js");

const generateNoise = async (width, height, onProgress = (loaded, total) => {}) => {
  const data = Array(width * height).fill();

  const start = Date.now();

  for (let x = 0; x < width; x++) {
    //if (x % 100 == 0) {
    //  noise.seed(Math.random());
    //}
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
  onProgress = (loaded, total) => {}
) => {
  // return noise;
  const data = Array(noise.length / 4);

  const start = Date.now();

  for (let x = 0; x < width; x += 2) {
    await onProgress(x, width);
    for (let y = 0; y < height; y += 2) {
      const cells = [
        // top left
        noise[x + y * width],
        // top right
        noise[x + 1 + y * width],
        // bottom left
        noise[x + (y + 1) * width],
        // bottom right
        noise[x + 1 + (y + 1) * width],
      ];

      const avg = cells.reduce((a, b) => a + b) / cells.length;
      data[x / 2 + (y * width) / 2] = avg;
    }
  }

  const end = Date.now();

  return data;
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

  for (let x = 0; x < width; x += 1) {
    await onProgress(x, width);
    for (let y = 0; y < height; y += 1) {
      if (noise[x + y * width] < threshold) {
        continue;
      }
      // const cell = noise[x + y * width];
      const neighbors = {
        top: noise[x + (y - 1) * width] < threshold,
        left: noise[x - 1 + y * width] < threshold,
        bottom: noise[x + (y + 1) * width] < threshold,
        right: noise[x + 1 + y * width] < threshold,
      };

      data[x + y * width] = { image: getType(neighbors), value: noise[x + y * width] };
    }
  }

  const end = Date.now();

  return data;
};

onmessage = async (e) => {
  try {
    const [width, height] = e.data;
    const generateRes = await generateNoise(width, height, (loaded, total) =>
      postMessage({ type: "progress", value: loaded / total, job: "generate" })
    );

    // const condenseRes = await condenseNoise(generateRes, width, height, (loaded, total) =>
    //   postMessage({ type: "progress", value: loaded / total, job: "condense" })
    // );

    const processRes = await processNoise(generateRes, width, height, (loaded, total) =>
      postMessage({ type: "progress", value: loaded / total, job: "process" })
    );

    // must be divisible into full size
    const loadingChunkSize = 4 * 10 ** 3;
    const chunks = processRes.length / loadingChunkSize;

    for (let i = 0; i < chunks; i += 1) {
      postMessage({
        type: "progress",
        data: processRes.slice(i * chunks, i * chunks + loadingChunkSize),
        value: i / chunks,
        job: "load",
      });
    }

    postMessage({ type: "complete", value: true, job: "finish" });
  } catch (e) {
    postMessage({ type: "error", value: e });
  }
};
