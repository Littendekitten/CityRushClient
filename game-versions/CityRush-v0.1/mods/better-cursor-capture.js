export default {
  id: "better-cursor-capture",
  name: "BetterCursorCapture",
  description: "Hold the right mouse button to look around without browser context menus or custom cursor-capture notices.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");
    api.rightMouseLookEnabled = true;
    const onContextMenu = event => { if (canvas.contains(event.target)) event.preventDefault(); };
    const beginRightLook = event => {
      if (event.button !== 2 || !canvas.contains(event.target) || !api.isPlaying()) return;
      event.preventDefault();
      api.rightMouseLookActive = true;
      api.requestCursorLock().catch(error => console.warn("[BetterCursorCapture] Pointer lock request was blocked", error));
    };
    const endRightLook = event => {
      if (event && typeof event.button === "number" && event.button !== 2) return;
      if (!api.rightMouseLookActive) return;
      api.rightMouseLookActive = false;
      if (!api.shiftLockEnabled && !(api.cursorCaptureEnabled && !api.cursorCaptureSuspended)) api.releaseCursorLock();
    };
    const onLockChange = () => {
      if (document.pointerLockElement !== canvas && api.rightMouseLookActive) api.rightMouseLookActive = false;
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
