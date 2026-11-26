export default {
  id: "better-animations",
  name: "BetterAnimations",
  description: "Adds smoother character gait, idle breathing, head movement, pedestrian motion and enhanced coin animation.",
  init(api) {
    api.setBetterAnimations(true);
    api.onModUnload(() => api.setBetterAnimations(false));
  }
};
