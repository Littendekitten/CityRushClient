export default {
  id: "better-graphics",
  name: "BetterGraphics",
  description: "One unified graphics mod for the enhanced world, character models, lighting, shadows and texture filtering.",
  init(api) {
    if (!api.betterGraphicsEnabled) api.setBetterGraphics(true);
    api.onModUnload(() => { if (api.betterGraphicsEnabled) api.setBetterGraphics(false); });
  }
};
