let socket;
let token = localStorage.getItem("token"); // Ou autre méthode si JWT stockage diffère
let username = localStorage.getItem("username"); // À stocker au login

// Fonction d'initialisation après redirection vers /chat
async function initChat() {
  if (!token || !username) {
    window.location.href = '/'; // Renvoyer vers login si infos manquantes
    return;
  }

  socket = io("/", { forceNew: true }); // Connexion Socket.io

  // On rejoint le général immédiatement
  socket.emit('join', { username, token, room: "general" });

  // Affichage du pseudo dans le profil sidebar
  const profileUsername = document.getElementById('profile-username');
  if (profileUsername) profileUsername.textContent = username;

  // Afficher la conversation #général épinglée
  displayConversations([
    { id: "general", name: "#général", pinned: true },
    // ... Ici tu ajoutes dynamiquement les conversations persos du user ensuite
  ]);

  // Gestion des messages reçus
  socket.on('message', (msg) => {
    if (msg.room === "general") {
      displayMessage(msg, "general");
    } else {
      displayMessage(msg, msg.room);
    }
  });

  // Gestion de la sélection des discussions dans la sidebar
  document.getElementById('conversationsList').addEventListener('click', (e) => {
    const conv = e.target.closest('.conversation-item');
    if (!conv) return;
    selectConversation(conv.dataset.id, conv.dataset.name);
  });

  // Gestion de l'envoi de message
  document.getElementById('sendButton').addEventListener('click', sendMessage);
  document.getElementById('messageInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
  });

  // Affichage de la discussion générale au chargement
  selectConversation("general", "#général");
}

function displayConversations(conversations) {
  const list = document.getElementById('conversationsList');
  list.innerHTML = '';
  // Épingler le général tout en haut
  conversations.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  conversations.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'conversation-item' + (conv.pinned ? ' pinned' : '');
    item.dataset.id = conv.id;
    item.dataset.name = conv.name;
    item.textContent = conv.name;
    list.appendChild(item);
  });
}

let currentConversation = null;

function selectConversation(id, nom) {
  currentConversation = id;
  // Logique pour changer le header
  document.getElementById('contactName').textContent = nom;
  document.getElementById('messages').innerHTML = ''; // Clear previous messages (optionnel : charger l'ancien historique)
  document.getElementById('emptyState').style.display = 'none';
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const msg = input.value.trim();
  if (!msg || !currentConversation) return;
  socket.emit('message', {
    username: username,
    room: currentConversation,
    message: msg,
    token: token
  });
  input.value = '';
}

// Afficher un message dans la bonne conversation (ici, pour le général ou sélection)
function displayMessage(msg, roomId) {
  if (roomId !== currentConversation) return; // N'affiche les messages que pour la conversation courante
  const messagesDiv = document.getElementById('messages');
  const messageElt = document.createElement('div');
  messageElt.innerHTML = `<b>${msg.username || "?"}</b> : ${msg.message}`;
  messagesDiv.appendChild(messageElt);
}

// Lancer le chat à l'ouverture de la page
window.addEventListener('DOMContentLoaded', initChat);