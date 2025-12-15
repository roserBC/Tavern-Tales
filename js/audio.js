// js/audio.js
(() => {
    const AUDIO_SRC = "assets/suno_1.mp3";
    const KEY = "bgm_state_v1";
  
    const defaultState = {
      muted: false,
      volume: 0.35,
      time: 0,
      enabled: true
    };
  
    function loadState() {
      try {
        return { ...defaultState, ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
      } catch {
        return { ...defaultState };
      }
    }
  
    function saveState(patch) {
      const current = loadState();
      const next = { ...current, ...patch };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    }
  
    function ensureAudio() {
      let audio = document.getElementById("bgm");
      if (!audio) {
        audio = document.createElement("audio");
        audio.id = "bgm";
        audio.src = AUDIO_SRC;
        audio.loop = true;
        audio.preload = "auto";
        audio.setAttribute("playsinline", "");
        document.body.appendChild(audio);
      }
      return audio;
    }
  
    function ensureButton() {
      if (document.getElementById("bgmToggle")) return;
  
      const btn = document.createElement("button");
      btn.id = "bgmToggle";
      btn.type = "button";
      btn.setAttribute("aria-label", "Activar o desactivar la música");
      btn.style.position = "fixed";
      btn.style.right = "16px";
      btn.style.bottom = "16px";
      btn.style.zIndex = "9999";
      btn.style.border = "1px solid rgba(244,233,209,.25)";
      btn.style.borderRadius = "999px";
      btn.style.padding = "10px 12px";
      btn.style.cursor = "pointer";
      btn.style.background = "rgba(33,40,23,.75)";     // #212817
      btn.style.color = "#f4e9d1";
      btn.style.backdropFilter = "blur(6px)";
      btn.style.boxShadow = "0 10px 25px rgba(0,0,0,.35)";
  
      document.body.appendChild(btn);
  
      btn.addEventListener("click", () => {
        const audio = ensureAudio();
        const st = loadState();
  
        // Toggle mute
        const nextMuted = !audio.muted;
        audio.muted = nextMuted;
        saveState({ muted: nextMuted, enabled: true });
  
        // Si l’usuari activa el so, intentem play (requereix gest, i aquest click ja ho és)
        if (!nextMuted) {
          audio.play().catch(() => {});
        }
  
        renderButton();
      });
    }
  
    function renderButton() {
      const btn = document.getElementById("bgmToggle");
      if (!btn) return;
  
      const st = loadState();
      // Icona simple (sense llibreries)
      btn.textContent = st.muted ? "🔇 Música" : "🔊 Música";
      btn.title = st.muted ? "Activar música" : "Silenciar música";
    }
  
    function applyState() {
      const audio = ensureAudio();
      const st = loadState();
  
      audio.muted = !!st.muted;
      audio.volume = typeof st.volume === "number" ? st.volume : 0.35;
  
      // Reprendre temps (pot variar una mica entre pàgines)
      if (typeof st.time === "number" && st.time > 0 && isFinite(st.time)) {
        // Evitem errors si encara no ha carregat metadata
        audio.addEventListener("loadedmetadata", () => {
          try {
            audio.currentTime = Math.min(st.time, Math.max(0, audio.duration - 0.25));
          } catch {}
        }, { once: true });
      }
    }
  
    function persistTime() {
      const audio = ensureAudio();
      const tick = () => {
        if (!audio.paused) saveState({ time: audio.currentTime });
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
  
      // també guarda abans de marxar de pàgina
      window.addEventListener("pagehide", () => {
        try { saveState({ time: audio.currentTime }); } catch {}
      });
    }
  
    // Aquesta funció la pots cridar quan hi hagi un gest d’usuari (clic “Accedir”)
    async function startBgmFromUserGesture() {
      const audio = ensureAudio();
      const st = loadState();
  
      applyState();
      ensureButton();
      renderButton();
      persistTime();
  
      // Si està mute, no forcem play (però el loop queda a punt)
      if (st.muted) return;
  
      try {
        await audio.play();
      } catch {
        // si el navegador ho bloqueja, no passa res; l’usuari pot activar amb el botó
      }
    }
  
    // Intent “suau” d’engegar al carregar (pot funcionar si el navegador ho permet després del login)
    async function tryAutoResume() {
      const audio = ensureAudio();
      const st = loadState();
  
      applyState();
      ensureButton();
      renderButton();
      persistTime();
  
      if (st.muted) return;
  
      try {
        await audio.play();
      } catch {
        // Bloquejat fins que l’usuari faci click a qualsevol lloc
        const once = async () => {
          document.removeEventListener("click", once);
          document.removeEventListener("keydown", once);
          try { await audio.play(); } catch {}
        };
        document.addEventListener("click", once, { once: true });
        document.addEventListener("keydown", once, { once: true });
      }
    }
  
    // Exposem funcions globals mínimes
    window.__bgmStart = startBgmFromUserGesture;
  
    // Arrenca el sistema a totes les pàgines
    document.addEventListener("DOMContentLoaded", () => {
      tryAutoResume();
    });
  })();
  