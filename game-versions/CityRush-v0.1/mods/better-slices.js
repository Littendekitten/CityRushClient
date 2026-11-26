export default {
  id: "better-slices",
  name: "BetterSlices",
  description: "Uses camera-frustum culling to avoid drawing world cells outside the active view.",
  init(api) {
    api.setBetterSlices(true);
    api.onModUnload(() => api.setBetterSlices(false));
  }
};
