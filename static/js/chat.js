document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    const username = localStorage.getItem("username"); // ou une autre méthode si ton JWT contient le pseudo

    socket.on("connect", () => {
        socket.emit("join", username);
    });

    socket.on("message", (msg) => {
        const chat = document.getElementById("chat");
        const message = document.createElement("div");
        message.textContent = msg;
        chat.appendChild(message);
    });

    const form = document.getElementById("form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("input");
        socket.emit("message", {
            username: username,
            message: input.value
        });
        input.value = "";
    });
});
