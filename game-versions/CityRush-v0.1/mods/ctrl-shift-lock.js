export default {
  id: "ctrl-shift-lock",
  name: "CtrlShiftLock",
  description: "Press Ctrl to toggle a shoulder camera lock without turning the avatar toward the camera. Shift still sprints.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");

    const indicator = document.createElement("div");
    indicator.id = "mango-ctrl-shift-lock-indicator";
    indicator.textContent = "SHIFT LOCK ON";
    indicator.style.cssText = "position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:20;padding:6px 10px;border:1px solid #ffd34d;border-radius:999px;background:#141a26dd;color:#ffd34d;font:800 10px/1 system-ui,sans-serif;letter-spacing:.12em;display:none;pointer-events:none;text-shadow:0 1px 3px #000";
    document.body.appendChild(indicator);

    const updateIndicator = () => {
      indicator.style.display = api.shiftLockEnabled ? "block" : "none";
    };

    const onKeyDown = event => {
      if (event.code !== "ControlLeft" && event.code !== "ControlRight") return;
      if (event.repeat || event.target?.matches?.('input,textarea,select,[contenteditable="true"]')) return;
      event.preventDefault();
      const result = api.setShiftLock(!api.shiftLockEnabled);
      updateIndicator();
      if (result && typeof result.catch === "function") {
        result.catch(error => {
          updateIndicator();
          console.warn("[CtrlShiftLock] Could not activate camera lock", error);
        });
      }
    };

    const onPointerLockChange = () => {
      // Escape or browser lock loss disables the mod cleanly.
      if (document.pointerLockElement !== canvas && api.shiftLockEnabled) {
        api.shiftLockEnabled = false;
        updateIndicator();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    api.onModUnload(() => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      indicator.remove();
      api.setShiftLock(false);
    });
    api.ctrlShiftLockEnabled = true;
  }
};
