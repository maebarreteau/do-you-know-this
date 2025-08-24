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
const badgesContainer = document.getElementById("badges-container");

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

    // 🔥 afficher les genres si présents
    if (e.genres && e.genres.length > 0) {
      const span = document.createElement("span");
      span.style.marginLeft = "10px";
      span.textContent = "Genres : " + e.genres.join(", ");
      li.appendChild(span);
    }

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

function updateBadges(badges) {
  // badges = nos badges
  badges.forEach(b => {
    if(b.condition === b.advancement){
      alert("🏅 Nouveau badge débloqué : " + b.name);
    }
  });

  let children = Array.from(badgesContainer.children);
  children.forEach(c => {
    let id = c.id;
  });

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
const comment = document.getElementById("comment").value;
const rating = document.getElementById("rating").value; // 🔥 récupère la note


const genres = Array.from(document.querySelectorAll(".category-checkbox:checked"))
                   .map(cb => cb.value);

const entry = {
  category,
  title,
  date: new Date().toLocaleDateString(),
  comment,
  rating, 
  genres 
};


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
li.textContent = `${entry.category} : ${entry.title} (${entry.date})`;

// afficher la note
if(entry.rating){
  li.textContent += ` - Note : ${entry.rating}/10`;
}

// afficher les genres
if(entry.genres && entry.genres.length > 0){
  li.textContent += ` - Genres : ${entry.genres.join(", ")}`;
}

list.appendChild(li);


  // afficher les genres si présents
  if (response.genres && response.genres.length > 0) {
    const span = document.createElement("span");
    span.style.marginLeft = "10px";
    span.textContent = "Genres : " + response.genres.join(", ");
    li.appendChild(span);
  }

  if(entry.comment){
  li.textContent += ` - Commentaire : ${entry.comment}`;
}

  list.appendChild(li);

  if(response.questDone) {
    document.querySelector(".quest").classList.add("complete");
    questStatusEl.textContent = "✅ Quête réussie ! (+" + currentQuest.reward + " XP)";
  }

  updateBadges(response.badges)
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
  }
});

// ==================== INIT ====================
renderList();
updateXPUI(0);
renderQuest();
