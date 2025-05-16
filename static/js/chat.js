document.addEventListener("DOMContentLoaded", () => {
    if (typeof io !== "function") {
        alert("Socket.io n'est pas chargé !");
        return;
    }
    const chat = document.getElementById("chat");
    const form = document.getElementById("form");
    const input = document.getElementById("input");
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token"); // Ajoute la lecture du token

    if (!chat || !form || !input) {
        alert("Erreur : éléments du chat non trouvés dans le HTML !");
        return;
    }
    if (!token) {
        alert("Identifie-toi d'abord !");
        window.location.href = "/";
        return;
    }

    const socket = io();

    socket.on("connect", () => {
        // Envoie le token (et plus username seul)
        socket.emit("join", token);
    });

    // ... reste inchangé
});