const worker = new Worker("./noiseWorker.js");
worker.addEventListener("error", ({ message, lineno, colno }) => {
  console.error(
    "Worker Error:",
    message,
    "at line ",
    lineno.toString() + ":" + colno.toString()
  );
});

const generateWorld = (size = 4000) =>
  new Promise((resolve, reject) => {
    try {
      worker.addEventListener("message", async ({ data }) => {
        if (data.type === "progress") {
          loadingBar.style.width = (data.value * 100).toString() + "%";
          loadingStatus.innerHTML =
            data.job === "generate"
              ? "Generating world..."
              : data.job === "condense"
              ? "Compressing world..."
              : "Processing world...";
        } else if (data.type === "complete") {
          resolve(data.value);
        } else if (data.type === "error") {
          console.error(data.value);
        }
      });

      worker.postMessage([size, size]);
    } catch (e) {
      reject(e);
    }
  });
