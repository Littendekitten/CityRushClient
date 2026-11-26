export default {
  id: "better-view",
  name: "BetterView",
  description: "Use the mouse wheel to zoom from an 18-unit third-person view down to first-person, with Minecraft-style vertical camera pitch.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");
    api.setBetterView(true);
    const onWheel = event => {
      if (!api.isPlaying()) return;
      event.preventDefault();
      const current = Number.isFinite(api.cameraDistance) ? api.cameraDistance : 7.5;
      // Wheel up zooms in; 0.1 is the first-person stop. Wheel down caps at 18.
      api.setViewDistance(Math.max(0.1, Math.min(18, current + Math.sign(event.deltaY) * 0.9)));
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    api.onModUnload(() => {
      canvas.removeEventListener("wheel", onWheel);
      api.setBetterView(false);
    });
  }
};
