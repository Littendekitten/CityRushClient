export default {
  id: "better-hud",
  name: "BetterHUD",
  description: "Applies the redesigned glass-panel CityRush HUD.",
  init(api) {
    api.setBetterHUD(true);
    api.onModUnload(() => api.setBetterHUD(false));
  }
};
