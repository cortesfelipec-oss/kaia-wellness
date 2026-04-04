/* ============================================
   SOUND HEALING · sound.js
   Cuencos tibetanos con Web Audio API
   ============================================ */

const SoundEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let isPlaying = false;
  let ambientNodes = [];
  let bowlTimeout = null;

  // Frecuencias de chakras / cuencos tibetanos
  const BOWL_FREQS = [
    136.1,  // OM / Do — raíz
    194.18, // Re — sacro
    210.42, // Mi — plexo solar
    256,    // Fa — corazón
    288,    // Sol — garganta
    320,    // La — tercer ojo
    384,    // Si — corona
  ];

  // Frecuencias de drones (pad ambiente)
  const DRONE_FREQS = [
    { freq: 136.1,  gain: 0.04 },  // fundamental OM
    { freq: 272.2,  gain: 0.02 },  // 2ª armónica
    { freq: 204.15, gain: 0.015 }, // quinta
  ];

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
    }
    return ctx;
  }

  /* ── REVERB ─────────────────────────────── */
  function createReverb(audioCtx) {
    const convolver = audioCtx.createConvolver();
    const rate      = audioCtx.sampleRate;
    const length    = rate * 4; // 4 segundos de reverb
    const impulse   = audioCtx.createBuffer(2, length, rate);

    for (let c = 0; c < 2; c++) {
      const channel = impulse.getChannelData(c);
      for (let i = 0; i < length; i++) {
        channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    convolver.buffer = impulse;
    return convolver;
  }

  /* ── DRONE AMBIENTE ─────────────────────── */
  function startDrone(audioCtx, reverb) {
    DRONE_FREQS.forEach(({ freq, gain: gVal }) => {
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type      = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Ligera modulación de frecuencia para calidez
      const lfo = audioCtx.createOscillator();
      const lfog = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.07, audioCtx.currentTime);
      lfog.gain.setValueAtTime(0.3, audioCtx.currentTime);
      lfo.connect(lfog);
      lfog.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(gVal, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(reverb);
      reverb.connect(masterGain);
      osc.start();

      ambientNodes.push(osc, lfo, gain, lfog);
    });
  }

  /* ── GOLPE DE CUENCO ────────────────────── */
  function playBowlStrike(freq, volume = 0.3, when = 0) {
    const audioCtx = getCtx();
    const reverb   = createReverb(audioCtx);
    const t        = audioCtx.currentTime + when;

    // Oscilador principal (fundamental)
    const osc1  = audioCtx.createOscillator();
    const env1  = audioCtx.createGain();
    osc1.type   = 'sine';
    osc1.frequency.setValueAtTime(freq, t);
    // Ligera caída de frecuencia al inicio (efecto cuenco real)
    osc1.frequency.exponentialRampToValueAtTime(freq * 0.998, t + 2);

    env1.gain.setValueAtTime(0, t);
    env1.gain.linearRampToValueAtTime(volume, t + 0.01);
    env1.gain.exponentialRampToValueAtTime(0.001, t + 8);

    // 2ª armónica (octava)
    const osc2  = audioCtx.createOscillator();
    const env2  = audioCtx.createGain();
    osc2.type   = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.756, t); // armónica no entera → calidez
    env2.gain.setValueAtTime(0, t);
    env2.gain.linearRampToValueAtTime(volume * 0.3, t + 0.01);
    env2.gain.exponentialRampToValueAtTime(0.001, t + 5);

    // 3ª armónica
    const osc3  = audioCtx.createOscillator();
    const env3  = audioCtx.createGain();
    osc3.type   = 'sine';
    osc3.frequency.setValueAtTime(freq * 5.1, t);
    env3.gain.setValueAtTime(0, t);
    env3.gain.linearRampToValueAtTime(volume * 0.1, t + 0.005);
    env3.gain.exponentialRampToValueAtTime(0.001, t + 2);

    [osc1, osc2, osc3].forEach((o, i) => {
      const envs = [env1, env2, env3];
      o.connect(envs[i]);
      envs[i].connect(reverb);
      o.start(t);
      o.stop(t + 10);
    });

    reverb.connect(masterGain);
  }

  /* ── SECUENCIA AUTOMÁTICA DE CUENCOS ─────── */
  function scheduleBowls() {
    if (!isPlaying) return;

    // Elige frecuencia aleatoria de la escala
    const freq  = BOWL_FREQS[Math.floor(Math.random() * BOWL_FREQS.length)];
    const vol   = 0.15 + Math.random() * 0.2;
    playBowlStrike(freq, vol);

    // Siguiente golpe entre 8 y 20 segundos
    const next = (8 + Math.random() * 12) * 1000;
    bowlTimeout = setTimeout(scheduleBowls, next);
  }

  /* ── START ──────────────────────────────── */
  function start() {
    const audioCtx = getCtx();

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = true;

    // Fade in del master gain
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 2);

    // Iniciar drone ambiente
    const reverb = createReverb(audioCtx);
    startDrone(audioCtx, reverb);

    // Primer golpe de cuenco tras 1.5s, luego secuencia
    bowlTimeout = setTimeout(() => {
      playBowlStrike(BOWL_FREQS[3], 0.25); // corazón primero
      setTimeout(scheduleBowls, 4000);
    }, 1500);
  }

  /* ── STOP ───────────────────────────────── */
  function stop() {
    if (!ctx) return;
    isPlaying = false;

    clearTimeout(bowlTimeout);

    // Fade out suave
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);

    setTimeout(() => {
      ambientNodes.forEach(n => {
        try { n.stop ? n.stop() : n.disconnect(); } catch (_) {}
      });
      ambientNodes = [];
    }, 2200);
  }

  /* ── VOLUMEN ────────────────────────────── */
  function setVolume(val) {
    if (!masterGain) return;
    const v = Math.max(0, Math.min(1, val));
    masterGain.gain.setTargetAtTime(isPlaying ? v : 0, ctx.currentTime, 0.1);
  }

  /* ── PING al interactuar ─────────────────── */
  function ping() {
    if (!isPlaying) return;
    const freq = BOWL_FREQS[Math.floor(Math.random() * 3) + 2];
    playBowlStrike(freq, 0.08);
  }

  return { start, stop, setVolume, ping, get playing() { return isPlaying; } };
})();

/* ════════════════════════════════════════════
   UI DEL REPRODUCTOR FLOTANTE — botón circular
   ════════════════════════════════════════════ */
(function buildPlayer() {
  const style = document.createElement('style');
  style.textContent = `
    #soundBtn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 600;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.6);
      border-top: 1px solid rgba(255,255,255,0.85);
      background: linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(168,85,247,0.18) 100%);
      backdrop-filter: blur(28px) saturate(160%);
      -webkit-backdrop-filter: blur(28px) saturate(160%);
      box-shadow: 0 8px 24px rgba(109,40,217,0.14), inset 0 1px 0 rgba(255,255,255,0.7);
      cursor: pointer;
      color: #7C3AED;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    #soundBtn:hover { transform: scale(1.1); }
    #soundBtn.playing {
      background: linear-gradient(135deg, #7c3aed, #e879a0);
      color: white;
      border-color: rgba(255,255,255,0.4);
      box-shadow: 0 8px 28px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.5);
    }
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.id = 'soundBtn';
  btn.setAttribute('aria-label', 'Activar sonido');
  btn.innerHTML = '<i class="fas fa-music"></i>';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    if (SoundEngine.playing) {
      SoundEngine.stop();
      btn.classList.remove('playing');
    } else {
      SoundEngine.start();
      btn.classList.add('playing');
    }
  });

  // Ping en botones CTA
  document.querySelectorAll('.btn-primary, .tab-btn, .dot').forEach(el => {
    el.addEventListener('click', () => SoundEngine.ping());
  });
})();
