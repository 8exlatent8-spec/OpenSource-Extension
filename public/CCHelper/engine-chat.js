(() => {
  const content     = window.__engineContent__;
  const contentWrap = window.__engineContentWrap__;

  // ── USERNAME ──────────────────────────────────────────────────────────────
  const ADJECTIVES = [
    "Happy","Sad","Angry","Calm","Brave","Shy","Bold","Clever","Wise","Silly",
    "Kind","Cruel","Gentle","Rough","Quick","Slow","Fast","Bright","Dark","Loud",
    "Quiet","Strong","Weak","Tall","Short","Big","Small","Tiny","Huge","Massive",
    "Heavy","Light","Soft","Hard","Warm","Cold","Hot","Cool","Dry","Wet",
    "Clean","Dirty","Rich","Poor","Early","Late","Young","Old","New","Ancient",
    "Modern","Fresh","Stale","Sweet","Bitter","Sour","Salty","Spicy","Smooth","Sharp",
    "Dull","Clear","Cloudy","Busy","Lazy","Friendly","Rude","Polite","Honest","Loyal",
    "Proud","Humble","Famous","Unknown","Simple","Complex","Rare","Common","Empty","Full",
    "Safe","Dangerous","Lucky","Unlucky","Fancy","Plain","Noisy","Silent","Fragile","Tough",
    "Wild","Tame","Smart","Stupid","Funny","Serious","Creative","Boring","Nervous","Relaxed"
  ];
  const ANIMALS = [
    "Lion","Tiger","Bear","Wolf","Fox","Deer","Moose","Horse","Zebra","Giraffe",
    "Elephant","Rhino","Hippo","Panda","Koala","Kangaroo","Leopard","Cheetah","Jaguar","Hyena",
    "Otter","Beaver","Squirrel","Rabbit","Hare","Badger","Skunk","Raccoon","Hedgehog","Porcupine",
    "Monkey","Gorilla","Chimpanzee","Baboon","Sloth","Llama","Alpaca","Camel","Buffalo","Bison",
    "Goat","Sheep","Cow","Pig","Donkey","Mule","Cat","Dog","Mouse","Rat",
    "Dolphin","Whale","Shark","Seal","Walrus","Penguin","Eagle","Hawk","Falcon","Owl",
    "Crow","Raven","Parrot","Peacock","Swan","Goose","Duck","Chicken","Rooster","Turkey",
    "Ostrich","Flamingo","Sparrow","Pigeon","Bat","Frog","Toad","Snake","Lizard","Turtle",
    "Tortoise","Crocodile","Alligator","Ant","Bee","Wasp","Butterfly","Moth","Spider","Scorpion",
    "Crab","Lobster","Shrimp","Octopus","Squid","Jellyfish","Starfish","Seahorse","Panther","Falcon"
  ];

  // ── SESSION ID ────────────────────────────────────────────────────────────
  let mySessionId = sessionStorage.getItem("cc_session_id");
  if (!mySessionId) {
    mySessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("cc_session_id", mySessionId);
  }

  let myUsername = localStorage.getItem("cc_chat_username");
  if (!myUsername) {
    const adj    = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const num    = String(Math.floor(Math.random() * 90) + 10);
    myUsername   = adj + animal + num;
    localStorage.setItem("cc_chat_username", myUsername);
  }

  // ── TAB PANEL — created first so setStatus can write into it ─────────────
  const chatContent = document.createElement("div");
  chatContent.style.cssText = "display:none;position:relative;font-family:monospace;";
  contentWrap.appendChild(chatContent);
  content["Chat"] = chatContent;

  // ── SETSTATUS — defined right after chatContent so the immediate call works
  function setStatus(msg, phase) {
    const phases = {
      connecting: { icon: "🔥", color: "#5CC85B", sub: "Establishing connection…" },
      username:   { icon: "🪪", color: "#FFD84D", sub: "Reserving your identity…" },
      rooms:      { icon: "🏰", color: "#FF8C42", sub: "Loading party rooms…" },
      error:      { icon: "⚠️", color: "#ff6b6b", sub: "" },
    };
    const p = phases[phase] || { icon: "⚙️", color: "#888", sub: "" };
    chatContent.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px;gap:10px;font-family:'Nunito',monospace;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:2px;width:32px;height:32px;animation:cc-blockBob 1.2s ease-in-out infinite;">
          <span style="background:#5CC85B;border-radius:2px;display:block;"></span>
          <span style="background:#3DA83C;border-radius:2px;display:block;"></span>
          <span style="background:#7ADA79;border-radius:2px;display:block;"></span>
          <span style="background:#A0724A;border-radius:2px;display:block;"></span>
          <span style="background:#7A5535;border-radius:2px;display:block;"></span>
          <span style="background:#C49060;border-radius:2px;display:block;"></span>
          <span style="background:#8FA3B1;border-radius:2px;display:block;"></span>
          <span style="background:#6A8898;border-radius:2px;display:block;"></span>
          <span style="background:#B0C4D0;border-radius:2px;display:block;"></span>
        </div>
        <div style="text-align:center;">
          <div style="font-size:18px;margin-bottom:4px;">${p.icon}</div>
          <div style="font-size:12px;font-weight:800;color:${p.color};letter-spacing:0.03em;">${msg}</div>
          ${p.sub ? `<div style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:3px;">${p.sub}</div>` : ""}
        </div>
        <div style="display:flex;gap:5px;margin-top:2px;">
          ${[0,1,2].map(i => `<span style="width:6px;height:6px;border-radius:50%;background:${p.color};opacity:0.85;animation:cc-pulse 1.2s ease-in-out ${i*0.22}s infinite;display:inline-block;"></span>`).join("")}
        </div>
      </div>
    `;
  }

  // ── Show loading immediately — tab is never blank ─────────────────────────
  setStatus("Connecting to CC Engine", "connecting");

  // ── STYLES ────────────────────────────────────────────────────────────────
  const ST = document.createElement("style");
  ST.textContent = `
    @keyframes ccShake {
      0%,100%{ transform:translateX(0); }
      20%    { transform:translateX(-6px); }
      40%    { transform:translateX(6px); }
      60%    { transform:translateX(-4px); }
      80%    { transform:translateX(4px); }
    }
    .cc-shake { animation: ccShake 0.38s ease; }
    .cc-scroll::-webkit-scrollbar       { width:3px; }
    .cc-scroll::-webkit-scrollbar-track { background:rgba(255,255,255,0.05); }
    .cc-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.2); border-radius:2px; }
    .cc-row-pub  { background:rgba(22,38,62,0.6); }
    .cc-row-priv { background:rgba(58,36,14,0.6); }
    .cc-row-pub:hover  { background:rgba(32,54,88,0.78); }
    .cc-row-priv:hover { background:rgba(80,50,18,0.78); }
    .cc-input {
      background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.18);
      color:#e0e0e0; border-radius:5px; font-family:monospace;
      padding:5px 8px; font-size:11px; outline:none;
      transition:border-color 0.2s; box-sizing:border-box;
    }
    .cc-input:focus { border-color:rgba(255,255,255,0.42); }
    .cc-input.cc-err { border-color:#922 !important; }
    .cc-btn {
      background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.15);
      color:#c0c0c0; border-radius:5px; padding:5px 10px; cursor:pointer;
      font-family:monospace; font-size:11px;
      transition:background 0.15s, border-color 0.15s, color 0.15s;
    }
    .cc-btn:hover  { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.28); color:#eee; }
    .cc-btn.cc-act { background:rgba(35,55,35,0.85); border-color:rgba(255,255,255,0.22); color:#ddd; }
    .cc-btn.cc-sm  { padding:3px 8px; font-size:10px; }
    .cc-tgl      { background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.13); color:#888; }
    .cc-tgl.cc-on{ background:rgba(35,50,35,0.9); border-color:rgba(255,255,255,0.22); color:#ccc; }
    .cc-lbl {
      font-size:10px; color:rgba(255,255,255,0.65);
      margin-bottom:3px; letter-spacing:0.3px; font-weight:bold;
    }
    .cc-bub-me    { background:rgba(45,85,170,0.75); border:1px solid rgba(80,130,255,0.3);
                    border-radius:12px 12px 2px 12px; align-self:flex-end; margin-left:18px; }
    .cc-bub-other { background:rgba(48,48,48,0.8); border:1px solid rgba(255,255,255,0.08);
                    border-radius:12px 12px 12px 2px; align-self:flex-start; margin-right:18px; }
    .cc-popup-wrap {
      position:absolute; inset:0; background:rgba(0,0,0,0.72);
      display:flex; align-items:center; justify-content:center;
      z-index:10010; border-radius:10px;
    }
    .cc-popup {
      background:rgba(14,14,14,0.97); border:1px solid rgba(255,255,255,0.15);
      border-radius:8px; padding:14px 12px; width:158px;
      text-align:center; color:#ccc; font-family:monospace;
      box-shadow:0 6px 28px rgba(0,0,0,0.75);
    }
    .cc-popup.cc-perr { border-color:#7a1a1a !important; }
  `;
  (document.head || document.documentElement).appendChild(ST);

  // ── STATE ─────────────────────────────────────────────────────────────────
  let db           = null;
  let currentParty = null;
  let unsubMsgs    = null;
  let unsubParties = null;

  function clearSubs() {
    if (unsubMsgs)    { unsubMsgs();    unsubMsgs    = null; }
    if (unsubParties) { unsubParties(); unsubParties = null; }
  }

  function stopInput(el) {
    ["keydown","keyup","keypress","input","paste"].forEach(ev =>
      el.addEventListener(ev, e => e.stopPropagation())
    );
  }

  // ── USERNAME UNIQUENESS ───────────────────────────────────────────────────
  async function claimUsername(username) {
    if (!db) return false;
    const ref = db.collection("usernames").doc(username);
    try {
      await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (snap.exists && snap.data().sessionId !== mySessionId) {
          throw new Error("taken");
        }
        tx.set(ref, {
          sessionId:  mySessionId,
          claimedAt:  firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      return true;
    } catch(e) {
      return false;
    }
  }

  async function releaseUsername(username) {
    if (!db || !username) return;
    try {
      const ref  = db.collection("usernames").doc(username);
      const snap = await ref.get();
      if (snap.exists && snap.data().sessionId === mySessionId) {
        await ref.delete();
      }
    } catch(e) { console.warn("releaseUsername:", e); }
  }

  function releaseOnUnload(username) {
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/usernames/${encodeURIComponent(username)}?key=${FIREBASE_API_KEY}`;
    try {
      fetch(url, { method: "DELETE", keepalive: true });
    } catch(_) {}
  }

  function generateRandomUsername() {
    const adj    = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const num    = String(Math.floor(Math.random() * 90) + 10);
    return adj + animal + num;
  }

  async function initUsername() {
    let claimed = await claimUsername(myUsername);
    let attempts = 0;
    while (!claimed && attempts < 20) {
      myUsername = generateRandomUsername();
      claimed    = await claimUsername(myUsername);
      attempts++;
    }
    if (claimed) {
      localStorage.setItem("cc_chat_username", myUsername);
      sessionStorage.setItem("cc_session_username", myUsername);
    } else {
      console.warn("Chat: could not claim a unique username after 20 tries.");
    }
  }

  // ── PRESENCE ──────────────────────────────────────────────────────────────
  const FIREBASE_API_KEY  = "AIzaSyBNcwFgoFyKUP3vm7eYSjDRvzzNsSnIABM";
  const FIRESTORE_PROJECT = "chat-7144e";

  const EMPTY_TTL_MS = 10_000;
  const deleteTimers = {};

  function scheduleDelete(partyId, emptyAtMs) {
    cancelDelete(partyId);
    const elapsed = Date.now() - emptyAtMs;
    const delay   = Math.max(0, EMPTY_TTL_MS - elapsed);
    deleteTimers[partyId] = setTimeout(async () => {
      delete deleteTimers[partyId];
      try {
        const snap = await db.collection("parties").doc(partyId).get();
        if (!snap.exists) return;
        const d = snap.data();
        if (d.pinned) return;
        if ((d.memberCount || 0) > 0) return;
        await purgeMessages(partyId);
        await db.collection("parties").doc(partyId).delete();
      } catch(e) { console.warn("scheduleDelete:", e); }
    }, delay);
  }

  function cancelDelete(partyId) {
    if (deleteTimers[partyId]) {
      clearTimeout(deleteTimers[partyId]);
      delete deleteTimers[partyId];
    }
  }

  async function purgeMessages(partyId) {
    try {
      const snap = await db.collection("parties").doc(partyId)
        .collection("messages").limit(300).get();
      if (snap.empty) return;
      const b = db.batch();
      snap.forEach(d => b.delete(d.ref));
      await b.commit();
    } catch(e) { console.warn("purgeMessages:", e); }
  }

  function evaluateAutoDelete(partyId, data) {
    if (data.pinned) return;
    const count = data.memberCount || 0;
    if (count > 0) { cancelDelete(partyId); return; }
    const ea = data.emptyAt;
    const emptyAtMs = ea
      ? (ea.toMillis ? ea.toMillis() : ea.seconds * 1000)
      : Date.now();
    scheduleDelete(partyId, emptyAtMs);
  }

  async function adjustMemberCount(partyId, delta) {
    if (!db || !partyId) return;
    try {
      const update = { memberCount: firebase.firestore.FieldValue.increment(delta) };
      if (delta < 0) update.emptyAt = firebase.firestore.FieldValue.serverTimestamp();
      else           update.emptyAt = firebase.firestore.FieldValue.delete();
      await db.collection("parties").doc(partyId).update(update);
    } catch(e) { console.warn("adjustMemberCount:", e); }
  }

  function decrementOnUnload(partyId) {
    const commitUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents:commit?key=${FIREBASE_API_KEY}`;
    const docPath   = `projects/${FIRESTORE_PROJECT}/databases/(default)/documents/parties/${partyId}`;
    const body = JSON.stringify({
      writes: [{
        transform: {
          document: docPath,
          fieldTransforms: [
            { fieldPath: "memberCount", increment: { integerValue: "-1" } },
            { fieldPath: "emptyAt",     setToServerValue: "REQUEST_TIME"  }
          ]
        }
      }]
    });
    try {
      fetch(commitUrl, {
        method:    "POST",
        headers:   { "Content-Type": "application/json" },
        body,
        keepalive: true
      });
    } catch(_) {}
  }

  // ── FIREBASE ──────────────────────────────────────────────────────────────
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-ccfs="${url}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.setAttribute("data-ccfs", url);
      s.src = url; s.onload = resolve; s.onerror = reject;
      document.documentElement.appendChild(s);
    });
  }

  function getFirebaseDb() {
    if (!window.__ccFirebaseInit__) {
      window.__ccFirebaseInit__ = (async () => {
        await loadScript("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js");
        if (!firebase.apps.length) {
          firebase.initializeApp({
            apiKey:            FIREBASE_API_KEY,
            authDomain:        "chat-7144e.firebaseapp.com",
            projectId:         FIRESTORE_PROJECT,
            storageBucket:     "chat-7144e.firebasestorage.app",
            messagingSenderId: "1006738885816",
            appId:             "1:1006738885816:web:bbfd4eac22f6b24347784d"
          });
        }
        const firestoreDb = firebase.firestore();
        window.__ccFirebaseDb__ = firestoreDb;
        return firestoreDb;
      })();
    }
    return window.__ccFirebaseInit__;
  }

  async function initFirebase() {
    setStatus("Connecting to CC Engine", "connecting");
    try {
      db = await getFirebaseDb();
      setStatus("Reserving Username", "username");
      await initUsername();
      setStatus("Loading Rooms", "rooms");
      await ensureGeneralRoom();
      renderList();
    } catch(e) {
      console.error("Chat: Firebase init failed", e);
      setStatus("Could not connect to Firebase.", "error");
    }
  }

  // ── GENERAL ROOM ──────────────────────────────────────────────────────────
  async function ensureGeneralRoom() {
    try {
      const ref  = db.collection("parties").doc("general");
      const snap = await ref.get();
      if (!snap.exists) {
        await ref.set({
          name:        "General",
          visibility:  "public",
          code:        null,
          pinned:      true,
          memberCount: 0,
          createdAt:   firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch(e) { console.warn("ensureGeneralRoom:", e); }
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  function renderList() {
    clearSubs();
    chatContent.innerHTML = "";

    const bar = mk("div", "padding:8px 8px 6px;border-bottom:1px solid rgba(255,255,255,0.08);");

    const uRow = mk("div", "display:flex;align-items:center;gap:6px;margin-bottom:8px;background:rgba(255,255,255,0.05);border-radius:6px;padding:6px 8px;");
    const uAvatar = mk("div", "font-size:17px;line-height:1;flex-shrink:0;");
    uAvatar.textContent = "\u{1F464}";
    const uBadge = mk("div", "font-size:12px;font-weight:bold;color:rgba(255,255,255,0.88);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:0.2px;");
    uBadge.textContent = myUsername;

    const editBtn = document.createElement("button");
    editBtn.title = "Change username";
    editBtn.style.cssText = "background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);border-radius:4px;cursor:pointer;padding:3px 5px;opacity:0.7;transition:opacity 0.15s,background 0.15s;flex-shrink:0;line-height:1;display:flex;align-items:center;";
    editBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="rgba(255,255,255,0.85)" stroke-width="1.6" stroke-linejoin="round"/><path d="M9.5 3.5L12.5 6.5" stroke="rgba(255,255,255,0.85)" stroke-width="1.6"/></svg>';
    editBtn.onmouseenter = () => { editBtn.style.opacity = "1"; editBtn.style.background = "rgba(255,255,255,0.13)"; };
    editBtn.onmouseleave = () => { editBtn.style.opacity = "0.7"; editBtn.style.background = "rgba(255,255,255,0.07)"; };
    editBtn.onclick = () => showUsernameEdit(uBadge);

    uRow.append(uAvatar, uBadge, editBtn);
    bar.append(uRow);
    chatContent.appendChild(bar);

    const searchWrap = mk("div", "padding:5px 7px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:0;position:relative;");

    const newBtn = document.createElement("button");
    newBtn.textContent = "+ Party";
    newBtn.className = "cc-btn cc-act";
    newBtn.style.cssText += "border-radius:5px 0 0 5px;border-right:none;flex-shrink:0;font-size:11px;padding:0 10px;white-space:nowrap;height:28px;box-sizing:border-box;line-height:28px;";
    newBtn.onclick = renderCreate;

    const searchIn = document.createElement("input");
    searchIn.type        = "text";
    searchIn.placeholder = "Search rooms…";
    searchIn.className   = "cc-input";
    searchIn.style.cssText += "flex:1;border-radius:0 5px 5px 0;border-left:none;min-width:0;padding-right:28px;height:28px;box-sizing:border-box;";
    stopInput(searchIn);

    const searchIcon = mk("div", "position:absolute;right:12px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.35);font-size:13px;pointer-events:none;font-style:normal;line-height:1;font-family:monospace;");
    searchIcon.textContent = "\u2315";

    searchWrap.append(newBtn, searchIn, searchIcon);
    chatContent.appendChild(searchWrap);

    const list = mk("div", "overflow-y:auto;max-height:198px;");
    list.className = "cc-scroll";
    chatContent.appendChild(list);

    let allDocs = [];

    function renderRooms() {
      const query = searchIn.value.trim().toLowerCase();
      list.innerHTML = "";

      const filtered = query
        ? allDocs.filter(doc => doc.data().name.toLowerCase().includes(query))
        : allDocs;

      if (filtered.length === 0) {
        const msg = query ? `No rooms matching "${searchIn.value}"` : "No parties yet.<br>Create one!";
        list.innerHTML = `<div style="padding:22px 10px;color:rgba(255,255,255,0.28);font-size:11px;text-align:center;line-height:1.8;">${msg}</div>`;
        return;
      }

      filtered.forEach(doc => {
        const d     = doc.data();
        const isPub = d.visibility === "public";
        const count = Math.max(0, d.memberCount || 0);

        const row = mk("div", "display:flex;align-items:center;padding:7px 9px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.15s;");
        row.className = isPub ? "cc-row-pub" : "cc-row-priv";

        const info = mk("div", "flex:1;overflow:hidden;min-width:0;");
        const nameEl = mk("div", "font-size:12px;font-weight:bold;color:#ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;");
        nameEl.textContent = d.name;

        const tags = mk("div", "display:flex;align-items:center;gap:5px;margin-top:3px;");
        const visTag = mk("span", `font-size:9px;padding:1px 5px;border-radius:3px;background:${isPub ? "rgba(28,52,100,0.75)" : "rgba(80,48,12,0.75)"};color:${isPub ? "rgba(150,190,255,0.9)" : "rgba(220,165,70,0.9)"};border:1px solid ${isPub ? "rgba(70,110,220,0.28)" : "rgba(170,110,22,0.28)"};`);
        visTag.textContent = isPub ? "Public" : "Private";

        const memEl = mk("span", "font-size:9px;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:3px;");
        const dot = mk("span", `display:inline-block;width:5px;height:5px;border-radius:50%;background:${count > 0 ? "rgba(80,200,120,0.85)" : "rgba(150,150,150,0.4)"};`);
        memEl.append(dot, document.createTextNode(count + " online"));
        tags.append(visTag, memEl);
        info.append(nameEl, tags);

        const enterBtn = mkBtn("Enter →", "cc-btn cc-sm", "margin-left:8px;flex-shrink:0;");
        enterBtn.onclick = e => { e.stopPropagation(); handleEnter(doc.id, d); };

        row.append(info, enterBtn);
        row.onclick = () => handleEnter(doc.id, d);
        list.appendChild(row);
      });
    }

    searchIn.addEventListener("input", renderRooms);

    unsubParties = db.collection("parties")
      .orderBy("createdAt", "desc")
      .onSnapshot(snap => {
        allDocs = [];
        snap.forEach(doc => allDocs.push(doc));
        allDocs.sort((a, b) => (b.data().pinned ? 1 : 0) - (a.data().pinned ? 1 : 0));
        allDocs.forEach(doc => evaluateAutoDelete(doc.id, doc.data()));
        renderRooms();
      }, err => console.error("Party list err:", err));
  }

  // ── ENTER ─────────────────────────────────────────────────────────────────
  function handleEnter(partyId, data) {
    if (data.visibility === "public") {
      joinParty(partyId, data);
    } else {
      showCodePopup(partyId, data);
    }
  }

  function showCodePopup(partyId, data) {
    const overlay = mk("div");
    overlay.className = "cc-popup-wrap";
    const popup = mk("div");
    popup.className = "cc-popup";

    const title = mk("div", "font-size:11px;font-weight:bold;color:#ccc;margin-bottom:2px;");
    title.textContent = "🔒 Enter Code";
    const sub = mk("div", "font-size:10px;color:rgba(255,255,255,0.45);margin-bottom:10px;");
    sub.textContent = data.name;

    const codeIn = document.createElement("input");
    codeIn.type        = "text";
    codeIn.maxLength   = 4;
    codeIn.placeholder = "XXXX";
    codeIn.className   = "cc-input";
    codeIn.style.cssText += "width:100%;text-align:center;letter-spacing:6px;font-size:17px;font-weight:bold;text-transform:uppercase;margin-bottom:8px;";
    stopInput(codeIn);

    const errEl = mk("div", "font-size:9px;color:#b44;min-height:12px;margin-bottom:6px;");
    const btnRow = mk("div", "display:flex;gap:5px;");
    const cancelBtn = mkBtn("Cancel", "cc-btn", "flex:1;");
    cancelBtn.onclick = () => overlay.remove();
    const joinBtn = mkBtn("Join", "cc-btn cc-act", "flex:1;");
    btnRow.append(cancelBtn, joinBtn);
    popup.append(title, sub, codeIn, errEl, btnRow);
    overlay.appendChild(popup);
    chatContent.appendChild(overlay);
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    setTimeout(() => codeIn.focus(), 40);

    function tryJoin() {
      const v = codeIn.value.toUpperCase().trim();
      if (!v) return;
      if (v === (data.code || "").toUpperCase()) {
        overlay.remove();
        joinParty(partyId, data);
      } else {
        errEl.textContent = "Wrong code.";
        popup.classList.add("cc-perr", "cc-shake");
        codeIn.value = "";
        setTimeout(() => {
          popup.classList.remove("cc-shake");
          setTimeout(() => { popup.classList.remove("cc-perr"); errEl.textContent = ""; }, 400);
        }, 380);
      }
    }
    joinBtn.onclick = tryJoin;
    codeIn.addEventListener("keydown", e => {
      e.stopPropagation();
      if (e.key === "Enter") tryJoin();
    });
  }

  async function joinParty(partyId, data) {
    clearSubs();
    currentParty = { id: partyId, ...data };
    cancelDelete(partyId);
    await adjustMemberCount(partyId, 1);
    renderChat();
  }

  async function leaveParty() {
    if (!currentParty) { renderList(); return; }
    const id = currentParty.id;
    await adjustMemberCount(id, -1);
    clearSubs();
    currentParty = null;
    renderList();
  }

  // ── CREATE VIEW ───────────────────────────────────────────────────────────
  function renderCreate() {
    clearSubs();
    chatContent.innerHTML = "";

    const wrap = mk("div", "padding:7px 9px;display:flex;flex-direction:column;height:100%;");
    const headerRow = mk("div", "display:flex;align-items:center;margin-bottom:10px;position:relative;");
    const bk = mkBtn("← Back", "cc-btn cc-sm", "flex-shrink:0;");
    bk.onclick = renderList;

    const titleEl = mk("div", "position:absolute;left:50%;transform:translateX(-50%);font-size:12px;font-weight:bold;color:#ddd;white-space:nowrap;");
    titleEl.textContent = "Create Party";
    headerRow.append(bk, titleEl);
    wrap.appendChild(headerRow);

    wrap.appendChild(mkLbl("Party Name"));
    const nameIn = document.createElement("input");
    nameIn.type        = "text";
    nameIn.maxLength   = 28;
    nameIn.placeholder = "Enter name…";
    nameIn.className   = "cc-input";
    nameIn.style.cssText += "width:100%;margin-bottom:8px;display:block;";
    stopInput(nameIn);
    wrap.appendChild(nameIn);

    wrap.appendChild(mkLbl("Visibility"));
    const visRow = mk("div", "display:flex;gap:5px;margin-bottom:8px;");
    let isPrivate = false;
    const pubBtn  = mkTgl("🌐 Public",  true);
    const privBtn = mkTgl("🔒 Private", false);
    visRow.append(pubBtn, privBtn);
    wrap.appendChild(visRow);

    const codeBox = mk("div", "background:rgba(50,32,10,0.5);border:1px solid rgba(255,255,255,0.12);border-radius:5px;padding:7px 8px;margin-bottom:8px;text-align:center;display:none;");
    const codeLbl = mk("div", "font-size:9px;color:rgba(255,255,255,0.5);margin-bottom:3px;");
    codeLbl.textContent = "Party Code — share with friends";
    const codeVal = mk("div", "font-size:20px;font-weight:bold;color:#ccc;letter-spacing:10px;");
    codeVal.textContent = "····";
    codeBox.append(codeLbl, codeVal);
    wrap.appendChild(codeBox);

    let generatedCode = "";

    pubBtn.onclick = () => {
      isPrivate = false; setTgl(pubBtn, true); setTgl(privBtn, false);
      codeBox.style.display = "none";
    };
    privBtn.onclick = async () => {
      isPrivate = true; setTgl(privBtn, true); setTgl(pubBtn, false);
      codeBox.style.display = "block";
      codeVal.textContent = "····";
      generatedCode = await genCode();
      codeVal.textContent = generatedCode;
    };

    const createBtn = mkBtn("Create Party", "cc-btn cc-act", "width:100%;");
    createBtn.onclick = async () => {
      const name = nameIn.value.trim();
      if (!name) {
        nameIn.classList.add("cc-err");
        nameIn.focus();
        setTimeout(() => nameIn.classList.remove("cc-err"), 1400);
        return;
      }
      if (isPrivate && !generatedCode) {
        generatedCode = await genCode();
        codeVal.textContent = generatedCode;
      }
      createBtn.disabled    = true;
      createBtn.textContent = "Creating…";
      try {
        const data = {
          name,
          visibility:  isPrivate ? "private" : "public",
          code:        isPrivate ? generatedCode : null,
          pinned:      false,
          memberCount: 0,
          createdAt:   firebase.firestore.FieldValue.serverTimestamp()
        };
        const ref = await db.collection("parties").add(data);
        currentParty = { id: ref.id, ...data };
        await adjustMemberCount(ref.id, 1);
        renderChat();
      } catch(e) {
        console.error("Create party failed:", e);
        createBtn.disabled    = false;
        createBtn.textContent = "Create Party";
      }
    };

    wrap.appendChild(createBtn);
    chatContent.appendChild(wrap);
    setTimeout(() => nameIn.focus(), 50);
  }

  async function genCode() {
    const ch = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code, dup;
    do {
      code = Array.from({length:4}, () => ch[Math.floor(Math.random()*ch.length)]).join("");
      const s = await db.collection("parties").where("code","==",code).get();
      dup = !s.empty;
    } while (dup);
    return code;
  }

  // ── CHAT VIEW ─────────────────────────────────────────────────────────────
  function renderChat() {
    clearSubs();
    if (!currentParty) { renderList(); return; }
    chatContent.innerHTML = "";

    const outer = mk("div", "display:flex;flex-direction:column;");
    chatContent.appendChild(outer);

    const hdr = mk("div", "position:relative;display:flex;align-items:center;padding:5px 8px;background:rgba(0,0,0,0.28);border-bottom:1px solid rgba(255,255,255,0.08);min-height:32px;");
    const bk = mkBtn("← Back", "cc-btn cc-sm", "flex-shrink:0;position:relative;z-index:1;");
    bk.onclick = leaveParty;
    hdr.appendChild(bk);

    const center = mk("div", "position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;padding:0 70px;");
    const pName = mk("div", "font-size:11px;font-weight:bold;color:#ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;text-align:center;");
    pName.textContent = currentParty.name;
    pName.title = currentParty.name;
    center.appendChild(pName);

    if (currentParty.visibility === "private") {
      const tag = mk("span", "font-size:8px;padding:1px 5px;border-radius:3px;letter-spacing:2px;font-weight:bold;background:rgba(65,42,12,0.65);color:rgba(210,158,65,0.9);border:1px solid rgba(170,110,22,0.3);margin-top:2px;pointer-events:auto;");
      tag.textContent = currentParty.code;
      center.appendChild(tag);
    }
    hdr.appendChild(center);

    const onlineEl = mk("div", "margin-left:auto;display:flex;align-items:center;gap:4px;flex-shrink:0;position:relative;z-index:1;");
    const onlineDot = mk("span", "display:inline-block;width:5px;height:5px;border-radius:50%;background:rgba(80,200,120,0.85);flex-shrink:0;");
    const onlineTxt = mk("span", "font-size:9px;color:rgba(255,255,255,0.5);white-space:nowrap;");
    onlineTxt.textContent = "… online";
    onlineEl.append(onlineDot, onlineTxt);
    hdr.appendChild(onlineEl);

    const onlineUnsub = db.collection("parties").doc(currentParty.id)
      .onSnapshot(snap => {
        if (!snap.exists) return;
        const count = Math.max(0, snap.data().memberCount || 0);
        onlineTxt.textContent = count + " online";
        onlineDot.style.background = count > 0 ? "rgba(80,200,120,0.85)" : "rgba(150,150,150,0.4)";
      }, () => {});

    const origClearSubs = clearSubs;
    clearSubs = () => { onlineUnsub(); clearSubs = origClearSubs; origClearSubs(); };

    outer.appendChild(hdr);

    const msgs = mk("div", "display:flex;flex-direction:column-reverse;gap:3px;overflow-y:auto;padding:6px 8px;max-height:185px;min-height:40px;");
    msgs.className = "cc-scroll";
    outer.appendChild(msgs);

    const iRow = mk("div", "display:flex;gap:5px;padding:5px 7px;border-top:1px solid rgba(255,255,255,0.08);");
    const mIn = document.createElement("input");
    mIn.type        = "text";
    mIn.maxLength   = 220;
    mIn.placeholder = "Message…";
    mIn.className   = "cc-input";
    mIn.style.flex  = "1";
    stopInput(mIn);
    const sBtn = mkBtn("→", "cc-btn", "padding:4px 10px;font-size:14px;flex-shrink:0;");
    iRow.append(mIn, sBtn);
    outer.appendChild(iRow);

    const MSG_CAP = 500;

    async function send() {
      const t = mIn.value.trim();
      if (!t || !currentParty) return;
      mIn.value = "";
      try {
        const msgsRef = db.collection("parties").doc(currentParty.id).collection("messages");
        await msgsRef.add({
          text:      t,
          sender:    myUsername,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        enforceMessageCap(msgsRef);
      } catch(e) { console.error("send msg:", e); }
    }

    async function enforceMessageCap(msgsRef) {
      try {
        const countSnap = await msgsRef.orderBy("timestamp", "asc").get();
        if (countSnap.size <= MSG_CAP) return;
        const excess = countSnap.size - MSG_CAP;
        const batch = db.batch();
        countSnap.docs.slice(0, excess).forEach(d => batch.delete(d.ref));
        await batch.commit();
      } catch(e) { console.warn("enforceMessageCap:", e); }
    }

    sBtn.onclick = send;
    mIn.addEventListener("keydown", e => {
      e.stopPropagation();
      if (e.key === "Enter") { e.preventDefault(); send(); }
    });

    unsubMsgs = db.collection("parties").doc(currentParty.id)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(80)
      .onSnapshot(snap => {
        msgs.innerHTML = "";
        if (snap.empty) {
          const h = mk("div", "color:rgba(255,255,255,0.22);font-size:10px;text-align:center;padding:12px;");
          h.textContent = "No messages yet. Say hi!";
          msgs.appendChild(h);
          return;
        }
        snap.forEach(doc => {
          const d    = doc.data();
          const isMe = d.sender === myUsername;
          const row = mk("div", `display:flex;justify-content:${isMe ? "flex-end" : "flex-start"};width:100%;`);
          const bub = mk("div", "max-width:80%;padding:6px 9px;font-size:11px;word-break:break-word;");
          bub.className = isMe ? "cc-bub-me" : "cc-bub-other";
          if (!isMe) {
            const sndr = mk("div", "font-size:9px;margin-bottom:3px;font-weight:bold;color:rgba(180,180,180,0.6);");
            sndr.textContent = d.sender;
            bub.appendChild(sndr);
          }
          const txt = mk("div", `color:${isMe ? "rgba(230,240,255,0.95)" : "rgba(220,220,220,0.92)"};line-height:1.4;`);
          txt.textContent = d.text;
          bub.appendChild(txt);
          row.appendChild(bub);
          msgs.appendChild(row);
        });
      }, e => console.error("msgs sub:", e));

    setTimeout(() => mIn.focus(), 50);
  }

  // ── TAB CLOSE ─────────────────────────────────────────────────────────────
  window.addEventListener("beforeunload", () => {
    releaseOnUnload(myUsername);
    if (currentParty) decrementOnUnload(currentParty.id);
  });

  // ── USERNAME EDIT ─────────────────────────────────────────────────────────
  function showUsernameEdit(badgeEl) {
    const overlay = mk("div");
    overlay.className = "cc-popup-wrap";
    const popup = mk("div");
    popup.className = "cc-popup";
    popup.style.cssText += "width:185px;text-align:left;";

    const title = mk("div", "font-size:11px;font-weight:bold;color:#ccc;margin-bottom:8px;text-align:center;");
    title.textContent = "Change Username";

    const inp = document.createElement("input");
    inp.type        = "text";
    inp.maxLength   = 28;
    inp.value       = myUsername;
    inp.className   = "cc-input";
    inp.style.cssText += "width:100%;margin-bottom:6px;";
    stopInput(inp);

    const errEl = mk("div", "font-size:9px;color:#b44;min-height:12px;margin-bottom:6px;");
    const btnRow = mk("div", "display:flex;gap:5px;");
    const cancelBtn = mkBtn("Cancel", "cc-btn", "flex:1;");
    cancelBtn.onclick = () => overlay.remove();
    const saveBtn = mkBtn("Save", "cc-btn cc-act", "flex:1;");

    async function trySave() {
      const val = inp.value.trim();
      if (!val || val.length < 2) { errEl.textContent = "Min 2 characters."; return; }
      if (val === myUsername) { overlay.remove(); return; }

      saveBtn.disabled    = true;
      saveBtn.textContent = "Checking…";
      errEl.textContent   = "";

      const claimed = await claimUsername(val);
      if (!claimed) {
        saveBtn.disabled    = false;
        saveBtn.textContent = "Save";
        errEl.textContent   = "Username taken.";
        popup.classList.add("cc-perr", "cc-shake");
        setTimeout(() => {
          popup.classList.remove("cc-shake");
          setTimeout(() => popup.classList.remove("cc-perr"), 400);
        }, 380);
        return;
      }

      const oldUsername = myUsername;
      myUsername = val;
      localStorage.setItem("cc_chat_username", myUsername);
      sessionStorage.setItem("cc_session_username", myUsername);
      badgeEl.textContent = myUsername;
      overlay.remove();
      releaseUsername(oldUsername);
    }

    saveBtn.onclick = trySave;
    inp.addEventListener("keydown", e => {
      e.stopPropagation();
      if (e.key === "Enter") trySave();
      if (e.key === "Escape") overlay.remove();
    });

    btnRow.append(cancelBtn, saveBtn);
    popup.append(title, inp, errEl, btnRow);
    overlay.appendChild(popup);
    chatContent.appendChild(overlay);
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    setTimeout(() => { inp.focus(); inp.select(); }, 40);
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function mk(tag, css) {
    const el = document.createElement(tag);
    if (css) el.style.cssText = css;
    return el;
  }
  function mkBtn(label, cls, css) {
    const b = document.createElement("button");
    b.textContent = label; b.className = cls;
    if (css) b.style.cssText += css;
    return b;
  }
  function mkLbl(t) {
    const d = mk("div"); d.className = "cc-lbl"; d.textContent = t; return d;
  }
  function mkTgl(label, on) {
    return mkBtn(label, "cc-btn cc-tgl" + (on ? " cc-on" : ""), "flex:1;");
  }
  function setTgl(btn, on) { btn.classList.toggle("cc-on", on); }

  // ── Boot ──────────────────────────────────────────────────────────────────
  initFirebase();
  console.log("✅ CC Chat — user:", myUsername);
})();