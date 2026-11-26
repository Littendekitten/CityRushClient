export default {
  id: "better-cursor-capture",
  name: "BetterCursorCapture",
  description: "Hold the right mouse button to capture the cursor and look around without browser context menus.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");

    api.rightMouseLookEnabled = true;

    const preventGameContextMenu = event => {
      // The game is isolated in its own iframe, so suppress the browser's
      // right-click menu throughout this game document while the mod is active.
      event.preventDefault();
    };
    const preventGameSelection = event => event.preventDefault();
    const beginRightLook = event => {
      if (event.pointerType !== "mouse" || event.button !== 2 || !canvas.contains(event.target)) return;
      event.preventDefault();
      api.rightMouseLookActive = true;
      try {
        const result = canvas.requestPointerLock?.();
        if (result && typeof result.catch === "function") {
          result.catch(error => console.warn("[BetterCursorCapture] Pointer lock unavailable; using captured pointer movement.", error));
        }
      } catch (error) {
        console.warn("[BetterCursorCapture] Pointer lock unavailable; using captured pointer movement.", error);
      }
    };
    const endRightLook = event => {
      if (event && typeof event.button === "number" && event.button !== 2) return;
      api.rightMouseLookActive = false;
      if (document.pointerLockElement === canvas) document.exitPointerLock?.();
    };
    const onContextMenu = event => preventGameContextMenu(event);
    const onPointerLockChange = () => {
      if (api.rightMouseLookActive && document.pointerLockElement !== canvas) {
        api.rightMouseLookActive = false;
      }
    };

    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("selectstart", preventGameSelection, true);
    document.addEventListener("dragstart", preventGameSelection, true);
    document.addEventListener("pointerdown", beginRightLook, true);
    document.addEventListener("pointerup", endRightLook, true);
    document.addEventListener("mouseup", endRightLook, true);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    window.addEventListener("blur", endRightLook);

    api.onModUnload(() => {
      endRightLook();
      api.rightMouseLookEnabled = false;
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("selectstart", preventGameSelection, true);
      document.removeEventListener("dragstart", preventGameSelection, true);
      document.removeEventListener("pointerdown", beginRightLook, true);
      document.removeEventListener("pointerup", endRightLook, true);
      document.removeEventListener("mouseup", endRightLook, true);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      window.removeEventListener("blur", endRightLook);
    });
  }
};
