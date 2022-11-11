/**
 *
 * @param {{[key: string]: HTMLImageElement}} images
 */
const initEditor = (images) => {
  Object.keys(images).forEach((key) => {
    images[key].addEventListener("click", () => {
      if (selected === key) {
        selected = "";
      } else {
        selected = key;
      }
      update();
    });
  });
  const update = () => {
    document.querySelector(".editor .blocks").innerHTML = "";
    Object.keys(images).forEach((key) => {
      if (key.startsWith("block") || key.startsWith("spike")) {
        document.querySelector(".editor .blocks").appendChild(images[key]);
        images[key].className = `w-[${blockSize}px] h-[${blockSize}px] ${
          selected === key && "shadow-2xl rounded-md"
        }`;
      }
    });
  };

  let selected = "";

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      selected = "";
      update();
    }
  });

  update();

  return () => selected;
};
