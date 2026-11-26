export default {
  id: "better-esc",
  name: "BetterESC",
  description: "ESC unlocks the captured cursor; double-tap ESC also restores the hidden CityRush Client bar.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");
    if (!api.cursorCaptureEnabled) return;
    api.betterEscEnabled = true;
    const onKeyDown = event => {
      if (event.code !== "Escape" || event.repeat || !api.cursorCaptureEnabled) return;
      // The game runs in an iframe: notify the launcher on each real press so it can detect a double tap.
      try { window.parent?.postMessage({ type: "cityrush:escape-press" }, window.location.origin); } catch {}
      api.escapeUnlockPending = true;
      api.cursorCaptureSuspended = true;
      api.shiftLockEnabled = false;
      api.rightMouseLookActive = false;
      if (document.pointerLockElement === canvas) {
        event.preventDefault();
        event.stopPropagation();
        api.releaseCursorLock();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    api.onModUnload(() => {
      document.removeEventListener("keydown", onKeyDown, true);
      api.betterEscEnabled = false; api.escapeUnlockPending = false; api.cursorCaptureSuspended = false;
    });
  }
};
