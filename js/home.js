// js/home.js
// Home: llista de partides (targetes) + crear partida + afegir jugadors (escollint personatges existents)

const STORAGE_KEY = "cardsData_v1";
const CHAR_KEY = "charactersData_v1";

// Targetes de mostra (amb imatge + permís per "Afegir jugador")
const demoCards = [
  {
    id: crypto.randomUUID(),
    title: "Et Versiculum Mortem",
    tag: "Anima Beyond Fantasy",
    short:
      "L'inici d'una guerra entre els dos clans que lideren una organització inicia un pla d'espionatge necessari per sobreviure.",
    full: `L’esclat d’un conflicte intern entre els dos clans que lideren l’organització coneguda com El Sol Negro marca l’inici d’una guerra silenciosa però implacable. Allò que fins fa poc es resolia amb pactes i influències passa a convertir-se en una lluita pel control, on la informació i la lleialtat són tan valuoses com les armes.

Davant d’aquesta situació, s’activa un pla d’espionatge imprescindible per garantir la supervivència de l’organització i dels qui hi estan atrapats. Els personatges es veuen immersos en una xarxa de secrets, traïcions i aliances fràgils, on cada decisió pot inclinar la balança del poder.

A mesura que la tensió augmenta, surt a la llum el veritable motiu del conflicte: una de les famílies líders pretén utilitzar un llibre necròfic com a font de poder prohibit, disposada a pagar qualsevol preu per imposar la seva voluntat. L’altra fracció s’hi oposa frontalment, conscient de les conseqüències devastadores que aquest coneixement podria desencadenar.

La trama gira al voltant de l’espionatge, la manipulació i els enfrontaments directes, en un món on la màgia fosca, les arts prohibides i els interessos polítics s’entrellacen. Jugada amb el sistema d’Anima Beyond Fantasy, la partida posa èmfasi en el drama, el conflicte moral i la lluita pel poder en un entorn on no hi ha opcions innocents i on la supervivència sovint exigeix creuar línies que potser no haurien d’haver estat traspassades.

Horari de les partides:  Diumenges de 18:00 a 22:00
Plataforma: Foundry (online)`,
    image: "assets/anima.png",

    // GM canviable (en lloc de canAddPlayer com a “GM”)
    gmName: "Luisin",

    // dret a afegir jugador
    canAddPlayer: true,

    // dades internes de la partida (pregenerats)
    players: [
      {
        id: "p1",
        playerName: "Roser",
        characterName: "Rayker Acrox",
        level: 8,
        avatar: "assets/players/Et Versiculum Mortem/Rayker.jpg",
        backstory: `Proviene de una familia burguesa lo que le ha permitido poder estudiar e ir a la universidad sin 
mucha preocupación...`,
        sheet: ""
      },
      {
        id: "p2",
        playerName: "Lucas",
        characterName: "Tania Sokolovski",
        level: 8,
        avatar: "assets/players/Et Versiculum Mortem/Tania.png",
        backstory: "LORE",
        sheet: ""
      },
      {
        id: "p3",
        playerName: "Manu",
        characterName: "Gerhard Bencman",
        level: 7,
        avatar: "",
        backstory: "LORE",
        sheet: ""
      },
      {
        id: "p4",
        playerName: "Lorea",
        characterName: "Aelin Ó Coileáin",
        level: 8,
        avatar: "assets/players/Et Versiculum Mortem/Aelin.jpg",
        backstory: "LORE",
        sheet: ""
      }
    ],
    comments: [],

    // Música per partida
    music: {
      folders: [
        {
          id: "opening",
          name: "Opening",
          tracks: [
            {
              id: "op1",
              title: "Opening – Et Versiculum Mortem",
              url: "assets/music/Et Versiculum Mortem/opening.mp3"
            }
          ]
        },
        { id: "ambient", name: "Ambient", tracks: [] }
      ],
      current: { folderId: "opening", trackId: "op1" },
      muted: false,
      volume: 0.35
    }
  },
  {
    id: crypto.randomUUID(),
    title: "Más allá del abismo",
    tag: "Dungeons & Dragons",
    short:
      "Un petit grup d'aventurers s'enfrenten a una secta que està generant problemes a l'abadia del Sol.",
    full: `Un petit grup d’aventurers és cridat a investigar una sèrie de successos estranys...`,
    image: "assets/dungeons.jpg",
    gmName: "Luisin",
    canAddPlayer: true,
    players: [],
    comments: [],
    music: {
      folders: [
        {
          id: "opening",
          name: "Opening",
          tracks: [
            {
              id: "op1",
              title: "Opening – El camí a l'abadia",
              url: "assets/music/Mas alla del abismo/La Balada de las Sombras Unidas.mp3"
            }
          ]
        },
        { id: "ambient", name: "Ambient", tracks: [] }
      ],
      current: { folderId: "opening", trackId: "op1" },
      muted: false,
      volume: 0.35
    }
  },
  {
    id: crypto.randomUUID(),
    title: "Máscaras de Nyarlahotep",
    tag: "La llamada de Cuthulhu",
    short:
      "Un grup d'investigadors han de sobreviure als perills de l'Expedició Carlyle i enfrentarse als plans de Nyarlahotep.",
    full: `Un grup d’investigadors es veu implicat en les conseqüències de l’Expedició Carlyle...`,
    image: "assets/la_llamada.jpg",
    gmName: "Roser",
    canAddPlayer: false,
    players: [],
    comments: [],
    music: {
      folders: [
        { id: "opening", name: "Opening", tracks: [] },
        { id: "ambient", name: "Ambient", tracks: [] }
      ],
      current: { folderId: "ambient", trackId: null },
      muted: false,
      volume: 0.35
    }
  }
];

// ---------- Storage ----------
function loadCards() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function loadChars() {
  try {
    return JSON.parse(localStorage.getItem(CHAR_KEY)) || [];
  } catch {
    return [];
  }
}
function saveChars(chars) {
  localStorage.setItem(CHAR_KEY, JSON.stringify(chars));
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ensureGameStructure(game) {
  game.players = Array.isArray(game.players) ? game.players : [];
  game.comments = Array.isArray(game.comments) ? game.comments : [];
  game.gmName = (game.gmName || "").trim() || "GM";
  game.canAddPlayer = typeof game.canAddPlayer === "boolean" ? game.canAddPlayer : false;
  game.image = (game.image || "").trim();

  // Migra players antics perquè siguin compatibles + enllaçables amb catàleg
  const chars = loadChars();
  game.players = game.players.map((p) => {
    const characterName = (p.characterName || "").trim();
    const existingChar =
      p.characterId ? chars.find((c) => c.id === p.characterId) : chars.find((c) => (c.characterName || "").trim() === characterName);

    // Si trobem personatge al catàleg, omplim camps que faltin
    if (existingChar) {
      return {
        id: p.id || crypto.randomUUID(),
        characterId: existingChar.id,
        playerName: (p.playerName || "").trim(),
        characterName: characterName || existingChar.characterName,
        level: Number.isFinite(p.level) ? p.level : 1,
        avatar: (p.avatar || existingChar.avatar || "").trim(),
        backstory: (p.backstory || existingChar.backstory || "").trim(),
        sheet: (p.sheet || existingChar.sheet || "").trim()
      };
    }

    // Si no existeix al catàleg però el player té characterName, el deixem com està
    return {
      id: p.id || crypto.randomUUID(),
      characterId: p.characterId || "",
      playerName: (p.playerName || "").trim(),
      characterName: characterName || "Personatge",
      level: Number.isFinite(p.level) ? p.level : 1,
      avatar: (p.avatar || "").trim(),
      backstory: (p.backstory || "").trim(),
      sheet: (p.sheet || "").trim()
    };
  });

  return game;
}

// ---------- Seed: catàleg de personatges amb pregenerats ----------
function seedCharactersFromDemoIfEmpty() {
  const existing = loadChars();
  if (existing.length) return;

  const mapByName = new Map();

  // Agafa tots els players pregenerats de totes les demoCards
  demoCards.forEach((g) => {
    (g.players || []).forEach((p) => {
      const name = (p.characterName || "").trim();
      if (!name) return;
      if (mapByName.has(name)) return;

      mapByName.set(name, {
        id: crypto.randomUUID(),
        characterName: name,
        avatar: (p.avatar || "").trim(),
        backstory: (p.backstory || "").trim(),
        sheet: (p.sheet || "").trim(),
        aiImage: { lastPrompt: "", generatedUrl: "" },
        voice: { preset: "Neutra", sampleText: "", enabled: false }
      });
    });
  });

  saveChars([...mapByName.values()]);
}

// ---------- Init data ----------
(function initIfEmpty() {
  seedCharactersFromDemoIfEmpty();

  const existing = loadCards();
  if (!existing.length) {
    // Quan guardem demoCards, els normalitzem i també intentem assignar characterId als pregenerats
    const chars = loadChars();
    const seeded = demoCards.map((g) => {
      const gg = ensureGameStructure(structuredClone(g));
      gg.players = gg.players.map((p) => {
        const c = chars.find((x) => (x.characterName || "").trim() === (p.characterName || "").trim());
        return c ? { ...p, characterId: c.id } : p;
      });
      return gg;
    });
    saveCards(seeded);
  } else {
    // normalitza per si hi ha partides antigues
    saveCards(existing.map(ensureGameStructure));
  }
})();

// ---------- Personatges (catàleg global) ----------
function createCharacterFlow() {
  const characterName = prompt("Nom del personatge?");
  if (!characterName) return null;

  const avatar = prompt("Ruta/URL imatge (opcional). Ex: assets/chars/x.png", "") || "";
  const backstory = prompt("LORE / història (opcional):", "") || "";
  const sheet = prompt("Fitxa (opcional):", "") || "";

  const chars = loadChars();

  // evita duplicats per nom (simple)
  const exists = chars.some((c) => (c.characterName || "").trim().toLowerCase() === characterName.trim().toLowerCase());
  if (exists) {
    alert("Ja existeix un personatge amb aquest nom al catàleg.");
    return null;
  }

  const c = {
    id: crypto.randomUUID(),
    characterName: characterName.trim(),
    avatar: avatar.trim(),
    backstory: backstory.trim(),
    sheet: sheet.trim(),
    aiImage: { lastPrompt: "", generatedUrl: "" },
    voice: { preset: "Neutra", sampleText: "", enabled: false }
  };

  chars.push(c);
  saveChars(chars);
  return c;
}

function pickCharacterFlow() {
  const chars = loadChars();

  if (chars.length === 0) {
    const ok = confirm("No hi ha personatges creats. Vols crear-ne un ara?");
    return ok ? createCharacterFlow() : null;
  }

  const options = chars.map((c, i) => `${i + 1}) ${c.characterName}`).join("\n");
  const input = prompt(
    `Selecciona un personatge existent:\n\n${options}\n\nEscriu número, o 'N' per crear-ne un de nou:`
  );

  if (!input) return null;
  if (input.toLowerCase() === "n") return createCharacterFlow();

  const idx = Number(input) - 1;
  if (!Number.isFinite(idx) || idx < 0 || idx >= chars.length) {
    alert("Selecció no vàlida.");
    return null;
  }
  return chars[idx];
}

// ---------- Accions ----------
function openGame(card) {
  window.location.href = `partida.html?id=${encodeURIComponent(card.id)}`;
}

function addPlayer(card) {
  const cards = loadCards();
  const game = cards.find((c) => c.id === card.id);
  if (!game) return alert("No s'ha trobat la partida.");

  ensureGameStructure(game);

  const character = pickCharacterFlow();
  if (!character) return;

  const defaultUser = (localStorage.getItem("fakeUser") || "Usuari").trim();
  const playerName = prompt("Nom del jugador (persona real)?", defaultUser);
  if (!playerName) return;

  const levelStr = prompt("Nivell?", "1");
  const level = Number(levelStr || 1);

  // Evita duplicats: mateix characterId dins la mateixa partida
  const already = game.players.some((p) => (p.characterId || "") === character.id);
  if (already) {
    alert("Aquest personatge ja està assignat a aquesta partida.");
    return;
  }

  // IMPORTANT: guardem el format que espera partida.js (characterName/avatar/backstory/sheet)
  game.players.push({
    id: crypto.randomUUID(),
    characterId: character.id,
    playerName: playerName.trim(),
    characterName: character.characterName,
    level: Number.isFinite(level) ? level : 1,
    avatar: character.avatar || "",
    backstory: character.backstory || "",
    sheet: character.sheet || ""
  });

  const idx = cards.findIndex((c) => c.id === game.id);
  cards[idx] = game;
  saveCards(cards);

  // Refresca la UI perquè es vegi immediat si tornes a entrar
  alert(`Afegit ${character.characterName} a ${game.title}`);
}

// ---------- Render ----------
const grid = document.getElementById("cardsGrid");

function renderCards() {
  if (!grid) return;

  const cards = loadCards();
  grid.innerHTML = "";

  cards.forEach((card) => {
    const el = document.createElement("article");
    el.className = "card";
    el.tabIndex = 0;
    el.setAttribute("role", "button");

    el.innerHTML = `
      <div class="card-media">
        <img src="${escapeHtml(card.image || "assets/home_img.jpg")}" alt="">
      </div>

      ${card.tag ? `<span class="tag">${escapeHtml(card.tag)}</span>` : ""}
      <h3 class="card-title">${escapeHtml(card.title || "Partida")}</h3>
      <p class="card-short">${escapeHtml(card.short || "")}</p>

      <div class="card-actions">
        <button
          class="btn-small primary"
          type="button"
          data-action="add-player"
          ${card.canAddPlayer ? "" : "disabled"}
        >
          Afegir jugador
        </button>
      </div>
    `;

    el.addEventListener("click", (e) => {
      const btn = e.target.closest('button[data-action="add-player"]');
      if (btn) {
        if (btn.disabled) return;
        addPlayer(card);
        return;
      }
      openGame(card);
    });

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openGame(card);
      }
    });

    grid.appendChild(el);
  });
}

// ---------- Modal: Nova partida ----------
const addDialog = document.getElementById("addDialog");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const addForm = document.getElementById("addForm");

// Menú "Nova partida" -> mateix que "+ Nova partida"
const navNewGame = document.getElementById("navNewGame");
if (navNewGame && addDialog) {
  navNewGame.addEventListener("click", (e) => {
    e.preventDefault();
    addDialog.showModal();
  });
}

if (addBtn && addDialog) {
  addBtn.addEventListener("click", () => addDialog.showModal());
}

if (cancelBtn && addDialog) {
  cancelBtn.addEventListener("click", () => addDialog.close());
}

if (addForm) {
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newCard = {
      id: crypto.randomUUID(),
      title: document.getElementById("tTitle").value.trim(),
      tag: document.getElementById("tTag").value.trim(),
      short: document.getElementById("tShort").value.trim(),
      full: document.getElementById("tFull").value.trim(),
      image: (document.getElementById("tImage")?.value || "").trim() || "assets/home_img.jpg",
      canAddPlayer: !!document.getElementById("tCanAddPlayer")?.checked,
      players: [],
      comments: [],
      gmName: (localStorage.getItem("fakeUser") || "GM").trim() || "GM"
    };

    const cards = loadCards();
    cards.push(ensureGameStructure(newCard));
    saveCards(cards);

    addForm.reset();
    addDialog.close();
    renderCards();
  });
}

// Obrir modal via querystring ?newGame=1 (per altres pestanyes que redirigeixin a home)
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const shouldOpen = params.get("newGame") === "1";

  if (shouldOpen && addDialog && !addDialog.open) {
    addDialog.showModal();
    history.replaceState({}, "", "home.html");
  }
});

// ---------- Reset ----------
const resetBtn = document.getElementById("resetBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    // Reset cards + torna a crear catàleg pregenerat si cal
    saveCards(demoCards.map((g) => ensureGameStructure(structuredClone(g))));
    localStorage.removeItem(CHAR_KEY);
    seedCharactersFromDemoIfEmpty();
    renderCards();
  });
}

// ---------- Logout ----------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("fakeUser");
    window.location.href = "index.html";
  });
}

// ---------- Footer year ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Init ----------
renderCards();
