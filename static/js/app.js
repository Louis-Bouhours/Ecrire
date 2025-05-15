document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem('username');
    document.getElementById('profile-username').textContent = username ? username : 'Utilisateur';

    fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username: "admin", password: "1234" })
    }).then(res => res.json()).then(console.log);

    const conversations = [
        // Exemple de conversations
        {
            id: "conv1",
            user: {
                id: "user1",
                name: "Sophie Martin",
                avatar: "https://via.placeholder.com/40",
                status: "online",
            },
            lastMessage: {
                id: "msg1",
                senderId: "user1",
                text: "On se retrouve où pour le déjeuner demain ?",
                timestamp: "10:42",
                read: true,
            },
            unreadCount: 0,
        },

        {
            id: "conv2",
            user: {
                id: "user1",
                name: "Sophie Martin",
                avatar: "https://via.placeholder.com/40",
                status: "online",
            },
            lastMessage: {
                id: "msg1",
                senderId: "user1",
                text: "On se retrouve où pour le déjeuner demain ?",
                timestamp: "10:42",
                read: true,
            },
            unreadCount: 0,
        },

        {
            id: "conv3",
            user: {
                id: "user1",
                name: "Sophie Martin",
                avatar: "https://via.placeholder.com/40",
                status: "online",
            },
            lastMessage: {
                id: "msg1",
                senderId: "user1",
                text: "On se retrouve où pour le déjeuner demain ?",
                timestamp: "10:42",
                read: true,
            },
            unreadCount: 4,
        },


        // Ajoutez d'autres conversations ici
    ];

    // Éléments DOM
    const conversationsList = document.getElementById("conversationsList");
    const messagesContainer = document.getElementById("messagesContainer");
    const messages = document.getElementById("messages");
    const emptyState = document.getElementById("emptyState");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const contactName = document.getElementById("contactName");
    const contactAvatar = document.getElementById("contactAvatar");
    const contactStatus = document.getElementById("contactStatus");
    const contactStatusText = document.getElementById("contactStatusText");
    const sidebar = document.getElementById("sidebar");
    const mobileMenuButton = document.getElementById("mobileMenuButton");

    let activeConversation = null;

    // Initialiser la liste des conversations
    function renderConversations() {
        conversationsList.innerHTML = "";
        conversations.forEach((conversation) => {
            const conversationElement = document.createElement("div");
            conversationElement.className = `conversation-item ${activeConversation === conversation.id ? "active" : ""}`;
            conversationElement.dataset.id = conversation.id;

            conversationElement.innerHTML = `
                <div class="avatar">
                    <img src="${conversation.user.avatar}" alt="${conversation.user.name}">
                </div>
                <div class="conversation-content">
                    <div class="conversation-header">
                        <span class="conversation-name">${conversation.user.name}</span>
                        ${conversation.lastMessage ? `<span class="conversation-time">${conversation.lastMessage.timestamp}</span>` : ""}
                    </div>
                    ${conversation.lastMessage ? `
                        <div class="conversation-preview">
                            <span class="conversation-last-message">${conversation.lastMessage.text}</span>
                            ${conversation.unreadCount > 0 ? `<span class="unread-count">${conversation.unreadCount}</span>` : ""}
                        </div>
                    ` : ""}
                </div>
            `;

            conversationElement.addEventListener("click", () => {
                setActiveConversation(conversation.id);
            });

            conversationsList.appendChild(conversationElement);
        });
    }

    // Définir la conversation active
    function setActiveConversation(conversationId) {
        activeConversation = conversationId;
        renderConversations();

        const conversation = conversations.find((c) => c.id === conversationId);
        if (conversation) {
            contactName.textContent = conversation.user.name;
            contactAvatar.src = conversation.user.avatar;
            contactStatus.className = `status-indicator ${conversation.user.status}`;
            contactStatusText.textContent = conversation.user.status === "online" ? "En ligne" : "Hors ligne";
            emptyState.style.display = "none";
            messagesContainer.style.display = "flex";
        } else {
            emptyState.style.display = "flex";
            messagesContainer.style.display = "none";
        }
    }

    // Envoyer un nouveau message
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === "" || !activeConversation) return;

        // Créer un nouveau message
        const newMessage = {
            id: `msg-${Date.now()}`,
            senderId: "current-user",
            text: text,
            timestamp: new Date().toLocaleTimeString(),
            read: false,
        };

        // Ajouter le message à la conversation
        const conversation = conversations.find((c) => c.id === activeConversation);
        if (conversation) {
            conversation.lastMessage = newMessage;
            renderConversations();
        }

        messageInput.value = "";
    }

    sendButton.addEventListener("click", sendMessage);
    renderConversations();
});
