const RESERVED_GAME_KEYS = new Set(["Escape","Tab","Backspace","F5","F11","F12","ContextMenu","ControlLeft","ControlRight","AltLeft","AltRight","ShiftLeft","ShiftRight","MetaLeft","MetaRight","KeyW","KeyA","KeyS","KeyD","KeyQ","KeyE","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"]);
const KEY_PATTERN = /^(?:Key[A-Z]|Digit[0-9]|Numpad(?:[0-9]|Add|Subtract|Multiply|Divide|Decimal|Enter|Equal|Comma|ParenLeft|ParenRight)|F(?:[1-9]|1[0-2])|Backquote|Minus|Equal|BracketLeft|BracketRight|Backslash|Semicolon|Quote|Comma|Period|Slash|IntlBackslash|IntlRo|IntlYen|CapsLock|NumLock|ScrollLock|Pause|Insert|Home|PageUp|Delete|End|PageDown|Enter)$/;
export default {
  id: "better-view",
  name: "BetterView",
  description: "Zoom with the mouse wheel or hold configurable keys (I to zoom in, O to zoom out). Stops at first-person and caps third-person distance.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");
    api.setBetterView(true);
    const config = api.modConfig || {};
    const valid = code => typeof code === "string" && KEY_PATTERN.test(code) && !RESERVED_GAME_KEYS.has(code);
    const zoomInKey = valid(config.betterViewZoomInKey) ? config.betterViewZoomInKey : "KeyI";
    let zoomOutKey = valid(config.betterViewZoomOutKey) ? config.betterViewZoomOutKey : "KeyO";
    if (zoomOutKey === zoomInKey) zoomOutKey = "KeyO" === zoomInKey ? "KeyI" : "KeyO";
    const held = new Set();
    let raf = 0, previous = 0;
    const minDistance = 0.1, maxDistance = 18, zoomSpeed = 11.5;
    const onWheel = event => {
      if (!api.isPlaying() || !canvas.contains(event.target)) return;
      event.preventDefault();
      const current = Number.isFinite(api.cameraDistance) ? api.cameraDistance : 7.5;
      api.setViewDistance(Math.max(minDistance, Math.min(maxDistance, current + Math.sign(event.deltaY) * 0.9)));
    };
    const onKeyDown = event => {
      if (!api.isPlaying() || event.ctrlKey || event.altKey || event.metaKey || event.target?.closest?.('input,textarea,select,[contenteditable="true"]')) return;
      if (event.code !== zoomInKey && event.code !== zoomOutKey) return;
      event.preventDefault();
      held.add(event.code);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onKeyUp = event => { if (held.delete(event.code) && !held.size && raf) { cancelAnimationFrame(raf); raf = 0; previous = 0; } };
    const onBlur = () => { held.clear(); if (raf) cancelAnimationFrame(raf); raf = 0; previous = 0; };
    function tick(timestamp) {
      if (!held.size || !api.isPlaying()) { raf = 0; previous = 0; return; }
      const dt = previous ? Math.min((timestamp - previous) / 1000, 0.05) : 0;
      previous = timestamp;
      const direction = (held.has(zoomInKey) ? -1 : 0) + (held.has(zoomOutKey) ? 1 : 0);
      if (direction) {
        const current = Number.isFinite(api.cameraDistance) ? api.cameraDistance : 7.5;
        api.setViewDistance(Math.max(minDistance, Math.min(maxDistance, current + direction * zoomSpeed * dt)));
      }
      raf = requestAnimationFrame(tick);
    }
    canvas.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", onBlur);
    api.onModUnload(() => {
      canvas.removeEventListener("wheel", onWheel);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", onBlur);
      onBlur(); api.setBetterView(false);
    });
  }
};
