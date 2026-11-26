export default {
  id: "better-esc",
  name: "BetterESC",
  description: "A single ESC releases pointer lock; double-tap ESC restores the hidden client bar when supported.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");
    if (!api.cursorCaptureEnabled) return;
    api.betterEscEnabled = true;
    const onKeyDown = event => {
      if (event.code !== "Escape" || event.repeat || !api.cursorCaptureEnabled) return;
      event.preventDefault();
      event.stopPropagation();
      api.escapeUnlockPending = true;
      api.cursorCaptureSuspended = true;
      api.shiftLockEnabled = false;
      api.rightMouseLookActive = false;
      if (document.pointerLockElement === canvas) api.releaseCursorLock();
    };
    document.addEventListener("keydown", onKeyDown, true);
    api.onModUnload(() => {
      document.removeEventListener("keydown", onKeyDown, true);
      api.betterEscEnabled = false;
      api.escapeUnlockPending = false;
      api.cursorCaptureSuspended = false;
    });
  }
};
