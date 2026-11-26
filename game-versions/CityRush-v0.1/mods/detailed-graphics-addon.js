export default {
  id: "detailed-graphics-addon",
  name: "Detailed Graphics Addon",
  description: "Adds eyes, pupils, brows, noses and mouths to characters. Requires BetterGraphics.",
  init(api) {
    if (!api.betterGraphicsEnabled) throw new Error("Detailed Graphics Addon requires BetterGraphics.");
    api.setDetailedGraphicsAddon(true);
    api.onModUnload(() => api.setDetailedGraphicsAddon(false));
  }
};
