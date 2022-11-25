const worker = new Worker("./noiseWorker.js");
worker.addEventListener("error", ({ message, lineno, colno }) => {
  console.error(
    "Worker Error:",
    message,
    "at line ",
    lineno.toString() + ":" + colno.toString()
  );
});

const generateWorld = (size = 4000, compressionFactor = 2) =>
  new Promise((resolve, reject) => {
    try {
      const finalData = [];

      worker.addEventListener("message", async ({ data }) => {
        if (data.type === "progress") {
          loadingBar.style.width = (data.value * 100).toString() + "%";
          loadingStatus.innerHTML =
            data.job === "generate"
              ? "Terraforming world..."
              : data.job === "condense"
              ? "Freezing water..."
              : data.job === "process"
              ? "Feeding penguin..."
              : data.job === "load"
              ? "Evolving enemies..."
              : "Not sure...";
          if (data.job === "load") {
            finalData.splice(data.index, data.data.length, ...data.data);
          }
        } else if (data.type === "complete") {
          try {
            window.data = finalData;
            resolve(finalData);
          } catch (e) {
            console.error(e);
          }
        } else if (data.type === "error") {
          console.error(data.value);
        } else if (data.type === "log") {
          console.log(...data.value);
        }
      });

      worker.postMessage([size, size, compressionFactor]);
    } catch (e) {
      reject(e);
    }
  });
