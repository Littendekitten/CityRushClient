export default {
  id: "ctrl-shift-lock",
  name: "CtrlShiftLock",
  description: "Press Ctrl for a Roblox-style shoulder lock. Your avatar faces the camera direction; Shift still sprints.",
  init(api) {
    const canvas = document.getElementById("c");
    if (!canvas) throw new Error("CityRush game canvas was not found.");
    api.ctrlShiftLockEnabled = true;
    const onKeyDown = event => {
      if (event.code !== "ControlLeft" && event.code !== "ControlRight") return;
      if (event.repeat || event.target?.matches?.('input,textarea,select,[contenteditable="true"]')) return;
      event.preventDefault();
      const result = api.setShiftLock(!api.shiftLockEnabled);
      if (result?.catch) result.catch(error => console.warn("[CtrlShiftLock] Could not activate shift lock", error));
    };
    const onPointerLockChange = () => {
      if (document.pointerLockElement !== canvas && api.shiftLockEnabled) {
        api.shiftLockEnabled = false;
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    api.onModUnload(() => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      api.ctrlShiftLockEnabled = false;
      api.setShiftLock(false);
    });
  }
};
