export default {
  id: "better-graphics",
  name: "BetterGraphics",
  description: "Enhanced renderer settings and a clean customizable player character.",
  async init(api) {
    if (!api.betterGraphicsEnabled) api.setBetterGraphics(true);
    api.onModUnload(() => { if (api.betterGraphicsEnabled) api.setBetterGraphics(false); });
    if (api.modConfig?.characterModEnabled && api.betterGraphicsEnabled) {
      const module = await import("./character-mod.js");
      await module.default.init(api);
      if (!api.loadedMods.includes("character-mod")) api.loadedMods.push("character-mod");
    }
  }
};
