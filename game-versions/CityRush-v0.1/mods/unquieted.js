const RESERVED_KEYS = new Set([
  "Escape", "Tab", "Backspace", "F5", "F11", "F12", "ContextMenu",
  "ControlLeft", "ControlRight", "AltLeft", "AltRight", "ShiftLeft", "ShiftRight", "MetaLeft", "MetaRight",
  "KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"
]);
const ALLOWED_CODE = /^(?:Key[A-Z]|Digit[0-9]|Numpad(?:[0-9]|Add|Subtract|Multiply|Divide|Decimal|Enter|Equal|Comma|ParenLeft|ParenRight)|F(?:[1-9]|1[0-2])|Backquote|Minus|Equal|BracketLeft|BracketRight|Backslash|Semicolon|Quote|Comma|Period|Slash|IntlBackslash|IntlRo|IntlYen|CapsLock|NumLock|ScrollLock|Pause|Insert|Home|PageUp|Delete|End|PageDown|Enter)$/;
export default {
  id: "unquieted",
  name: "Unquieted",
  description: "Original procedural ambient music with a configurable volume and a broad keyboard shortcut selector.",
  init(api) {
    const config = api.modConfig || {};
    let volume = Math.max(0, Math.min(100, Math.round(Number(config.unquietedVolume ?? 25) || 0)));
    const requestedKey = typeof config.unquietedKeybind === "string" ? config.unquietedKeybind : "KeyM";
    const keybind = ALLOWED_CODE.test(requestedKey) && !RESERVED_KEYS.has(requestedKey) ? requestedKey : "KeyM";
    let context = null, master = null, timer = null, nextStep = 0, step = 0, enabled = true, started = false;
    const notes = [261.63, 329.63, 392.00, 493.88, 392.00, 329.63, 293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 246.94, 293.66, 369.99, 440.00];
    const bass = [130.81, 146.83, 110.00, 123.47];
    function ensureAudio() {
      context = api.getAudioContext();
      if (!context) return false;
      if (!master) { master = context.createGain(); master.gain.value = volume / 100; master.connect(context.destination); }
      return true;
    }
    function scheduleNote(freq, when, length, type, gainValue) {
      const osc = context.createOscillator(), gain = context.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, when);
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), when + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + length);
      osc.connect(gain).connect(master); osc.start(when); osc.stop(when + length + 0.04);
    }
    function tick() {
      if (!enabled || !ensureAudio() || context.state !== "running") return;
      const ahead = context.currentTime + 0.35, beat = 60 / 92;
      while (nextStep < ahead) {
        const idx = step % notes.length;
        scheduleNote(notes[idx], nextStep, beat * 0.68, "triangle", 0.10);
        if (step % 4 === 0) scheduleNote(bass[(step / 4) % bass.length | 0], nextStep, beat * 1.7, "sine", 0.12);
        nextStep += beat / 2; step++;
      }
    }
    async function startMusic() {
      if (!enabled || started || !ensureAudio()) return;
      try { await context.resume(); } catch { return; }
      started = true; nextStep = context.currentTime + 0.08; step = 0;
      timer = window.setInterval(tick, 90); tick();
    }
    function stopMusic() {
      enabled = false; started = false;
      if (timer) window.clearInterval(timer);
      timer = null;
      if (master && context) master.gain.setTargetAtTime(0, context.currentTime, 0.035);
    }
    function toggleMusic() {
      if (enabled) stopMusic();
      else {
        enabled = true;
        if (ensureAudio()) master.gain.setTargetAtTime(volume / 100, context.currentTime, 0.06);
        startMusic();
      }
    }
    const onStart = () => { if (enabled) { ensureAudio(); if (master) master.gain.value = volume / 100; startMusic(); } };
    const onKeyDown = event => {
      if (event.code !== keybind || event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.target?.matches?.('input,textarea,select,[contenteditable="true"]')) return;
      event.preventDefault(); event.stopImmediatePropagation(); toggleMusic();
    };
    window.addEventListener("cityrush:start", onStart);
    document.addEventListener("keydown", onKeyDown, true);
    api.unquieted = {
      toggle: toggleMusic,
      setVolume(value) {
        const parsed = Number(value); if (!Number.isFinite(parsed)) return;
        volume = Math.max(0, Math.min(100, Math.round(parsed)));
        if (master && context) master.gain.setTargetAtTime(enabled ? volume / 100 : 0, context.currentTime, 0.04);
      }
    };
    api.onModUnload(() => {
      window.removeEventListener("cityrush:start", onStart); document.removeEventListener("keydown", onKeyDown, true);
      if (timer) window.clearInterval(timer); timer = null;
      if (master && context) { try { master.gain.setTargetAtTime(0, context.currentTime, 0.03); master.disconnect(); } catch {} }
      master = null; api.unquieted = null;
    });
  }
};
