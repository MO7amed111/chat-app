const socket = io();
const chat = document.getElementById("chat");
const usersList = document.getElementById("users");
const joinSound = document.getElementById("joinSound");
const messageSound = document.getElementById("messageSound");

let myName = "";
let isSending = false; // علامة لتتبع حالة الإرسال

function join() {
    myName = document.getElementById("name").value;
    if (!myName) return;
    socket.emit("join", myName);
    document.getElementById("login").style.display = "none";
    document.getElementById("chat-container").style.display = "flex";
    joinSound.play();
}

socket.on("user-joined", name => {
    chat.innerHTML += `<div>👋 <b>${name}</b> انضم</div>`;
    if (name !== myName) {
        joinSound.play();
    }
    chat.scrollTop = chat.scrollHeight;
});

socket.on("chat-message", data => {
    const isMyMessage = data.name === myName;
    
    // إذا كانت الرسالة مرسلة مني وأنا في حالة إرسال
    if (isMyMessage && isSending) {
        isSending = false; // نعيد تعيين العلامة
        return; // لا نضيفها مرة أخرى
    }
    
    chat.innerHTML += `<div><b>${data.name}:</b> ${data.message}</div>`;
    chat.scrollTop = chat.scrollHeight;
    
    if (!isMyMessage) {
        messageSound.play();
    }
});

socket.on("user-left", name => {
    chat.innerHTML += `<div>🚪 <i>${name} غادر</i></div>`;
    chat.scrollTop = chat.scrollHeight;
});

socket.on("users-list", users => {
    usersList.innerHTML = "";
    users.forEach(u => {
        usersList.innerHTML += `<li>${u}</li>`;
    });
});

function send() {
    const msg = document.getElementById("message").value;
    if (!msg) return;
    
    isSending = true; // نحدد أننا في حالة إرسال
    socket.emit("chat-message", msg);
    document.getElementById("message").value = "";
    
    // نضيف الرسالة مباشرة مع تشغيل الصوت
    chat.innerHTML += `<div><b>${myName}:</b> ${msg}</div>`;
    chat.scrollTop = chat.scrollHeight;
    messageSound.play(); // تشغيل الصوت هنا فقط
}

function leaveChat() {
    if (confirm("هل تريد حقًا مغادرة الدردشة؟")) {
        socket.disconnect();
        document.getElementById("chat-container").style.display = "none";
        document.getElementById("login").style.display = "block";
        document.getElementById("name").value = myName;
        chat.innerHTML += `<div>🚪 لقد غادرت الدردشة</div>`;
    }
}