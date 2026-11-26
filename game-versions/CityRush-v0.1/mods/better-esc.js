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
      if (event.code !== "Escape" || event.repeat || !api.cursorCaptureEnabled) return;
      // Handle the game action first so Escape releases the pointer without also
      // being interpreted as an app-level shortcut. In fullscreen-capable
      // Chromium browsers, request Keyboard Lock so a normal Escape press can
      // be used for pointer release; the browser retains its long-press exit.
      event.preventDefault();
      event.stopPropagation();
      const keyboard = typeof navigator.keyboard?.lock === "function" ? navigator.keyboard : parent.navigator?.keyboard;
      const fullscreenActive = Boolean(document.fullscreenElement || parent.document?.fullscreenElement);
      if (fullscreenActive && keyboard?.lock && !api.keyboardEscapeLocked) {
        try {
          keyboard.lock(["Escape"]).then(() => { api.keyboardEscapeLocked = true; }).catch(error => {
            console.warn("[BetterESC] Browser keyboard lock is unavailable", error);
          });
        } catch (error) {
          console.warn("[BetterESC] Browser keyboard lock is unavailable", error);
        }
      }
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
      try { (typeof navigator.keyboard?.unlock === "function" ? navigator.keyboard : parent.navigator?.keyboard)?.unlock?.(); } catch {}
      api.keyboardEscapeLocked = false;
    });
  }
};
