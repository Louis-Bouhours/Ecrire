document.addEventListener("DOMContentLoaded", () => {
    // Données fictives
    const currentUser  = {
        id: "current-user",
        name: "Thomas",
        avatar: "https://via.placeholder.com/40",
        status: "online",
    }

    const conversations = [
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
                id: "user2",
                name: "Lucas Dubois",
                avatar: "https://via.placeholder.com/40",
                status: "offline",
                lastSeen: "il y a 5h",
            },
            lastMessage: {
                id: "msg2",
                senderId: "current-user",
                text: "J'ai envoyé le document par email",
                timestamp: "Hier",
                read: true,
            },
            unreadCount: 0,
        },
        {
            id: "conv3",
            user: {
                id: "user3",
                name: "Emma Petit",
                avatar: "https://via.placeholder.com/40",
                status: "online",
            },
            lastMessage: {
                id: "msg3",
                senderId: "user3",
                text: "As-tu vu la dernière mise à jour ?",
                timestamp: "Hier",
                read: false,
            },
            unreadCount: 3,
        },
        {
            id: "conv4",
            user: {
                id: "user4",
                name: "Antoine Leroy",
                avatar: "https://via.placeholder.com/40",
                status: "away",
            },
            lastMessage: {
                id: "msg4",
                senderId: "user4",
                text: "Merci pour ton aide !",
                timestamp: "Lun",
                read: true,
            },
            unreadCount: 0,
        },
        {
            id: "conv5",
            user: {
                id: "user5",
                name: "Camille Bernard",
                avatar: "https://via.placeholder.com/40",
                status: "offline",
                lastSeen: "il y a 2j",
            },
            lastMessage: {
                id: "msg5",
                senderId: "current-user",
                text: "On en discute la semaine prochaine",
                timestamp: "28/04",
                read: true,
            },
            unreadCount: 0,
        },
    ]

    // Messages de la conversation active
    const conversationMessages = {
        conv1: [
            {
                id: "msg1",
                senderId: "user1",
                text: "Salut ! Comment ça va aujourd'hui ?",
                timestamp: "10:30",
                read: true,
            },
            {
                id: "msg2",
                senderId: "current-user",
                text: "Ça va bien, merci ! Je travaille sur un nouveau projet.",
                timestamp: "10:32",
                read: true,
            },
            {
                id: "msg3",
                senderId: "user1",
                text: "Super ! C'est quoi comme projet ?",
                timestamp: "10:33",
                read: true,
            },
            {
                id: "msg4",
                senderId: "current-user",
                text: "Une application de chat, justement ! Je suis en train de finaliser l'interface.",
                timestamp: "10:35",
                read: true,
            },
            {
                id: "msg5",
                senderId: "user1",
                text: "Ça a l'air intéressant ! Tu utilises quelles technologies ?",
                timestamp: "10:36",
                read: true,
            },
            {
                id: "msg6",
                senderId: "current-user",
                text: "HTML, CSS et JavaScript pour le frontend, et Go pour le backend. C'est vraiment efficace pour créer rapidement une interface moderne.",
                timestamp: "10:38",
                read: true,
            },
            {
                id: "msg7",
                senderId: "user1",
                text: "J'aimerais bien voir ça quand ce sera terminé !",
                timestamp: "10:40",
                read: true,
            },
            {
                id: "msg8",
                senderId: "current-user",
                text: "Bien sûr, je te montrerai. On pourrait se retrouver pour en discuter autour d'un café ?",
                timestamp: "10:41",
                read: true,
            },
            {
                id: "msg9",
                senderId: "user1",
                text: "On se retrouve où pour le déjeuner demain ?",
                timestamp: "10:42",
                read: true,
            },
        ],
    }

    // Éléments DOM
    const conversationsList = document.getElementById("conversationsList")
    const messagesContainer = document.getElementById("messagesContainer")
    const messages = document.getElementById("messages")
    const emptyState = document.getElementById("emptyState")
    const messageInput = document.getElementById("messageInput")
    const sendButton = document.getElementById("sendButton")
    const contactName = document.getElementById("contactName")
    const contactAvatar = document.getElementById("contactAvatar")
    const contactStatus = document.getElementById("contactStatus")
    const contactStatusText = document.getElementById("contactStatusText")
    const sidebar = document.getElementById("sidebar")
    const mobileMenuButton = document.getElementById("mobileMenuButton")
    const messageInputContainer = document.getElementById("messageInputContainer")

    let activeConversation = null

    // Initialiser la liste des conversations
    function renderConversations() {
        conversationsList.innerHTML = ""
        conversations.forEach((conversation) => {
            const conversationElement = document.createElement("div")
            conversationElement.className = `conversation-item ${activeConversation === conversation.id ? "active" : ""}`
            conversationElement.dataset.id = conversation.id

            const statusClass =
                conversation.user.status === "online" ? "online" : conversation.user.status === "away" ? "away" : "offline"

            const statusText =
                conversation.user.status === "online"
                    ? "En ligne"
                    : conversation.user.status === "away"
                        ? "Absent"
                        : conversation.user.lastSeen || "Hors ligne"

            conversationElement.innerHTML = `
                <div class="avatar">
                    <img src="${conversation.user.avatar}" alt="${conversation.user.name}">
                    <span class="status-indicator ${statusClass}"></span>
                </div>
                <div class="conversation-content">
                    <div class="conversation-header">
                        <span class="conversation-name">${conversation.user.name}</span>
                        ${conversation.lastMessage ? `<span class="conversation-time">${conversation.lastMessage.timestamp}</span>` : ""}
                    </div>
                    ${
                conversation.lastMessage
                    ? `
                        <div class="conversation-preview">
                            <span class="conversation-last-message">
                                ${conversation.lastMessage.senderId === currentUser .id ? "Vous: " : ""}
                                ${conversation.lastMessage.text}
                            </span>
                            ${conversation.unreadCount > 0 ? `<span class="unread-count">${conversation.unreadCount}</span>` : ""}
                        </div>
                    `
                    : ""
            }
                </div>
            `

            conversationElement.addEventListener("click", () => {
                setActiveConversation(conversation.id)
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove("open")
                }
            })

            conversationsList.appendChild(conversationElement)
        })
    }

    // Définir la conversation active
    function setActiveConversation(conversationId) {
        activeConversation = conversationId
        renderConversations()

        const conversation = conversations.find((c) => c.id === conversationId)

        if (conversation) {
            // Mettre à jour l'en-tête de la conversation
            contactName.textContent = conversation.user.name
            contactAvatar.src = conversation.user.avatar

            const statusClass =
                conversation.user.status === "online" ? "online" : conversation.user.status === "away" ? "away" : "offline"

            contactStatus.className = `status-indicator ${statusClass}`

            const statusText =
                conversation.user.status === "online"
                    ? "En ligne"
                    : conversation.user.status === "away"
                        ? "Absent"
                        : conversation.user.lastSeen || "Hors ligne"

            contactStatusText.textContent = statusText

            // Afficher les messages
            renderMessages(conversationId)

            // Cacher l'état vide et afficher les messages
            emptyState.style.display = "none"
            messages.style.display = "flex"
            messageInputContainer.style.display = "flex"
        } else {
            // Afficher l'état vide
            emptyState.style.display = "flex"
            messages.style.display = "none"
            messageInputContainer.style.display = "none"
        }
    }

    // Afficher les messages d'une conversation
    function renderMessages(conversationId) {
        messages.innerHTML = ""

        const conversationMsgs = conversationMessages[conversationId] || []

        conversationMsgs.forEach((message) => {
            const messageElement = document.createElement("div")
            messageElement.className = `message ${message.senderId === currentUser .id ? "outgoing" : "incoming"}`

            messageElement.innerHTML = `
                <div class="message-bubble">
                    <p>${message.text}</p>
                    <div class="message-time">${message.timestamp}</div>
                </div>
            `

            messages.appendChild(messageElement)
        })

        // Faire défiler jusqu'au dernier message
        messagesContainer.scrollTop = messagesContainer.scrollHeight
    }

    // Envoyer un nouveau message
    function sendMessage() {
        const text = messageInput.value.trim()

        if (text === "" || !activeConversation) return

        // Créer un nouveau message
        const newMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUser .id,
            text: text,
            timestamp: formatTime(new Date()),
            read: false,
        }

        // Ajouter le message à la conversation
        if (!conversationMessages[activeConversation]) {
            conversationMessages[activeConversation] = []
        }

        conversationMessages[activeConversation].push(newMessage)

        // Mettre à jour le dernier message de la conversation
        const conversation = conversations.find((c) => c.id === activeConversation)
        if (conversation) {
            conversation.lastMessage = newMessage
        }

        // Mettre à jour l'interface
        renderMessages(activeConversation)
        renderConversations()

        // Réinitialiser l'input
        messageInput.value = ""

        // Dans une application réelle, vous enverriez ce message au serveur Go ici
        // Par exemple:
        // fetch('/api/messages', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         conversationId: activeConversation,
        //         text: text,
        //         senderId: currentUser .id
        //     }),
        // });
    }

    // Formater l'heure
    function formatTime(date) {
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    }

    // Gestionnaires d'événements
    sendButton.addEventListener("click", sendMessage)

    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    })

    messageInput.addEventListener("input", () => {
        sendButton.disabled = messageInput.value.trim() === ""
    })

    mobileMenuButton.addEventListener("click", () => {
        sidebar.classList.toggle("open")
    })

    // Gestion du responsive
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove("open")
        }
    })

    document.getElementById("startChatButton").addEventListener("click", () => {
        const username = document.getElementById("usernameInput").value.trim();
        if (username) {
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.id) {
                        document.getElementById("usernameContainer").style.display = "none";
                        document.querySelector(".chat-container").style.display = "flex";
                        initializeWebSocket(username);
                    } else {
                        alert("Erreur lors de l'enregistrement du pseudo.");
                    }
                });
        } else {
            alert("Veuillez entrer un pseudo.");
        }
    });

    function initializeWebSocket(username) {
        const socket = new WebSocket(`ws://localhost:8080/ws/${username}`);
        // Logique de gestion des messages ici...
    }

    // Initialisation
    renderConversations()
    sendButton.disabled = true

    // Définir la première conversation comme active par défaut
    if (conversations.length > 0) {
        setActiveConversation(conversations[0].id)
    }

    // Simuler la réception d'un nouveau message (pour démonstration)
    setTimeout(() => {
        if (activeConversation === "conv1") {
            const newMessage = {
                id: `msg-${Date.now()}`,
                senderId: "user1",
                text: "Au fait, j'ai trouvé un super restaurant pour demain midi. Ça te dit d'essayer ?",
                timestamp: formatTime(new Date()),
                read: false,
            }

            conversationMessages["conv1"].push(newMessage)
            conversations[0].lastMessage = newMessage
            conversations[0].unreadCount += 1

            renderMessages("conv1")
            renderConversations()
        }
    }, 10000)
})
