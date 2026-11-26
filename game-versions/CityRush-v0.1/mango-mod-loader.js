const params = new URLSearchParams(window.location.search);
const instance = params.get("instance");
const requestedMods = (params.get("mods") || "").split(",").map(x => x.trim()).filter(Boolean);
let modConfig = {};
try { modConfig = JSON.parse(params.get("modConfig") || "{}") || {}; } catch (error) { console.warn("[MangoMod] Invalid instance mod config", error); }

if (instance === "mangomod" && window.CityRushAPI) {
  const api = window.CityRushAPI;
  api.instance = "mangomod";
  api.modConfig = modConfig;
  const known = {
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
  for (const id of requestedMods) {
    const modulePath = known[id];
    if (!modulePath) continue;
    try {
      const module = await import(modulePath);
      const mod = module.default;
      if (mod && typeof mod.init === "function") {
        await mod.init(api);
        api.loadedMods.push(mod.id || id);
      }
    } catch (error) {
      console.error(`[MangoMod] Could not load ${id}`, error);
      api.modErrors.push({ id, message: error.message });
    }
  }
  console.info("[MangoMod] Loaded mods:", api.loadedMods);
}
