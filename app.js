import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔧 GANTI DENGAN CONFIG KAMU
const firebaseConfig = {
  apiKey: "AIzaSyB8NWHgLI0DirzGSwTU_f4jCoVq2hI4hHE",
  authDomain: "chatroom-f01e6.firebaseapp.com",
  databaseURL: "https://chatroom-f01e6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chatroom-f01e6",
  storageBucket: "chatroom-f01e6.firebasestorage.app",
  messagingSenderId: "791094828090",
  appId: "1:791094828090:web:8a94581f6d15706f672903"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Elemen DOM
const modal = document.getElementById("modal");
const appEl = document.getElementById("app");
const usernameInput = document.getElementById("username-input");
const btnMasuk = document.getElementById("btn-masuk");
const messagesEl = document.getElementById("messages");
const msgInput = document.getElementById("msg-input");
const btnKirim = document.getElementById("btn-kirim");
const onlineList = document.getElementById("online-list");

let myName = "";
let myUid = "";

// ── Login Anonymous ──────────────────────────────
signInAnonymously(auth).then((result) => {
  myUid = result.user.uid;
});

// ── Masuk ke chat ────────────────────────────────
function masuk() {
  const name = usernameInput.value.trim();
  if (!name) return;
  myName = name;

  // Simpan ke online list
  const onlineRef = ref(db, `online/${myUid}`);
  push(ref(db, "online"), { name });

  modal.style.display = "none";
  appEl.classList.remove("hidden");
  msgInput.focus();

  // Dengarkan pesan
  listenMessages();
  listenOnline();
}

btnMasuk.addEventListener("click", masuk);
usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") masuk();
});

// ── Kirim Pesan ──────────────────────────────────
function kirim() {
  const text = msgInput.value.trim();
  if (!text || !myName) return;

  push(ref(db, "messages"), {
    user: myName,
    text: text,
    uid: myUid,
    time: serverTimestamp()
  });

  msgInput.value = "";
  msgInput.focus();
}

btnKirim.addEventListener("click", kirim);
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") kirim();
});

// ── Dengarkan Pesan ──────────────────────────────
function listenMessages() {
  onValue(ref(db, "messages"), (snapshot) => {
    messagesEl.innerHTML = "";
    snapshot.forEach((child) => {
      const msg = child.val();
      if (!msg.text) return;
      tampilkanPesan(msg);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

// ── Tampilkan Pesan ──────────────────────────────
function tampilkanPesan(msg) {
  const isOwn = msg.uid === myUid;
  const time = msg.time
    ? new Date(msg.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  const row = document.createElement("div");
  row.className = `msg-row${isOwn ? " own" : ""}`;

  row.innerHTML = `
    <div class="avatar">${msg.user[0].toUpperCase()}</div>
    <div class="msg-body">
      ${!isOwn ? `<div class="msg-name">${msg.user}</div>` : ""}
      <div class="bubble">${msg.text}</div>
      <div class="msg-time">${time}</div>
    </div>
  `;

  messagesEl.appendChild(row);
}

// ── Online List ──────────────────────────────────
function listenOnline() {
  onValue(ref(db, "online"), (snapshot) => {
    const names = new Set();
    snapshot.forEach((child) => {
      const data = child.val();
      if (data.name) names.add(data.name);
    });

    onlineList.innerHTML = "";
    names.forEach((name) => {
      const div = document.createElement("div");
      div.className = "online-user";
      div.innerHTML = `<div class="dot-online"></div>${name}`;
      onlineList.appendChild(div);
    });
  });
}