export default {
  id: "more-sfx",
  name: "MoreSFX",
  description: "Adds soft, footstep-like impacts, airy jump movement and richer interaction sounds.",
  init(api) {
    const play = (type) => {
      const ctx = api.getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.17;
      master.connect(ctx.destination);
      const presets = {
        footstep: { duration: .105, cutoff: 360, peak: .16, low: 72 },
        jump: { duration: .24, cutoff: 1250, peak: .10, low: 105 },
        land: { duration: .15, cutoff: 260, peak: .18, low: 58 },
        fail: { duration: .30, cutoff: 420, peak: .14, low: 62 },
        respawn: { duration: .48, cutoff: 900, peak: .12, low: 110 },
        interact: { duration: .11, cutoff: 1500, peak: .085, low: 420 },
        pickup: { duration: .16, cutoff: 1900, peak: .10, low: 560 },
        mission: { duration: .38, cutoff: 1600, peak: .11, low: 360 },
        hit: { duration: .24, cutoff: 360, peak: .2, low: 52 },
        door: { duration: .42, cutoff: 460, peak: .16, low: 78 },
        exit: { duration: .28, cutoff: 750, peak: .12, low: 120 },
        rocket: { duration: 1.1, cutoff: 850, peak: .13, low: 48 },
        start: { duration: .24, cutoff: 1150, peak: .09, low: 220 }
      };
      const preset = presets[type] || presets.interact;
      // A filtered noise transient gives footsteps and jumps a soft, physical texture.
      const length = Math.max(1, Math.floor(ctx.sampleRate * preset.duration));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const envelope = Math.pow(1 - t, type === "jump" ? 1.35 : 2.6);
        data[i] = (Math.random() * 2 - 1) * envelope * (type === "footstep" ? .7 : 1);
      }
      const source = ctx.createBufferSource(); source.buffer = buffer;
      const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.setValueAtTime(preset.cutoff, now); filter.Q.value = .55;
      const noiseGain = ctx.createGain(); noiseGain.gain.setValueAtTime(.0001, now);
      noiseGain.gain.linearRampToValueAtTime(preset.peak, now + .008);
      noiseGain.gain.exponentialRampToValueAtTime(.0001, now + preset.duration);
      source.connect(filter).connect(noiseGain).connect(master); source.start(now); source.stop(now + preset.duration);
      // A restrained low-frequency body adds weight without an arcade-style rising pitch.
      const thud = ctx.createOscillator(), thudGain = ctx.createGain();
      thud.type = "sine"; thud.frequency.setValueAtTime(preset.low, now);
      thudGain.gain.setValueAtTime(.0001, now); thudGain.gain.linearRampToValueAtTime(type === "footstep" ? .045 : .055, now + .006);
      thudGain.gain.exponentialRampToValueAtTime(.0001, now + Math.min(.18, preset.duration));
      thud.connect(thudGain).connect(master); thud.start(now); thud.stop(now + Math.min(.19, preset.duration + .01));
      source.onended = () => { try { master.disconnect(); } catch {} };
    };
    const onSfx = event => play(event.detail?.type || "interact");
    api.moreSFXEnabled = true;
    window.addEventListener("cityrush:sfx", onSfx);
    api.onModUnload(() => { window.removeEventListener("cityrush:sfx", onSfx); api.moreSFXEnabled = false; });
  }
};
