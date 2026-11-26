export default {
  id: "better-cursor-capture",
  name: "BetterCursorCapture",
  description: "Hold the right mouse button to look around without context menus; waits for a new gesture after browser pointer-lock release.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");
    api.rightMouseLookEnabled = true;
    let requestPending = false, lockLostAt = -Infinity;
    const RECOVERY_DELAY_MS = 650;
    const onContextMenu = event => { if (canvas.contains(event.target)) event.preventDefault(); };
    const beginRightLook = event => {
      if (event.button !== 2 || !canvas.contains(event.target) || !api.isPlaying()) return;
      event.preventDefault();
      if (requestPending || document.pointerLockElement === canvas) { api.rightMouseLookActive = true; return; }
      if (performance.now() - lockLostAt < RECOVERY_DELAY_MS) { api.rightMouseLookActive = false; return; }
      requestPending = true;
      Promise.resolve().then(() => api.requestCursorLock()).then(() => {
        api.rightMouseLookActive = document.pointerLockElement === canvas;
      }).catch(error => {
        api.rightMouseLookActive = false; api.cursorCaptureSuspended = true;
        if (error?.name !== "SecurityError") console.error("[BetterCursorCapture] Pointer lock request failed", error);
      }).finally(() => { requestPending = false; });
    };
    const endRightLook = event => {
      if (event && typeof event.button === "number" && event.button !== 2) return;
      if (!api.rightMouseLookActive) return;
      api.rightMouseLookActive = false;
      if (!api.shiftLockEnabled && !(api.cursorCaptureEnabled && !api.cursorCaptureSuspended)) api.releaseCursorLock();
    };
    const onLockChange = () => {
      if (document.pointerLockElement !== canvas) {
        if (api.rightMouseLookActive) { api.rightMouseLookActive = false; lockLostAt = performance.now(); }
      }
    };
    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("pointerdown", beginRightLook, true);
    document.addEventListener("pointerup", endRightLook, true);
    document.addEventListener("mouseup", endRightLook, true);
    document.addEventListener("pointerlockchange", onLockChange);
    window.addEventListener("blur", endRightLook);
    api.onModUnload(() => {
      endRightLook(); api.rightMouseLookEnabled = false;
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("pointerdown", beginRightLook, true);
      document.removeEventListener("pointerup", endRightLook, true);
      document.removeEventListener("mouseup", endRightLook, true);
      document.removeEventListener("pointerlockchange", onLockChange);
      window.removeEventListener("blur", endRightLook);
    });
  }
};
