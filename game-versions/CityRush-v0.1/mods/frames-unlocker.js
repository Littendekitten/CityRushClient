export default {
  id: "frames-unlocker",
  name: "FramesUnlocker",
  description: "Sets a selectable game update cap. Unlimited follows the display's native requestAnimationFrame cadence.",
  init(api) {
    api.setFrameCap(api.modConfig?.frameCap ?? 0);
    api.onModUnload(() => api.setFrameCap(0));
  }
};
