export default {
  id: "better-esc",
  name: "BetterESC",
  description: "ESC releases the pointer lock when CursorCapture is enabled. Click the game again to recapture.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");
    if (!api.cursorCaptureEnabled) {
      console.warn("[BetterESC] CursorCapture is not enabled; BetterESC will stay inactive.");
      return;
    }
    api.betterEscEnabled = true;
    const onKeyDown = event => {
      if (event.code !== "Escape" || !api.cursorCaptureEnabled) return;
      api.escapeUnlockPending = true;
      api.cursorCaptureSuspended = true;
      api.shiftLockEnabled = false;
      api.rightMouseLookActive = false;
      // The browser's native ESC handling exits pointer lock. We also request release
      // to cover browsers which dispatch the key to the iframe before native unlock.
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
