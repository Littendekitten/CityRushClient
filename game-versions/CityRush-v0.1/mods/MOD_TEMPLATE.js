// Copy this file, give the mod a unique id, then add its id + path to mango-mod-loader.js.
export default {
  id: "example-mod",
  name: "Example Mod",
  description: "A starter template for a MangoMod extension.",
  init(api) {
    console.log("Example MangoMod loaded for", api.instance);
    // Use api.onModUnload(() => { ... }) to clean up listeners when unloading.
  }
};
