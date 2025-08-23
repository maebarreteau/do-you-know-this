const authMsg = document.getElementById("authMsg");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");

// Helper pour envoyer POST
async function postData(url = '', data = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Création compte
registerBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const res = await postData('/register', { username, password });
  authMsg.textContent = res.message;
});

// Connexion
loginBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const res = await postData('/login', { username, password });
  authMsg.textContent = res.message;

  if(res.message === "Connexion réussie !"){
    setTimeout(() => window.location.href = '/', 500);
  }
});
