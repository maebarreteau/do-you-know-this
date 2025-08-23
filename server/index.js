const express = require('express')
const app = express()
const port = 3000

let users = []

app.use(express.static('public'))
app.use(express.json()) 

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' })
})

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: 'public' })
})

app.post('/login', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  if(username === "" || password === ""){
    return res.status(300).json({ message: "Veuillez remplir tous les champs." });
  }

  const user = users.find(u => u.username === username && u.password === password);
  if(user){
    return res.status(200).json({ message: "Connexion réussie !" });
  } else {
    return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect." });
  }
})

app.post('/register', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  if(username === "" || password === ""){
    res.status(300).json({ message: "Veuillez remplir tous les champs." });
  }

  const existingUser = users.find(u => u.username === username);
  if(existingUser){
    return res.status(409).json({ message: "Ce nom d'utilisateur est déjà pris." });
  }

  users.push({username, password});
  return res.status(200).json({ message: "Compte créé avec succès !" });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
