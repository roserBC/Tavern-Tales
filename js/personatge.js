// js/personatges.js
const STORAGE_KEY = "cardsData_v1";
const CHAR_KEY = "charactersData_v1"; // ✅ IMPORTANT: mateixa clau que home.js i partida.js

function loadCards() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveCards(cards) { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); }

function loadChars() {
  try { return JSON.parse(localStorage.getItem(CHAR_KEY)) || []; }
  catch { return []; }
}
function saveChars(chars) { localStorage.setItem(CHAR_KEY, JSON.stringify(chars)); }

function getParam(k) { return new URLSearchParams(location.search).get(k); }
function uid() { return (crypto?.randomUUID?.() || String(Date.now() + Math.random())); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const FALLBACK_IMG = "assets/logoTavernTales_Blue.png";

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("fakeUser");
    location.href = "index.html";
  });
}

const gid = getParam("gid");
const pid = getParam("pid"); // antic (player slot)
let cid = getParam("cid");   // nou (character id)

// Si venen gid+pid, deduïm cid des de la partida
if (!cid && gid && pid) {
  const cards = loadCards();
  const game = cards.find(g => g.id === gid);
  const p = game?.players?.find(x => x.id === pid);

  if (p?.characterId) {
    cid = p.characterId;
  } else if (p?.id) {
    // fallback antic: si algú va passar pid com si fos cid
    cid = p.id;
  }
}

// Carrega personatge del catàleg global
let chars = loadChars();
let character = chars.find(c => c.id === cid);

if (!character) {
  alert("No s'ha trobat el personatge.");
  location.href = "home.html";
}

// Elements UI
const titleEl = document.getElementById("charTitle");
const imgEl = document.getElementById("charImg");
const imgUrlEl = document.getElementById("charImgUrl");
const loreEl = document.getElementById("charLore");
const sheetEl = document.getElementById("charSheet");
const saveBtn = document.getElementById("saveCharBtn");

// IA simulada - imatge
const genImgBtn = document.getElementById("genImgBtn");
const imgPrompt = document.getElementById("imgPrompt");
const genImgOut = document.getElementById("genImgOut");

// IA simulada - veu
const genVoiceBtn = document.getElementById("genVoiceBtn");
const voicePreset = document.getElementById("voicePreset");
const voiceText = document.getElementById("voiceText");
const genVoiceOut = document.getElementById("genVoiceOut");

// Pool d'imatges fake
const FAKE_IMG_POOL = [
  "assets/logoTavernTales_Blue.png",
  "assets/home_img.jpg",
  "assets/anima.png"
];

function render() {
  if (titleEl) titleEl.textContent = character.characterName || "Personatge";

  const src = (character.avatar || "").trim();
  if (imgEl) {
    imgEl.src = src || FALLBACK_IMG;
    imgEl.onerror = () => { imgEl.src = FALLBACK_IMG; imgEl.onerror = null; };
  }

  if (imgUrlEl) imgUrlEl.value = character.avatar || "";
  if (loreEl) loreEl.value = character.lore || "";
  if (sheetEl) sheetEl.value = character.sheet || "";
}

function persist() {
  chars = loadChars();
  const idx = chars.findIndex(c => c.id === character.id);
  if (idx === -1) return;
  chars[idx] = character;
  saveChars(chars);
}

saveBtn?.addEventListener("click", () => {
  character.avatar = (imgUrlEl?.value || "").trim();
  character.lore = (loreEl?.value || "");
  character.sheet = (sheetEl?.value || "");
  persist();
  render();
  alert("Personatge desat.");
});

genImgBtn?.addEventListener("click", () => {
  const prompt = (imgPrompt?.value || "").trim();
  const tags = Array.from(document.querySelectorAll('.ai-options input[type="checkbox"]:checked'))
    .map(x => x.value);

  character.aiImage = {
    lastPrompt: prompt,
    tags,
    generatedUrl: pick(FAKE_IMG_POOL)
  };

  character.avatar = character.aiImage.generatedUrl;

  persist();
  render();

  if (genImgOut) {
    genImgOut.textContent =
      `Generat (fake) amb tags: ${tags.join(", ") || "cap"} i prompt: "${prompt}"`;
  }
});

genVoiceBtn?.addEventListener("click", () => {
  const preset = voicePreset?.value || "Neutra";
  const txt = (voiceText?.value || "").trim();

  character.voice = { preset, sampleText: txt, enabled: true };
  persist();

  if (genVoiceOut) {
    genVoiceOut.textContent =
      `Veu (fake) generada amb preset "${preset}". (No es crea àudio real; és simulació)`;
  }
});

render();
