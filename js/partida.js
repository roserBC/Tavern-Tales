const STORAGE_KEY = "cardsData_v1";
const CHAR_KEY = "charactersData_v1";

/* ---------------------------
   Utils storage / params
---------------------------- */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadCards() { return loadJSON(STORAGE_KEY, []); }
function saveCards(cards) { saveJSON(STORAGE_KEY, cards); }

function loadChars() { return loadJSON(CHAR_KEY, []); }
function saveChars(chars) { saveJSON(CHAR_KEY, chars); }

function getGameId() {
  return new URLSearchParams(location.search).get("id");
}
function nowStr(ts) {
  return new Date(ts).toLocaleString();
}
function uid() {
  return (crypto?.randomUUID?.() || String(Date.now() + Math.random()));
}
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------------------
   Carrega partida
---------------------------- */
const currentUser = (localStorage.getItem("fakeUser") || "Usuari").trim();

let cards = loadCards();
const gameId = getGameId();
let game = cards.find(c => c.id === gameId);

if (!game) {
  alert("No s'ha trobat la partida.");
  location.href = "home.html";
}

// DEBUG
console.log("[partida.js] gameId:", gameId, "game:", game?.title);

// Normalitza estructura base
game.players = Array.isArray(game.players) ? game.players : [];
game.comments = Array.isArray(game.comments) ? game.comments : [];
game.gmName = (game.gmName || "").trim() || "GM";
const isGM = (game.gmName === currentUser);

function persistGame() {
  const idx = cards.findIndex(c => c.id === game.id);
  if (idx === -1) return;
  cards[idx] = game;
  saveCards(cards);
}

const FALLBACK_IMG = "assets/logoTavernTales_Blue.png";

/* ---------------------------
   Render partida (fila 1)
---------------------------- */
const gameTitleEl = document.getElementById("gameTitle");
const gameSystemEl = document.getElementById("gameSystem");
const gameGMEl = document.getElementById("gameGM");
const gameFullEl = document.getElementById("gameFull");
const gameImgEl = document.getElementById("gameImage");

if (gameTitleEl) gameTitleEl.textContent = game.title || "Partida";
if (gameSystemEl) gameSystemEl.textContent = game.tag ? `Sistema: ${game.tag}` : "Sistema: —";
if (gameGMEl) gameGMEl.textContent = `GM: ${game.gmName}`;

if (gameFullEl) {
  gameFullEl.textContent = game.full || game.short || "";
}

if (gameImgEl) {
  gameImgEl.src = game.image || FALLBACK_IMG;
  gameImgEl.onerror = () => { gameImgEl.src = FALLBACK_IMG; gameImgEl.onerror = null; };
}

// Footer year + logout
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("fakeUser");
    location.href = "index.html";
  });
}

/* ---------------------------
   Jugadors (fila 2)
---------------------------- */
const playersGrid = document.getElementById("playersGrid");
const addPlayerBtn = document.getElementById("addPlayerBtn");

function renderPlayers() {
  if (!playersGrid) return;

  playersGrid.innerHTML = "";

  if (game.players.length === 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "Encara no hi ha jugadors afegits.";
    playersGrid.appendChild(empty);
    return;
  }

  const chars = loadChars();

  game.players.forEach(p => {
    // ✅ Si el player té characterId, carreguem info del catàleg
    const ch = p.characterId ? chars.find(c => c.id === p.characterId) : null;

    const characterName = ch?.characterName || p.characterName || "Personatge";
    const avatar = (ch?.avatar || p.avatar || FALLBACK_IMG);
    const cid = ch?.id || p.characterId || ""; // important per la fitxa

    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <div class="player-top">
        <img class="player-avatar" src="${escapeHtml(avatar)}" alt="">
        <div>
          <p class="player-name">${escapeHtml(characterName)}</p>
          <p class="player-meta">Jugador: ${escapeHtml(p.playerName || "—")}</p>
        </div>
      </div>
      <span class="player-level">Nivell: ${escapeHtml(p.level ?? "—")}</span>
      <div class="player-actions">
        ${cid
          ? `<a class="btn btn-ghost" href="personatge.html?gid=${encodeURIComponent(game.id)}&cid=${encodeURIComponent(cid)}">Fitxa</a>`
          : `<span class="muted">Sense fitxa</span>`
        }
      </div>
    `;
    playersGrid.appendChild(card);
  });
}


renderPlayers();

/* ---------------------------
   ✅ Modal Afegir jugador/personatge (sense prompt)
---------------------------- */
const playerDialog = document.getElementById("playerDialog");
const playerForm = document.getElementById("playerForm");

const existingCharacter = document.getElementById("existingCharacter");
const playerNameInput = document.getElementById("playerNameInput");
const characterNameInput = document.getElementById("characterNameInput");
const levelInput = document.getElementById("levelInput");
const avatarInput = document.getElementById("avatarInput");

function populateExistingCharacters() {
  if (!existingCharacter) return;

  const chars = loadChars();
  // reset
  existingCharacter.innerHTML = `<option value="">— Crear nou personatge —</option>`;

  chars.forEach(ch => {
    const opt = document.createElement("option");
    opt.value = ch.id;
    opt.textContent = ch.characterName || `Personatge (${ch.id.slice(0, 6)})`;
    existingCharacter.appendChild(opt);
  });
}

function fillFromCharacter(charId) {
  const chars = loadChars();
  const ch = chars.find(x => x.id === charId);
  if (!ch) return;

  characterNameInput.value = ch.characterName || "";
  avatarInput.value = ch.avatar || "";
  // nivell i jugador els pot decidir el GM a la partida
}

if (existingCharacter) {
  existingCharacter.addEventListener("change", () => {
    const id = existingCharacter.value;
    if (!id) {
      characterNameInput.value = "";
      avatarInput.value = "";
      return;
    }
    fillFromCharacter(id);
  });
}

if (addPlayerBtn) {
  addPlayerBtn.style.display = isGM ? "inline-flex" : "none";

  addPlayerBtn.addEventListener("click", () => {
    if (!playerDialog) return;

    populateExistingCharacters();

    // defaults
    if (playerNameInput) playerNameInput.value = "";
    if (characterNameInput) characterNameInput.value = "";
    if (levelInput) levelInput.value = "1";
    if (avatarInput) avatarInput.value = "";

    playerDialog.showModal();
  });
}

if (playerForm) {
  playerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const playerName = (playerNameInput?.value || "").trim();
    const characterName = (characterNameInput?.value || "").trim();
    const level = Number(levelInput?.value || 1);
    const avatar = (avatarInput?.value || "").trim() || FALLBACK_IMG;

    if (!playerName || !characterName) {
      alert("Falten dades: 'Nom del jugador' i 'Nom del personatge' són obligatoris.");
      return;
    }

    // Si s'ha triat un personatge existent, assegurem que existeixi i el guardem a la “llista global”
    const selectedCharId = (existingCharacter?.value || "").trim();
    if (selectedCharId) {
      const chars = loadChars();
      const ch = chars.find(x => x.id === selectedCharId);
      if (!ch) {
        alert("No s'ha trobat el personatge existent. Torna-ho a provar.");
        return;
      }
      // opcional: podries sincronitzar avatar/nom
    } else {
      // Si NO s'ha triat existent => creem personatge “global”
      const chars = loadChars();
      chars.push({
        id: uid(),
        characterName,
        avatar,
        lore: "",
        sheet: "",
        voice: ""
      });
      saveChars(chars);
    }

    // Afegim a la partida (player slot)
    game.players.push({
      id: uid(),
      playerName,
      characterName,
      level: Number.isFinite(level) ? level : 1,
      avatar,
      backstory: "",
      sheet: ""
    });

    persistGame();
    renderPlayers();

    // tancar dialog
    if (playerDialog?.open) playerDialog.close();
  });
}

/* ---------------------------
   Música per partida
---------------------------- */
const audio = document.getElementById("gameAudio");
const folderSelect = document.getElementById("folderSelect");
const tracksList = document.getElementById("tracksList");
const nowPlaying = document.getElementById("nowPlaying");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const muteBtn = document.getElementById("muteBtn");
const vol = document.getElementById("vol");
const gmMusic = document.getElementById("gmMusic");

// Si falta qualsevol peça del player, no intentem inicialitzar música
const musicUIReady = !!(audio && folderSelect && tracksList && nowPlaying && playBtn && pauseBtn && muteBtn && vol);

if (gmMusic) gmMusic.hidden = !isGM;

if (musicUIReady) {
  if (!game.music) {
    game.music = {
      folders: [
        { id: "opening", name: "Opening", tracks: [] },
        { id: "ambient", name: "Ambient", tracks: [] }
      ],
      current: { folderId: "opening", trackId: null },
      muted: false,
      volume: 0.35
    };
    persistGame();
  }

  audio.loop = true;
  audio.muted = !!game.music.muted;
  audio.volume = typeof game.music.volume === "number" ? game.music.volume : 0.35;
  vol.value = audio.volume;

  function getFolder(folderId) {
    return game.music.folders.find(f => f.id === folderId) || game.music.folders[0];
  }
  function getTrack(folderId, trackId) {
    const f = getFolder(folderId);
    return f?.tracks?.find(t => t.id === trackId);
  }

  function selectTrack(folderId, trackId) {
    const t = getTrack(folderId, trackId);
    if (!t) return;

    game.music.current = { folderId, trackId };
    persistGame();

    audio.src = t.url;
    nowPlaying.textContent = `Ara sona: ${t.title}`;
  }

  function renderFolders() {
    folderSelect.innerHTML = "";
    game.music.folders.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.name;
      folderSelect.appendChild(opt);
    });
    folderSelect.value = game.music.current.folderId || game.music.folders[0]?.id;
  }

  function renderTracks() {
    const folderId = folderSelect.value;
    const f = getFolder(folderId);
    tracksList.innerHTML = "";

    if (!f.tracks.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "No hi ha cançons en aquesta carpeta.";
      tracksList.appendChild(empty);
      return;
    }

    f.tracks.forEach(t => {
      const row = document.createElement("div");
      row.className = "track-item";
      row.innerHTML = `
        <div>
          <div class="title">${escapeHtml(t.title)}</div>
          <div class="url">${escapeHtml(t.url)}</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <button class="btn btn-ghost" type="button" data-play="${escapeHtml(t.id)}">Reproduir</button>
          ${isGM ? `<button class="btn btn-ghost" type="button" data-del="${escapeHtml(t.id)}">Eliminar</button>` : ""}
        </div>
      `;
      tracksList.appendChild(row);
    });

    tracksList.querySelectorAll("button[data-play]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const folderId = folderSelect.value;
        const trackId = btn.getAttribute("data-play");
        selectTrack(folderId, trackId);
        try { await audio.play(); } catch {}
      });
    });

    if (isGM) {
      tracksList.querySelectorAll("button[data-del]").forEach(btn => {
        btn.addEventListener("click", () => {
          const folderId = folderSelect.value;
          const trackId = btn.getAttribute("data-del");
          const f = getFolder(folderId);

          f.tracks = f.tracks.filter(x => x.id !== trackId);

          if (game.music.current.trackId === trackId) {
            game.music.current.trackId = null;
            audio.pause();
            audio.removeAttribute("src");
            nowPlaying.textContent = "Ara sona: —";
          }

          persistGame();
          renderTracks();
        });
      });
    }
  }

  folderSelect.addEventListener("change", () => {
    const folderId = folderSelect.value;
    game.music.current.folderId = folderId;
    game.music.current.trackId = null;
    persistGame();
    renderTracks();
    nowPlaying.textContent = "Ara sona: —";
  });

  playBtn.addEventListener("click", async () => {
    try { await audio.play(); } catch {}
  });
  pauseBtn.addEventListener("click", () => audio.pause());

  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    game.music.muted = audio.muted;
    muteBtn.textContent = audio.muted ? "Unmute" : "Mute";
    persistGame();
  });

  vol.addEventListener("input", () => {
    audio.volume = Number(vol.value);
    game.music.volume = audio.volume;
    persistGame();
  });

  if (isGM) {
    const addFolderBtn = document.getElementById("addFolderBtn");
    const addTrackBtn = document.getElementById("addTrackBtn");

    if (addFolderBtn) {
      addFolderBtn.addEventListener("click", () => {
        const name = (document.getElementById("newFolder").value || "").trim();
        if (!name) return;

        const id = uid();
        game.music.folders.push({ id, name, tracks: [] });
        document.getElementById("newFolder").value = "";

        persistGame();
        renderFolders();
        renderTracks();
      });
    }

    if (addTrackBtn) {
      addTrackBtn.addEventListener("click", () => {
        const title = (document.getElementById("trackTitle").value || "").trim();
        const url = (document.getElementById("trackUrl").value || "").trim();
        if (!title || !url) return;

        const folderId = folderSelect.value;
        const f = getFolder(folderId);

        const trackId = uid();
        f.tracks.push({ id: trackId, title, url });

        if (!game.music.current.trackId) {
          game.music.current = { folderId, trackId };
          audio.src = url;
          nowPlaying.textContent = `Ara sona: ${title}`;
        }

        document.getElementById("trackTitle").value = "";
        document.getElementById("trackUrl").value = "";

        persistGame();
        renderTracks();
      });
    }
  }

  renderFolders();
  renderTracks();
  muteBtn.textContent = audio.muted ? "Unmute" : "Mute";

  const curFolder = game.music.current.folderId || folderSelect.value;
  const curTrack = game.music.current.trackId;
  if (curTrack) selectTrack(curFolder, curTrack);

  setTimeout(() => {
    audio.play().catch(() => {
      nowPlaying.textContent += " (clica Play per començar)";
    });
  }, 200);
} else {
  console.warn("[partida.js] Secció música: falten elements al HTML, no inicialitzo player.");
}

/* ---------------------------
   IA simulada (diferents respostes segons checkbox)
---------------------------- */
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function summarizeText(text, maxLen = 220) {
  const t = String(text || "").trim().replace(/\s+/g, " ");
  if (!t) return "";
  return t.length > maxLen ? t.slice(0, maxLen) + "…" : t;
}

const AI_BANK = {
  "one-shot": [
    (ctx) => `One-shot:\n- Entrada: ${pick(["taverna amb rumor", "encàrrec urgent", "robatori misteriós"])}\n- Nus: ${pick(["emboscada", "traïció", "pista oculta"])}\n- Final: ${pick(["cliffhanger", "combat final", "pacte moral"])}\n\nContext: "${ctx}"`,
    (ctx) => `One-shot (ràpid):\n1) Ganxo: una carta segellada.\n2) Giro: el PNJ clau menteix.\n3) Clímax: decisió impossible.\n\nContext: "${ctx}"`
  ],
  "idees": [
    (ctx) => `Idees:\n- Ganxo: ${pick(["un objecte maleït", "un pacte antic", "un missatge encriptat"])}\n- Complicació: ${pick(["rellotge de 24h", "rival apareix", "aliat sospitós"])}\n- Escena: taverna → pista → persecució → revelació.\n\nContext: "${ctx}"`,
    (ctx) => `3 idees curtes:\n1) Facció rival vol el mateix.\n2) Lloc prohibit sota la ciutat.\n3) Deute del GM amb un PNJ.\n\nContext: "${ctx}"`
  ],
  "revisio": [
    (ctx) => `Revisió:\n- Clarifica objectiu i risc de l’escena.\n- Afegeix 2 pistes (una falsa).\n- Dona una motivació humana al vilà.\n\nText base: "${ctx}"`,
    (ctx) => `Revisió (estructura):\n- Inici: situació → problema.\n- Mig: 2 obstacles amb elecció.\n- Final: conseqüència permanent.\n\nText base: "${ctx}"`
  ],
  "suggerencies": [
    (ctx) => `Suggerències:\n- Canvia escenari: ${pick(["ruïnes", "bosc encantat", "port pirata", "cova gelada"])}\n- PNJ recurrent: ${pick(["devot", "cínic", "paranoic", "massa amable"])}\n- Twist: ${pick(["el mapa és fals", "el premi està maleït", "el villà és proper"])}\n\nContext: "${ctx}"`,
    (ctx) => `Suggerències (tensió):\n- Introduir una amenaça que creix cada 10 minuts.\n- Fer que el grup hagi de triar a qui salvar.\n- Fer que el “dolent” tingui raó a mitges.\n\nContext: "${ctx}"`
  ]
};

function fakeAI(contextRaw, modes) {
  const context = String(contextRaw || "").trim();
  if (!context) return "Escriu una mica de context (escena, món, PNJ, objectiu…) i et dono idees 🙂";

  const snippet = summarizeText(context);

  const chosenModes = (modes && modes.length) ? modes : ["idees"];
  // ajunta respostes de tots els modes marcats (una per mode, aleatòria)
  const parts = chosenModes.map(m => {
    const bank = AI_BANK[m] || [];
    if (!bank.length) return null;
    return pick(bank)(snippet);
  }).filter(Boolean);

  return parts.join("\n\n---\n\n");
}

const aiBtn = document.getElementById("aiBtn");
const aiContext = document.getElementById("aiContext");
const aiAnswer = document.getElementById("aiAnswer");

if (aiBtn && aiContext && aiAnswer) {
  aiBtn.addEventListener("click", () => {
    const modes = Array.from(document.querySelectorAll('.ai-options input[type="checkbox"]:checked'))
      .map(x => x.value);

    aiAnswer.textContent = fakeAI(aiContext.value, modes);
  });
} else {
  console.warn("[partida.js] IA: falta algun element al HTML:", { aiBtn, aiContext, aiAnswer });
}

console.log("[partida.js] Arribant al bloc de comentaris...");

/* ---------------------------
   Comentaris
---------------------------- */
const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const commentText = document.getElementById("commentText");

function renderComments() {
  if (!commentsList) return;

  commentsList.innerHTML = "";

  if (!Array.isArray(game.comments) || game.comments.length === 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "Encara no hi ha comentaris.";
    commentsList.appendChild(empty);
    return;
  }

  const parents = game.comments.filter(c => !c.parentId);
  const children = game.comments.filter(c => c.parentId);

  parents.sort((a, b) => a.ts - b.ts).forEach(parent => {
    const wrap = document.createElement("div");
    wrap.className = "comment";
    wrap.innerHTML = `
      <div class="comment-head">
        <span>${escapeHtml(parent.author)}${parent.author === game.gmName ? " (GM)" : ""}</span>
        <span>${nowStr(parent.ts)}</span>
      </div>
      <div class="comment-body">${escapeHtml(parent.text)}</div>
      <div class="comment-actions">
        <button class="btn btn-ghost" type="button" data-reply="${escapeHtml(parent.id)}">Respondre</button>
      </div>
      <div class="reply-box" id="replies-${escapeHtml(parent.id)}"></div>
    `;
    commentsList.appendChild(wrap);

    const replyBox = wrap.querySelector(`#replies-${CSS.escape(parent.id)}`);
    children
      .filter(r => r.parentId === parent.id)
      .sort((a, b) => a.ts - b.ts)
      .forEach(r => {
        const el = document.createElement("div");
        el.className = "reply";
        el.innerHTML = `
          <div class="comment-head">
            <span>${escapeHtml(r.author)}${r.author === game.gmName ? " (GM)" : ""}</span>
            <span>${nowStr(r.ts)}</span>
          </div>
          <div class="comment-body">${escapeHtml(r.text)}</div>
        `;
        replyBox?.appendChild(el);
      });
  });

  commentsList.querySelectorAll("button[data-reply]").forEach(btn => {
    btn.addEventListener("click", () => {
      const parentId = btn.getAttribute("data-reply");
      const txt = prompt("Resposta:");
      if (!txt) return;

      game.comments.push({
        id: uid(),
        parentId,
        author: currentUser,
        text: txt.trim(),
        ts: Date.now()
      });

      persistGame();
      renderComments();
    });
  });
}

if (commentForm && commentText && commentsList) {
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const txt = commentText.value.trim();
    if (!txt) return;

    game.comments.push({
      id: uid(),
      parentId: null,
      author: currentUser,
      text: txt,
      ts: Date.now()
    });

    commentText.value = "";
    persistGame();
    renderComments();
  });

  renderComments();
} else {
  console.error("[partida.js] Comentaris: falten elements al HTML:", {
    commentForm, commentText, commentsList
  });
}
