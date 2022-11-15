const { Renderer, ControlledBody, StaticBody, PhysicalBody, GameObject, loadImages } = plat;

// Create a renderer
// This handles physics and rendering for you.
const renderer = new Renderer();
renderer.mount(document.querySelector(".game")).enablePhysics({}).resize();

renderer.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });