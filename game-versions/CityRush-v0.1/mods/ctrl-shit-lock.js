export default {
  id: "ctrl-shit-lock",
  name: "CtrlShitLock",
  description: "Toggles a Roblox-style over-the-shoulder camera lock with Ctrl.",
  init(api) {
    const indicator = document.createElement("div");
    indicator.id = "mango-shiftlock-indicator";
    indicator.textContent = "SHIFT LOCK ON";
    indicator.style.cssText = "position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:20;padding:6px 10px;border:1px solid #ffd34d;border-radius:999px;background:#141a26dd;color:#ffd34d;font:800 10px/1 system-ui,sans-serif;letter-spacing:.12em;display:none;pointer-events:none;text-shadow:0 1px 3px #000";
    document.body.appendChild(indicator);

    const onLockChange = () => {
      indicator.style.display = api.shiftLockEnabled ? "block" : "none";
    };
    const onKeyDown = event => {
      if (event.code !== "ControlLeft" && event.code !== "ControlRight") return;
      if (event.repeat || event.target?.matches?.("input,textarea,select")) return;
      event.preventDefault();
      api.setShiftLock(!api.shiftLockEnabled);
      onLockChange();
    };
    const onPointerLock = () => {
      // Esc or the browser leaving pointer lock turns this mod off cleanly.
      if (!document.pointerLockElement && api.shiftLockEnabled) {
        api.shiftLockEnabled = false;
        onLockChange();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerlockchange", onPointerLock);
    api.onModUnload(() => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerlockchange", onPointerLock);
      indicator.remove();
      if (api.shiftLockEnabled) api.setShiftLock(false);
    });
    api.ctrlShiftLockEnabled = true;
  }
};
