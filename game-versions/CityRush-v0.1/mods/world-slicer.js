export default {
  id: "world-slicer",
  name: "WorldSlicer",
  description: "Streams a configurable radius of procedural city cells around the player.",
  async init(api) {
    const radius = Number(api.modConfig?.worldSlicerRadius ?? 2);
    api.setWorldCellRadius(Number.isFinite(radius) ? radius : 2);
    api.worldSlicerEnabled = true;
    api.onModUnload(() => { api.worldSlicerEnabled = false; api.setWorldCellRadius(2); api.setBetterSlices(false); });
    if (api.modConfig?.betterMapsEnabled && api.worldSlicerEnabled) {
      const module = await import("./better-maps.js");
      await module.default.init(api);
      if (!api.loadedMods.includes("better-maps")) api.loadedMods.push("better-maps");
    }
  }
};
