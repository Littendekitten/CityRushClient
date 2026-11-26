export default {
  id: "better-graphics",
  name: "BetterGraphics",
  description: "Increases renderer pixel density and shadow-map resolution for a more detailed image.",
  init(api) {
    api.setBetterGraphics(true);
    api.onModUnload(() => api.setBetterGraphics(false));
  }
};
