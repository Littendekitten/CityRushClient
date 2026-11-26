const knownMods = {
  "better-translations": "./mods/better-translations.js",
  "ctrl-shift-lock": "./mods/ctrl-shift-lock.js",
  "better-cursor-capture": "./mods/better-cursor-capture.js",
  "cursor-capture": "./mods/cursor-capture.js",
  "better-esc": "./mods/better-esc.js",
  "unquieted": "./mods/unquieted.js",
  "better-graphics": "./mods/better-graphics.js",
  "world-slicer": "./mods/world-slicer.js",
  "better-slices": "./mods/better-slices.js",
  "frames-unlocker": "./mods/frames-unlocker.js"
};

export async function loadMangoMods(api, requestedMods = []) {
  if (!api) throw new Error("CityRushAPI is not available.");
  api.instance = "mangomod";
  const loaded = [];
  for (const id of requestedMods) {
    const modulePath = knownMods[id];
    if (!modulePath) {
      console.warn(`[MangoMod] Unknown mod ID: ${id}`);
      continue;
    }
    try {
      const module = await import(modulePath);
      const mod = module.default;
      if (!mod || typeof mod.init !== "function") {
        throw new Error("Mod must export a default object with an init(api) function.");
      }
      await mod.init(api);
      api.loadedMods.push(mod.id || id);
      loaded.push(mod.id || id);
    } catch (error) {
      console.error(`[MangoMod] Could not load ${id}`, error);
      api.modErrors.push({ id, message: error?.message || String(error) });
    }
  }
  console.info("[MangoMod] Loaded mods:", loaded);
  return loaded;
}
