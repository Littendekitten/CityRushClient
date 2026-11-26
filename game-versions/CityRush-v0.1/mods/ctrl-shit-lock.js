export default {
  id: "ctrl-shit-lock",
  name: "CtrlShitLock",
  description: "Toggles a shoulder camera offset with Ctrl without steering the character's facing.",
  init(api) {
    const indicator = document.createElement("div");
    indicator.id = "mango-shiftlock-indicator";
    indicator.textContent = "CAMERA LOCK ON";
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

    window.addEventListener("keydown", onKeyDown);
    api.onModUnload(() => {
      window.removeEventListener("keydown", onKeyDown);
      indicator.remove();
      api.setShiftLock(false);
    });
    api.ctrlShiftLockEnabled = true;
  }
};
