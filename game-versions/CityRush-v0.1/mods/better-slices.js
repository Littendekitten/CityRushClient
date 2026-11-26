export default {
  id: "better-slices",
  name: "BetterSlices",
  description: "Camera-frustum culling for streamed world cells. Requires WorldSlicer.",
  init(api) {
    if (!api.worldSlicerEnabled) throw new Error("BetterSlices requires WorldSlicer.");
    api.setBetterSlices(true);
    api.onModUnload(() => api.setBetterSlices(false));
  }
};
