export default {
  id: "better-translations",
  name: "BetterTranslations",
  description: "Keeps CityRush in English. The game itself ships in English, so no Dutch text flashes during startup.",
  init(api) {
    document.documentElement.lang = "en";
    api.translationsEnabled = true;
    api.onModUnload(() => { api.translationsEnabled = false; });
  }
};
