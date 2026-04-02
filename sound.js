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
   UI DEL REPRODUCTOR FLOTANTE
   ════════════════════════════════════════════ */
(function buildPlayer() {
  // Estilos del player
  const style = document.createElement('style');
  style.textContent = `
    #soundPlayer {
      position: fixed;
      bottom: 88px;
      left: 24px;
      z-index: 600;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    #soundToggle {
      display: flex;
      align-items: center;
      gap: 10px;
      background: white;
      border: none;
      border-radius: 50px;
      padding: 12px 20px;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(124,58,237,0.2);
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      color: #7c3aed;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    #soundToggle:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(124,58,237,0.3);
    }

    #soundToggle.playing {
      background: linear-gradient(135deg, #7c3aed, #a855f7, #e879a0);
      color: white;
    }

    .sound-icon-wrap {
      display: flex;
      align-items: center;
      gap: 3px;
      height: 18px;
    }

    .sound-bar {
      width: 3px;
      border-radius: 3px;
      background: currentColor;
      transition: height 0.2s ease;
    }

    .sound-bar:nth-child(1) { height: 6px; }
    .sound-bar:nth-child(2) { height: 14px; }
    .sound-bar:nth-child(3) { height: 10px; }
    .sound-bar:nth-child(4) { height: 18px; }
    .sound-bar:nth-child(5) { height: 8px; }

    #soundToggle.playing .sound-bar:nth-child(1) { animation: sb 0.8s 0.0s ease-in-out infinite alternate; }
    #soundToggle.playing .sound-bar:nth-child(2) { animation: sb 0.8s 0.1s ease-in-out infinite alternate; }
    #soundToggle.playing .sound-bar:nth-child(3) { animation: sb 0.8s 0.2s ease-in-out infinite alternate; }
    #soundToggle.playing .sound-bar:nth-child(4) { animation: sb 0.8s 0.3s ease-in-out infinite alternate; }
    #soundToggle.playing .sound-bar:nth-child(5) { animation: sb 0.8s 0.4s ease-in-out infinite alternate; }

    @keyframes sb {
      from { height: 4px; }
      to   { height: 18px; }
    }

    #volumeWrap {
      display: flex;
      align-items: center;
      gap: 10px;
      background: white;
      border-radius: 50px;
      padding: 10px 18px;
      box-shadow: 0 4px 20px rgba(124,58,237,0.15);
      opacity: 0;
      transform: translateY(6px);
      transition: all 0.3s ease;
      pointer-events: none;
    }

    #volumeWrap.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }

    #volumeWrap i {
      color: #a855f7;
      font-size: 0.85rem;
      width: 14px;
    }

    #volumeSlider {
      -webkit-appearance: none;
      appearance: none;
      width: 100px;
      height: 4px;
      border-radius: 4px;
      background: linear-gradient(to right, #a855f7 var(--val, 70%), #e9d5ff var(--val, 70%));
      outline: none;
      cursor: pointer;
    }

    #volumeSlider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #e879a0);
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(124,58,237,0.4);
    }

    #soundHint {
      position: fixed;
      bottom: 148px;
      left: 24px;
      background: linear-gradient(135deg, #7c3aed, #e879a0);
      color: white;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 50px;
      box-shadow: 0 4px 20px rgba(124,58,237,0.3);
      animation: hint-bounce 2s ease-in-out infinite;
      z-index: 600;
      white-space: nowrap;
    }

    #soundHint::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 20px;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #e879a0;
    }

    @keyframes hint-bounce {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-4px); }
    }
  `;
  document.head.appendChild(style);

  // Hint
  const hint = document.createElement('div');
  hint.id = 'soundHint';
  hint.textContent = '🎵 Activa el sonido';
  document.body.appendChild(hint);

  // Ocultar hint al hacer scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 200) hint.style.display = 'none';
  }, { once: true });

  // Contenedor
  const player = document.createElement('div');
  player.id = 'soundPlayer';

  // Control de volumen
  const volWrap = document.createElement('div');
  volWrap.id = 'volumeWrap';
  volWrap.innerHTML = `
    <i class="fas fa-volume-down"></i>
    <input type="range" id="volumeSlider" min="0" max="100" value="70" />
    <i class="fas fa-volume-up"></i>
  `;

  // Botón principal
  const btn = document.createElement('button');
  btn.id = 'soundToggle';
  btn.innerHTML = `
    <div class="sound-icon-wrap">
      <div class="sound-bar"></div>
      <div class="sound-bar"></div>
      <div class="sound-bar"></div>
      <div class="sound-bar"></div>
      <div class="sound-bar"></div>
    </div>
    <span id="soundLabel">Activar sonido</span>
  `;

  player.appendChild(volWrap);
  player.appendChild(btn);
  document.body.appendChild(player);

  // Eventos botón
  btn.addEventListener('click', () => {
    hint.style.display = 'none';
    if (SoundEngine.playing) {
      SoundEngine.stop();
      btn.classList.remove('playing');
      document.getElementById('soundLabel').textContent = 'Activar sonido';
      volWrap.classList.remove('show');
    } else {
      SoundEngine.start();
      btn.classList.add('playing');
      document.getElementById('soundLabel').textContent = 'Sonando…';
      volWrap.classList.add('show');
    }
  });

  // Volumen
  const slider = document.getElementById('volumeSlider');
  slider.addEventListener('input', () => {
    const v = slider.value / 100;
    slider.style.setProperty('--val', slider.value + '%');
    SoundEngine.setVolume(v);
  });

  // Ping en botones CTA
  document.querySelectorAll('.btn-primary, .tab-btn, .dot').forEach(el => {
    el.addEventListener('click', () => SoundEngine.ping());
  });
})();
