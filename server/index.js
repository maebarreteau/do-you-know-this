const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./model/User');
const Entry = require('./model/Entry')
const Quest = require('./model/Quest');
const app = express();
const port = 3000;

// Secret pour signer les tokens
const JWT_SECRET = "monsecret123";

let users = [];
let actualQuest = new Quest("Regarder un film", 20, "film")

app.use(express.static('public'));
app.use(express.json());

// Pages statiques
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: 'public' });
});

// Connexion
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username === "" || password === ""){
    return res.status(400).json({ message: "Veuillez remplir tous les champs." });
  }

  const user = users.find(u => u.username === username && u.password === password);
  if(user){
    // Générer le token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ message: "Connexion réussie !", token });
  } else {
    return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect." });
  }
});

// Inscription
app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username === "" || password === ""){
    return res.status(400).json({ message: "Veuillez remplir tous les champs." });
  }

  const existingUser = users.find(u => u.username === username);
  if(existingUser){
    return res.status(409).json({ message: "Ce nom d'utilisateur est déjà pris." });
  }

  users.push(new User(username, password));
  return res.status(200).json({ message: "Compte créé avec succès !" });
});

app.get('/entries', authenticateToken, (req, res) => {
  const foundUser = users.find(u => u.username === req.user.username);
  if(!foundUser) return res.status(404).json({ message: "Utilisateur non trouvé." });

  return res.status(200).json(foundUser.entries);
})

app.post("/entries", authenticateToken ,(req, res) => {
  const foundUser = users.find(u => u.username === req.user.username);
  if(!foundUser) return res.status(404).json({ message: "Utilisateur non trouvé." });

  const { category, title, date, comment } = req.body;
  if(!category || !title || !date) return res.status(400).json({ message: "Champs manquants." });

  const newEntry = new Entry(title, date, [], category, comment || "", 10);
  const xpFromCategory = newEntry.getXPFromCategory();

  foundUser.addEntry(newEntry);
  foundUser.xp += xpFromCategory;

  if(!foundUser.isWeeklyQuestDone && actualQuest.checkEntryValidQuest(newEntry))
  {
    foundUser.isWeeklyQuestDone = true;
    foundUser.xp += actualQuest.reward;

    return res.status(201).json({ ...newEntry, questDone: true, xpGained: foundUser.xp });
  }

  return res.status(201).json({...newEntry, questDone: false, xpGained: foundUser.xp });
})

app.get('/quest', authenticateToken, (req, res) => {
  const foundUser = users.find(u => u.username === req.user.username);
  if(!foundUser) return res.status(404).json({ message: "Utilisateur non trouvé." });

  return res.status(200).json({ quest: actualQuest, done: foundUser.isWeeklyQuestDone });
});

// Middleware pour protéger les routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if(!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if(err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Exemple de route protégée
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Bienvenue ${req.user.username} !` });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
