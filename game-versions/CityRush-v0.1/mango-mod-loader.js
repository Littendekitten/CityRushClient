const knownMods = {
  "better-translations": "./mods/better-translations.js",
  "better-view": "./mods/better-view.js",
  "ctrl-shift-lock": "./mods/ctrl-shift-lock.js",
  "better-cursor-capture": "./mods/better-cursor-capture.js",
  "cursor-capture": "./mods/cursor-capture.js",
  "better-esc": "./mods/better-esc.js",
  "unquieted": "./mods/unquieted.js",
  "better-graphics": "./mods/better-graphics.js",
  "better-animations": "./mods/better-animations.js",
  "better-hud": "./mods/better-hud.js",
  "more-cut-scenes": "./mods/more-cut-scenes.js",
  "more-sfx": "./mods/more-sfx.js",
  "world-slicer": "./mods/world-slicer.js",
  "better-slices": "./mods/better-slices.js",
  "frames-unlocker": "./mods/frames-unlocker.js"
};

const dependencies = {
  "better-esc": ["cursor-capture"],
  "better-slices": ["world-slicer"]
};

export async function loadMangoMods(api, requestedMods = []) {
  if (!api) throw new Error("CityRushAPI is not available.");
  api.instance = "mangomod";
  const requested = [...new Set(requestedMods)];
  const selected = new Set(requested);
  const invalid = [];
  for (const id of requested) {
    const missing = (dependencies[id] || []).filter(dep => !selected.has(dep));
    if (missing.length) {
      const message = `${id} requires ${missing.join(", ")}; it was not loaded.`;
      api.modErrors.push({ id, message });
      invalid.push(id);
      console.error(`[MangoMod] ${message}`);
    }
  }
  const invalidSet = new Set(invalid);
  // Topologically order the small fixed dependency graph so parents always initialise first.
  const order = [
    "better-graphics", "world-slicer", "cursor-capture",
    "better-translations", "better-view", "ctrl-shift-lock", "better-cursor-capture", "better-esc",
    "unquieted", "better-animations", "better-hud", "more-cut-scenes", "more-sfx",
    "better-slices", "frames-unlocker"
  ];
  const loaded = [];
  for (const id of order.filter(value => selected.has(value) && !invalidSet.has(value))) {
    const modulePath = knownMods[id];
    if (!modulePath) continue;
    try {
      const module = await import(modulePath);
      const mod = module.default;
      if (!mod || typeof mod.init !== "function") throw new Error("Mod must export a default object with an init(api) function.");
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
