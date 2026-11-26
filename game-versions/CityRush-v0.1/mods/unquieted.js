export default {
  id: "unquieted",
  name: "Unquieted",
  description: "Original procedural ambient music with a configurable volume and hotkey.",
  init(api) {
    const config = api.modConfig || {};
    const volume = Math.max(0, Math.min(1, (Number(config.unquietedVolume ?? 25) || 0) / 100));
    const keybind = typeof config.unquietedKeybind === "string" ? config.unquietedKeybind : "KeyM";
    let context = null, master = null, timer = null, nextStep = 0, step = 0, enabled = true, started = false;
    const notes = [261.63, 329.63, 392.00, 493.88, 392.00, 329.63, 293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 246.94, 293.66, 369.99, 440.00];
    const bass = [130.81, 146.83, 110.00, 123.47];
    function ensureAudio() {
      context = api.getAudioContext();
      if (!context) return false;
      if (!master) { master = context.createGain(); master.gain.value = volume; master.connect(context.destination); }
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
      const ahead = context.currentTime + 0.35;
      const beat = 60 / 92;
      while (nextStep < ahead) {
        const idx = step % notes.length;
        scheduleNote(notes[idx], nextStep, beat * 0.68, "triangle", 0.10);
        if (step % 4 === 0) scheduleNote(bass[(step / 4) % bass.length | 0], nextStep, beat * 1.7, "sine", 0.12);
        nextStep += beat / 2; step++;
      }
    }
    async function startMusic() {
      if (!enabled || started) return;
      if (!ensureAudio()) return;
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
        if (ensureAudio()) master.gain.setTargetAtTime(volume, context.currentTime, 0.06);
        startMusic();
      }
    }
    const onStart = () => { if (enabled) { ensureAudio(); if (master) master.gain.value = volume; startMusic(); } };
    const onKeyDown = event => {
      if (event.code !== keybind || event.repeat || event.target?.matches?.('input,textarea,select,[contenteditable="true"]')) return;
      event.preventDefault();
      event.stopPropagation();
      toggleMusic();
    };
    window.addEventListener("cityrush:start", onStart);
    document.addEventListener("keydown", onKeyDown);
    api.unquieted = { toggle: toggleMusic, setVolume(value) { if (master && context) master.gain.setTargetAtTime(Math.max(0, Math.min(1, Number(value) / 100)), context.currentTime, 0.04); } };
    api.onModUnload(() => {
      window.removeEventListener("cityrush:start", onStart); document.removeEventListener("keydown", onKeyDown);
      if (timer) window.clearInterval(timer); timer = null;
      if (master && context) { try { master.gain.setTargetAtTime(0, context.currentTime, 0.03); master.disconnect(); } catch {} }
      master = null; api.unquieted = null;
    });
  }
};
