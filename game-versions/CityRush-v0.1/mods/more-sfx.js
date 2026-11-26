export default {
  id: "more-sfx",
  name: "MoreSFX",
  description: "Adds synthesized sound effects for core gameplay actions.",
  init(api) {
    const play = (type) => {
      const ctx = api.getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") { ctx.resume().catch(() => {}); }
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
      const presets = {
        footstep: [105, 72, 0.055, "triangle"],
        jump: [210, 520, 0.18, "sine"],
        land: [100, 54, 0.09, "triangle"],
        fail: [240, 72, 0.30, "sawtooth"],
        respawn: [160, 440, 0.48, "sine"],
        interact: [420, 680, 0.10, "sine"],
        pickup: [620, 1120, 0.16, "sine"],
        mission: [440, 1320, 0.38, "triangle"],
        hit: [180, 48, 0.24, "sawtooth"],
        door: [180, 420, 0.42, "triangle"],
        exit: [420, 180, 0.28, "sine"],
        rocket: [90, 720, 1.1, "sawtooth"],
        start: [330, 660, 0.24, "triangle"]
      };
      const [from, to, duration, waveform] = presets[type] || presets.interact;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(from, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(type === "footstep" ? 0.055 : 0.16, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(master);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.025);
      oscillator.onended = () => { try { master.disconnect(); } catch {} };
    };
    const onSfx = event => play(event.detail?.type || "interact");
    api.moreSFXEnabled = true;
    window.addEventListener("cityrush:sfx", onSfx);
    api.onModUnload(() => { window.removeEventListener("cityrush:sfx", onSfx); api.moreSFXEnabled = false; });
  }
};
