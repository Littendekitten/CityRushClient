export default {
  id: "cursor-capture",
  name: "CursorCapture",
  description: "Keeps the game cursor captured. ESC can temporarily unlock it when BetterESC is installed; click the game to capture again.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");
    api.cursorCaptureEnabled = true;
    api.cursorCaptureSuspended = false;
    const captureFromClick = event => {
      if (event.button !== 0 || !canvas.contains(event.target) || !api.isPlaying()) return;
      // A click is the required fresh user gesture after ESC or a browser lock loss.
      if (api.cursorCaptureSuspended) api.cursorCaptureSuspended = false;
      // In Chromium fullscreen, request Escape Keyboard Lock from the initial trusted click,
      // not after Escape has already been pressed. Unsupported browsers simply use native ESC.
      try {
        const topWindow = window.parent;
        const keyboard = topWindow.navigator?.keyboard;
        if (topWindow.document?.fullscreenElement && typeof keyboard?.lock === "function" && !api.keyboardEscapeLocked) {
          keyboard.lock(["Escape"]).then(() => { api.keyboardEscapeLocked = true; }).catch(() => {});
        }
      } catch { /* Cross-document keyboard lock is optional. */ }
      if (document.pointerLockElement !== canvas) api.requestCursorLock().catch(error => console.warn("[CursorCapture] Browser blocked pointer lock", error));
    };
    const onLockChange = () => {
      if (document.pointerLockElement === canvas) {
        api.cursorCaptureSuspended = false;
        api.escapeUnlockPending = false;
      } else if (api.escapeUnlockPending && api.betterEscEnabled) {
        api.cursorCaptureSuspended = true;
        api.escapeUnlockPending = false;
      }
    };
    canvas.addEventListener("pointerdown", captureFromClick);
    document.addEventListener("pointerlockchange", onLockChange);
    api.onModUnload(() => {
      canvas.removeEventListener("pointerdown", captureFromClick);
      document.removeEventListener("pointerlockchange", onLockChange);
      api.cursorCaptureEnabled = false;
      api.cursorCaptureSuspended = false;
      if (!api.shiftLockEnabled && !api.rightMouseLookActive) api.releaseCursorLock();
    });
  }
};
