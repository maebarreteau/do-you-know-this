// ==================== CONFIG ====================
// TODO
// Implement this on server side


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

// ==================== VARIABLES ====================
let unlockedBadges = JSON.parse(localStorage.getItem("badges") || "[]");

// ==================== HELPERS ====================
function save() {
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

const xpBar = document.getElementById("xpbar");

function updateXPUI(newXP) {
  xpSpan.textContent = newXP;
  const level = Math.floor(newXP / 100) + 1;
  levelSpan.textContent = level;

  // calculer XP actuel dans le niveau
  const xpInLevel = newXP % 100; 
  const percent = (xpInLevel / 100) * 100; // % pour la barre
  xpBar.style.width = percent + "%";
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

async function renderQuest() {
  const res = await fetch('/quest', {
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + localStorage.getItem("token"), 'Content-Type': 'application/json'}
  })
  
  if(res.status !== 200) {
    alert("Erreur lors de la récupération de la quête. Veuillez vous reconnecter.");
    localStorage.removeItem("token");
    window.location.href = '/login';
    return;
  }

  const data = await res.json();
  currentQuest = data.quest;
  questDone = data.done;

  questTextEl.textContent = "🎯 Objectif : " + currentQuest.description;
  if (data.done) {
    document.querySelector(".quest").classList.add("complete");
    questStatusEl.textContent = "✅ Quête réussie ! (+" + currentQuest.reward + " XP)";
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

  const response = await res.json();

  const li = document.createElement("li");
  li.textContent = `${response.category} : ${response.title} (${response.date})`;
  list.appendChild(li);

  if(response.questDone) {
    //alert("🎉 Quête accomplie ! Vous gagnez " + response.xpGained + " XP !");
    document.querySelector(".quest").classList.add("complete");
    questStatusEl.textContent = "✅ Quête réussie ! (+" + currentQuest.reward + " XP)";
  }

  updateXPUI(response.xpGained)
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
updateXPUI(0);
updateBadges();
renderQuest();

