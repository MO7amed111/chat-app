const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = {};
let messages = [];

io.on("connection", (socket) => {
    console.log("📲 مستخدم متصل:", socket.id);

    socket.on("join", (name) => {
        socket.username = name;
        users[socket.id] = name;

        socket.broadcast.emit("user-joined", name);
        io.emit("users-list", Object.values(users));

        messages.forEach(msg => socket.emit("chat-message", msg));
    });

    socket.on("chat-message", (msg) => {
        const messageData = { name: socket.username, message: msg };
        messages.push(messageData);
        io.emit("chat-message", messageData);
    });

    socket.on("disconnect", () => {
        const name = users[socket.id];
        delete users[socket.id];
        socket.broadcast.emit("user-left", name);
        io.emit("users-list", Object.values(users));
        console.log("❌ مستخدم غادر:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`✅ الخادم يعمل على http://localhost:${PORT}`);
});
