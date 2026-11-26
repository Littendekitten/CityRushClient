const params = new URLSearchParams(window.location.search);
const instance = params.get("instance");
const requestedMods = (params.get("mods") || "").split(",").map(x => x.trim()).filter(Boolean);

if (instance === "mangomod" && window.CityRushAPI) {
  window.CityRushAPI.instance = "mangomod";
  for (const id of requestedMods) {
    const known = {
      "better-translations": "./mods/better-translations.js",
      "ctrl-shit-lock": "./mods/ctrl-shit-lock.js",
      "better-cursor-capture": "./mods/better-cursor-capture.js"
    };
    const modulePath = known[id];
    if (!modulePath) continue;
    try {
      const module = await import(modulePath);
      const mod = module.default;
      if (mod && typeof mod.init === "function") {
        await mod.init(window.CityRushAPI);
        window.CityRushAPI.loadedMods.push(mod.id || id);
      }
    } catch (error) {
      console.error(`[MangoMod] Could not load ${id}`, error);
      window.CityRushAPI.modErrors.push({ id, message: error.message });
    }
  }
  console.info("[MangoMod] Loaded mods:", window.CityRushAPI.loadedMods);
}
