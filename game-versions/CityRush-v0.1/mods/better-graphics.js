export default {
  id: "better-graphics",
  name: "BetterGraphics",
  description: "Improves lighting, output sharpness, shadow quality and texture filtering.",
  init(api) {
    api.setBetterGraphics(true);
    api.onModUnload(() => api.setBetterGraphics(false));
  }
};
