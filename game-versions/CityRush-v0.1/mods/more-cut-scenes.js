export default {
  id: "more-cut-scenes",
  name: "MoreCutScenes",
  description: "Plays a non-skippable, coordinate-personalized building-entry cinematic with camera animation, title treatment and effects.",
  init(api) {
    api.moreCutScenesEnabled = true;
    api.onModUnload(() => { api.moreCutScenesEnabled = false; });
  }
};
