// ==================== CONFIG ====================
const XP_VALUES = {
  film: 30,
  livre: 50,
  podcast: 10,
  musique: 20,
  jeu: 40
};

document.querySelector('.dropdown-btn').addEventListener('click', function() {
  document.querySelector('.dropdown-multi').classList.toggle('show');
});

function renderFilteredList() {
  const selectedCategories = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  entriesList.innerHTML = '';

  entries
    .filter(e => selectedCategories.length === 0 || selectedCategories.includes(e.category))
    .forEach(e => {
      const li = document.createElement('li');
      li.textContent = `${e.type} - ${e.title} (${e.category})`;
      entriesList.appendChild(li);
    });
}



const BADGES = [
  { id: "cinephile", text: "Cinéphile : 10 films", condition: (stats) => stats.film >= 10 },
  { id: "lecteur", text: "Lecteur assidu : 5 livres", condition: (stats) => stats.livre >= 5 },
  { id: "explorateur", text: "Explorateur de podcasts : 20 podcasts", condition: (stats) => stats.podcast >= 20 },
  { id: "collectionneur", text: "Collectionneur : 1 dans chaque catégorie", 
    condition: (stats) => Object.values(stats).every(v => v > 0) }
];

const QUESTS = [
  {id:"film", text:"Regarder un film", type:"film"},
  {id:"livre", text:"Lire un livre", type:"livre"},
  {id:"podcast", text:"Écouter un podcast", type:"podcast"},
  {id:"musique", text:"Découvrir une musique", type:"musique"},
  {id:"jeu", text:"Jouer à un jeu de société", type:"jeu"}
];

const QUEST_BONUS = 50;

// ==================== VARIABLES ====================
let xp = parseInt(localStorage.getItem("xp") || "0");
let unlockedBadges = JSON.parse(localStorage.getItem("badges") || "[]");

// ==================== QUÊTE ====================
function getWeekNumber(d=new Date()) {
  const onejan = new Date(d.getFullYear(),0,1);
  return Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
}

let week = getWeekNumber();
let currentQuest = QUESTS[week % QUESTS.length];

// Définir questDone et reset si semaine changée
let questDone = localStorage.getItem("questDone") === "true";
let savedWeek = parseInt(localStorage.getItem("week") || "0");
if(savedWeek !== week){
  questDone = false;
  localStorage.setItem("questDone","false");
  localStorage.setItem("week", week);
}

// ==================== HELPERS ====================
function save() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("entries", JSON.stringify(entries));
  localStorage.setItem("badges", JSON.stringify(unlockedBadges));
}

// ==================== UI ====================
const form = document.getElementById("entryForm");
const list = document.getElementById("entries");
const xpSpan = document.getElementById("xp");
const levelSpan = document.getElementById("level");
const badgesList = document.getElementById("badges");

const questTextEl = document.getElementById("questText");
const questStatusEl = document.getElementById("questStatus");

async function renderList() {
  list.innerHTML = "";

  let token = localStorage.getItem("token");
  if(!token) return;

  const res = await fetch('/entries', {
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}
  })

  if(res.status !== 200) {
    alert("Erreur lors de la récupération des entrées. Veuillez vous reconnecter.");
    localStorage.removeItem("token");
    window.location.href = '/login';
    return;
  }

  entries = await res.json();

  entries.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.category} : ${e.title} (${e.date})`;
    list.appendChild(li);
  });
}

function updateXPUI() {
  xpSpan.textContent = xp;
  levelSpan.textContent = Math.floor(xp / 100) + 1;
}

function updateBadges() {
  const stats = {film:0, livre:0, podcast:0, musique:0, jeu:0};
  //entries.forEach(e => stats[e.type]++);

  BADGES.forEach(b => {
    if(b.condition(stats) && !unlockedBadges.includes(b.id)){
      unlockedBadges.push(b.id);
      alert("🏅 Nouveau badge débloqué : " + b.text);
    }
  });

  badgesList.innerHTML = "";
  unlockedBadges.forEach(id => {
    const b = BADGES.find(x => x.id === id);
    const li = document.createElement("li");
    li.textContent = b.text;
    badgesList.appendChild(li);
  });
}

function renderQuest() {
  questTextEl.textContent = "🎯 Objectif : " + currentQuest.text;
  if (questDone) {
    document.querySelector(".quest").classList.add("complete");
    questStatusEl.textContent = "✅ Quête réussie ! (+50 XP)";
  } else {
    questStatusEl.textContent = "⏳ En attente...";
  }
}

// ==================== AJOUT D'ENTRÉE ====================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const category = document.getElementById("category").value;
  const title = document.getElementById("title").value;
  const comment = document.getElementById("comment").value
  if(!title) return;

  const entry = {category, title, date:new Date().toLocaleDateString(), comment};

  let token = localStorage.getItem("token");
  if(!token) return;

  const res = await fetch('/entries', {
    method: 'POST',
    headers: {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'},
    body: JSON.stringify(entry)
  })

  if(res.status != 201) {
    alert("Erreur lors de l'ajout de l'entrée. Veuillez réessayer.");
    return;
  }

  const newEntry = await res.json();

  const li = document.createElement("li");
  li.textContent = `${newEntry.category} : ${newEntry.title} (${newEntry.date})`;
  list.appendChild(li);
})

const clearBtn = document.getElementById("clearAll");

clearBtn.addEventListener("click", () => {
  if (confirm("Voulez-vous vraiment réinitialiser toutes les données locales ?")) {
    localStorage.clear();
    xp = 0;
    entries = [];
    unlockedBadges = [];
    questDone = false;


  save();
  renderList();
  updateXPUI();
  updateBadges();
  renderQuest();

  form.reset();
}});

// ==================== INIT ====================
renderList();
updateXPUI();
updateBadges();
renderQuest();

