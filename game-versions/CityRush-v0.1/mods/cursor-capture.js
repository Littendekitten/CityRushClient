export default {
  id: "cursor-capture",
  name: "CursorCapture",
  description: "Captures the cursor on a fresh game click. After the browser releases pointer lock, it waits briefly and retries only on a later deliberate click.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");
    api.cursorCaptureEnabled = true;
    api.cursorCaptureSuspended = false;
    let wasLocked = document.pointerLockElement === canvas;
    let requestPending = false;
    let lockLostAt = -Infinity;
    const RECOVERY_DELAY_MS = 650;
    const requestFromGesture = event => {
      if (!event.isTrusted || event.button !== 0 || !canvas.contains(event.target) || !api.isPlaying()) return;
      if (document.pointerLockElement === canvas || requestPending) return;
      // Chromium rejects a pointer-lock request made immediately after its ESC unlock transition.
      // Ignore that click quietly; the next fresh click after the short cooldown can capture normally.
      if (performance.now() - lockLostAt < RECOVERY_DELAY_MS) { api.cursorCaptureSuspended = true; return; }
      requestPending = true;
      let request;
      try { request = api.requestCursorLock(); } catch (error) { request = Promise.reject(error); }
      Promise.resolve(request).then(() => {
        wasLocked = document.pointerLockElement === canvas;
        api.cursorCaptureSuspended = !wasLocked;
      }).catch(error => {
        api.cursorCaptureSuspended = true;
        if (error?.name !== "SecurityError") console.error("[CursorCapture] Pointer lock request failed", error);
      }).finally(() => { requestPending = false; });
    };
    const onLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      if (locked) {
        wasLocked = true; api.cursorCaptureSuspended = false; api.escapeUnlockPending = false;
      } else if (wasLocked) {
        wasLocked = false; lockLostAt = performance.now(); api.cursorCaptureSuspended = true; api.rightMouseLookActive = false;
      }
    };
    canvas.addEventListener("pointerdown", requestFromGesture);
    document.addEventListener("pointerlockchange", onLockChange);
    api.onModUnload(() => {
      canvas.removeEventListener("pointerdown", requestFromGesture);
      document.removeEventListener("pointerlockchange", onLockChange);
      api.cursorCaptureEnabled = false; api.cursorCaptureSuspended = false;
      if (!api.shiftLockEnabled && !api.rightMouseLookActive) api.releaseCursorLock();
    });
  }
};
