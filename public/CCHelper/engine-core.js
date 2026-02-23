(() => {
  if (window.__CASTLES_ENGINE_INJECTED__) return;
  window.__CASTLES_ENGINE_INJECTED__ = true;

  function onBodyReady(fn) {
    if (document.body) fn();
    else new MutationObserver((_, o) => {
      if (document.body) { o.disconnect(); fn(); }
    }).observe(document.documentElement, { childList: true });
  }
  window.__onBodyReady__ = onBodyReady;

  // ── CC HELPER THEME STYLES ──────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

:root {
  --cc-grass:   #5CC85B;
  --cc-grass2:  #3DA83C;
  --cc-grass3:  #2A7029;
  --cc-sun:     #FFD84D;
  --cc-orange:  #FF8C42;
  --cc-white:   #FAFFF8;
  --cc-dark:    #1C2B1A;
  --cc-mint:    #BCFFB8;
  --cc-panel:   rgba(28, 43, 26, 0.95);
}

@keyframes cc-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.5; transform:scale(1.4); }
}
@keyframes cc-sliderRoll {
  0%   { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}
@keyframes cc-fadeUp {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes cc-blockBob {
  0%,100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-3px) rotate(4deg); }
}

/* ── Menu shell ── */
.engine-menu {
  width: 290px;
  border-radius: 14px;
  overflow: visible;
  font-family: 'Nunito', sans-serif;
  color: var(--cc-white);
  background: var(--cc-panel);
  border: 2px solid var(--cc-grass2);
  box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(92,200,91,0.15);
  backdrop-filter: blur(12px);
  animation: cc-fadeUp 0.25s ease both;
}

/* ── Header ── */
.engine-header {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.45);
  padding: 9px 12px;
  border-radius: 12px 12px 0 0;
  border-bottom: 2px solid var(--cc-grass2);
  font-family: 'Fredoka One', cursive;
  font-size: 1rem;
  letter-spacing: 0.04em;
  color: var(--cc-white);
}
.engine-header-logo {
  width: 20px;
  height: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 1px;
  flex-shrink: 0;
  animation: cc-blockBob 3s ease-in-out infinite;
}
.engine-header-logo span { display: block; border-radius: 1px; }
.ehl-1 { background: #5CC85B; } .ehl-2 { background: #3DA83C; } .ehl-3 { background: #7ADA79; }
.ehl-4 { background: #A0724A; } .ehl-5 { background: #7A5535; } .ehl-6 { background: #C49060; }
.ehl-7 { background: #8FA3B1; } .ehl-8 { background: #6A8898; } .ehl-9 { background: #B0C4D0; }

.engine-header .version {
  font-family: 'Nunito', sans-serif;
  font-size: 9px;
  font-weight: 700;
  color: var(--cc-mint);
  background: rgba(92,200,91,0.15);
  border: 1px solid rgba(92,200,91,0.3);
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-left: 2px;
}
.engine-close {
  background: none;
  border: none;
  color: rgba(250,255,248,0.45);
  cursor: pointer;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
  line-height: 1;
}
.engine-close:hover { color: #ff6b6b; background: rgba(255,107,107,0.12); }

/* ── Content area ── */
.engine-content { padding: 10px; overflow: visible; }

/* ── Tab bar ── */
.tab-bar {
  position: relative;
  display: flex;
  background: rgba(0,0,0,0.45);
  border-top: 1px solid rgba(255,255,255,0.06);
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}
.tab-indicator {
  position: absolute;
  height: 100%;
  background: linear-gradient(135deg, rgba(92,200,91,0.28), rgba(61,168,60,0.18));
  border-top: 2px solid var(--cc-grass);
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
}
.tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  color: rgba(250,255,248,0.55);
  padding: 7px 0;
  cursor: pointer;
  z-index: 1;
  font-family: 'Nunito', sans-serif;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-right: 1px solid rgba(255,255,255,0.06);
  transition: color 0.2s;
}
.tab-btn:last-child { border-right: none; }
.tab-btn:hover { color: var(--cc-white); }

/* ── Generic engine button ── */
.engine-btn {
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--cc-white);
  padding: 7px 10px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  display: block;
  text-align: center;
  font-family: 'Nunito', sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  transition: background 0.2s, border-color 0.2s, transform 0.1s;
}
.engine-btn:hover {
  background: rgba(92,200,91,0.18);
  border-color: var(--cc-grass);
  transform: translateY(-1px);
}
.engine-btn:active { transform: scale(0.97); }
.engine-btn.enabled {
  background: rgba(61,168,60,0.25);
  border-color: var(--cc-grass);
  color: var(--cc-mint);
}
.engine-btn.disabled {
  background: rgba(120,0,0,0.3);
  border-color: rgba(255,80,80,0.3);
  color: #ff9999;
}

/* ── Floating toggle button ── */
.engine-toggle-btn {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 999999;
  background: var(--cc-panel);
  border: 2px solid var(--cc-grass2);
  color: var(--cc-white);
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Fredoka One', cursive;
  font-size: 13px;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 0 var(--cc-grass3), 0 6px 18px rgba(0,0,0,0.4);
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.engine-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 var(--cc-grass3), 0 10px 24px rgba(0,0,0,0.45);
}
.engine-toggle-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0 var(--cc-grass3), 0 4px 10px rgba(0,0,0,0.3);
}
.engine-toggle-dot {
  width: 7px;
  height: 7px;
  background: #4DFF91;
  border-radius: 50%;
  animation: cc-pulse 2s infinite;
  flex-shrink: 0;
}

/* ── Slider box ── */
.slider-box {
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.slider-box label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  color: rgba(250,255,248,0.72);
}
.slider-box label span { color: var(--cc-sun); }
.slider-box input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.12);
  border-radius: 4px;
  outline: none;
  border: 1px solid rgba(255,255,255,0.08);
}
.slider-box input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px; height: 15px;
  border-radius: 4px;
  background: var(--cc-grass);
  border: 2px solid var(--cc-grass3);
  cursor: pointer;
  box-shadow: 0 2px 0 rgba(0,0,0,0.4);
}
.slider-box input[type=range]::-moz-range-thumb {
  width: 15px; height: 15px;
  border-radius: 4px;
  background: var(--cc-grass);
  border: 2px solid var(--cc-grass3);
  cursor: pointer;
}
input.slider-rolling::-webkit-slider-runnable-track {
  height: 8px; border-radius: 4px;
  background: repeating-linear-gradient(45deg,#2A7029,#2A7029 8px,#3DA83C 8px,#3DA83C 16px);
  background-size: 200% 100%;
  animation: cc-sliderRoll 1s linear infinite;
}
input.slider-rolling::-moz-range-track {
  height: 8px; border-radius: 4px;
  background: repeating-linear-gradient(45deg,#2A7029,#2A7029 8px,#3DA83C 8px,#3DA83C 16px);
  background-size: 200% 100%;
  animation: cc-sliderRoll 1s linear infinite;
}

/* ── Toggle box ── */
.toggle-box-container {
  display: flex;
  justify-content: space-evenly;
  gap: 10px;
  margin-bottom: 8px;
}
.toggle-box-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(250,255,248,0.65);
  flex-wrap: nowrap;
}
.toggle-box {
  width: 16px; height: 16px;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.15s, background 0.15s;
}
.toggle-box:hover { border-color: var(--cc-grass); }
.toggle-box.active { background: rgba(92,200,91,0.25); border-color: var(--cc-grass); }
.toggle-box.active::after {
  content: "";
  width: 9px; height: 9px;
  background: var(--cc-grass);
  border-radius: 2px;
  position: absolute;
}

/* ── Button row ── */
.button-row { display: flex; gap: 8px; margin-bottom: 8px; }
.button-row .engine-btn { flex: 1; }

/* ── Section label pill ── */
.engine-section-label {
  font-family: 'Fredoka One', cursive;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cc-sun);
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,216,77,0.25);
  padding: 2px 10px;
  border-radius: 999px;
  display: inline-block;
  margin-bottom: 8px;
}

/* ── CE / inner boxes ── */
.ce-section { margin-bottom: 12px; }
.ce-section-title {
  color: var(--cc-mint);
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 6px;
  font-family: 'Fredoka One', cursive;
  letter-spacing: 0.05em;
}
.ce-input-row { display: flex; gap: 6px; margin-bottom: 6px; }
.ce-input {
  flex: 1;
  background: rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--cc-white);
  padding: 5px 8px;
  border-radius: 6px;
  font-family: 'Nunito', sans-serif;
  font-size: 11px;
  outline: none;
  transition: border-color 0.15s;
}
.ce-input:focus { border-color: var(--cc-grass); }
.ce-select {
  background: rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--cc-white);
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-family: 'Nunito', sans-serif;
}
.ce-results {
  background: transparent;
  border: none;
  max-height: 130px;
  overflow-y: auto;
  font-size: 11px;
}
.ce-result-item {
  padding: 3px 4px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 4px;
}
.ce-result-item:last-child { border-bottom: none; }
.ce-result-item:hover { background: rgba(92,200,91,0.06); }
.ce-result-addr { color: var(--cc-mint); font-size: 10px; font-family: monospace; }
.ce-result-value { color: #88aaff; font-size: 10px; font-family: monospace; }
.ce-btn-small {
  background: rgba(92,200,91,0.15);
  border: 1px solid rgba(92,200,91,0.3);
  color: var(--cc-mint);
  padding: 2px 7px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  transition: background 0.15s;
}
.ce-btn-small:hover { background: rgba(92,200,91,0.28); }
.ce-status { font-size: 10px; color: rgba(250,255,248,0.35); margin-top: 5px; }
.ce-frozen-item {
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.07);
  padding: 5px 8px;
  border-radius: 6px;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.ce-frozen-addr { color: var(--cc-orange); font-size: 10px; font-family: monospace; }
.ce-box {
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}
.ce-box-header {
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
  background: rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  color: rgba(250,255,248,0.65);
  letter-spacing: 0.04em;
  font-family: 'Nunito', sans-serif;
}
.ce-box-body { padding: 8px 10px; }
.ce-scan-mode {
  background: rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--cc-white);
  padding: 4px 7px;
  border-radius: 5px;
  font-size: 11px;
  font-family: 'Nunito', sans-serif;
  outline: none;
  flex-shrink: 0;
}

/* ── Notification toast ── */
.engine-notif {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(80px);
  background: var(--cc-dark);
  color: var(--cc-white);
  border: 2px solid var(--cc-grass2);
  border-radius: 10px;
  padding: 10px 20px;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 12px;
  z-index: 2000000;
  transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}
.engine-notif.show { transform: translateX(-50%) translateY(0); }
.engine-notif-dot {
  width: 7px; height: 7px;
  background: var(--cc-grass);
  border-radius: 50%;
  flex-shrink: 0;
}
  /* ── User count pill ── */
.engine-user-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Nunito', sans-serif;
  font-size: 8px;
  font-weight: 700;
  color: rgba(188,255,184,0.75);
  background: rgba(92,200,91,0.12);
  border: 1px solid rgba(92,200,91,0.2);
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  margin-left: auto;
}
.engine-user-count .euc-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #4DFF91;
  animation: cc-pulse 2s infinite;
  flex-shrink: 0;
}
`;
  (document.head || document.documentElement).appendChild(style);

  // ── Floating toggle button ────────────────────────────────────────────────
  const engineBtn = document.createElement("button");
  engineBtn.className = "engine-toggle-btn";
  engineBtn.innerHTML = `<span class="engine-toggle-dot"></span> CC Helper`;
  onBodyReady(() => document.body.appendChild(engineBtn));

  // ── Menu shell ────────────────────────────────────────────────────────────
  const menu = document.createElement("div");
  menu.className = "engine-menu";
  menu.style.cssText = "position:fixed;bottom:20px;left:20px;display:none;z-index:999999;";
  onBodyReady(() => document.body.appendChild(menu));
  

  // ── Header ────────────────────────────────────────────────────────────────
  const header = document.createElement("div");
  header.className = "engine-header";
  header.innerHTML = `
    <div class="engine-header-logo">
      <span class="ehl-1"></span><span class="ehl-2"></span><span class="ehl-3"></span>
      <span class="ehl-4"></span><span class="ehl-5"></span><span class="ehl-6"></span>
      <span class="ehl-7"></span><span class="ehl-8"></span><span class="ehl-9"></span>
    </div>
    <span>CC Helper</span>
  `;
  const userCountPill = document.createElement("span");
userCountPill.className = "engine-user-count";
userCountPill.id = "cc-user-count";
userCountPill.innerHTML = `<span class="euc-dot"></span><span class="euc-text">…</span>`;
header.appendChild(userCountPill);
window.__ccUserCountEl__ = userCountPill;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✖";
  closeBtn.className = "engine-close";
  header.appendChild(closeBtn);
  closeBtn.onclick = () => {
  menu.style.display = "none";
  engineBtn.style.display = "flex";
};
  menu.appendChild(header);

  // ── Content wrapper ───────────────────────────────────────────────────────
  const contentWrap = document.createElement("div");
  contentWrap.className = "engine-content";
  menu.appendChild(contentWrap);

  const content = {};
  window.__engineContent__ = content;
  window.__engineContentWrap__ = contentWrap;

  // ── Tab bar ───────────────────────────────────────────────────────────────
  const tabBar = document.createElement("div");
  tabBar.className = "tab-bar";
  menu.appendChild(tabBar);

  const indicator = document.createElement("div");
  indicator.className = "tab-indicator";
  tabBar.appendChild(indicator);

  const visibleTabs = ["Chat", "Prices", "Timer", "Craft", "Games"];
  window.__engineTabs__ = visibleTabs;

  function openTab(name) {
  const idx = visibleTabs.indexOf(name);
  if (idx === -1) return;
  Object.values(content).forEach((d) => (d.style.display = "none"));
  if (content[name]) {
    const flexTabs = ["Prices", "Craft"];
    content[name].style.display = flexTabs.includes(name) ? "flex" : "block";
  }
  indicator.style.transform = `translateX(${idx * 100}%)`;
}
  window.__openTab__ = openTab;

  function rebuildMainTabs() {
    while (tabBar.children.length > 1) tabBar.removeChild(tabBar.lastChild);
    visibleTabs.forEach((name) => {
      const b = document.createElement("button");
      b.textContent = name;
      b.className = "tab-btn";
      b.onclick = () => openTab(name);
      tabBar.appendChild(b);
    });
    indicator.style.width = `${100 / visibleTabs.length}%`;
  }
  rebuildMainTabs();

// ── Toggle open / close ───────────────────────────────────────────────────
engineBtn.onclick = () => {
  menu.style.display = "block";
  engineBtn.style.display = "none";
  // Open Chat tab by default if nothing is selected yet
  if (!window.__engineActiveTab__) {
    window.__engineActiveTab__ = true;
    openTab("Chat");
  }
};

  // ── Notification toast ────────────────────────────────────────────────────
  const notif = document.createElement("div");
  notif.className = "engine-notif";
  notif.innerHTML = `<span class="engine-notif-dot"></span> Engine Activated`;
  onBodyReady(() => {
  document.body.appendChild(notif);
  document.addEventListener("mousedown", (e) => {
    if (menu.style.display !== "none" && !menu.contains(e.target) && e.target !== engineBtn) {
      const focused = menu.querySelector("input:focus, textarea:focus, select:focus");
      if (focused) focused.blur();
    }
  });
  setTimeout(() => {
    notif.classList.add("show");
    setTimeout(() => notif.classList.remove("show"), 2200);
  }, 120);
});

  // ── Helper: createSliderBox (used by other engine modules) ────────────────
  function createSliderBox(name, min, max, step, defaultValue, onInput) {
    const box = document.createElement("div");
    box.className = "slider-box";
    const label = document.createElement("label");
    const nameSpan = document.createElement("span");
    nameSpan.style.color = "rgba(250,255,248,0.72)";
    nameSpan.textContent = name + ":";
    const valueDisplay = document.createElement("span");
    valueDisplay.textContent = defaultValue.toFixed(2);
    label.append(nameSpan, valueDisplay);
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min; slider.max = max; slider.step = step; slider.value = defaultValue;
    slider.oninput = () => {
      onInput(parseFloat(slider.value));
      valueDisplay.textContent = parseFloat(slider.value).toFixed(2);
    };
    box.append(label, slider);
    return { box, slider, valueDisplay };
  }

  // ── Active user presence ──────────────────────────────────────────────────
  function setupPresence() {
    const FIREBASE_API_KEY  = "AIzaSyBNcwFgoFyKUP3vm7eYSjDRvzzNsSnIABM";
    const FIRESTORE_PROJECT = "chat-7144e";

    // Always generate a fresh ID per tab — never reuse from sessionStorage
    const tabId = Math.random().toString(36).slice(2) + Date.now().toString(36);

    const COUNTER_REF_PATH = `presence/global`;
    const COMMIT_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents:commit?key=${FIREBASE_API_KEY}`;
    const DOC_PATH   = `projects/${FIRESTORE_PROJECT}/databases/(default)/documents/presence/global`;

    let joined = false;

    function waitForDb(cb) {
      if (window.__ccFirebaseDb__) { cb(window.__ccFirebaseDb__); return; }
      let attempts = 0;
      const t = setInterval(() => {
        attempts++;
        if (window.__ccFirebaseDb__) { clearInterval(t); cb(window.__ccFirebaseDb__); }
        else if (attempts > 60) { clearInterval(t); }
      }, 500);
    }

    waitForDb(async (db) => {
      // Ensure the counter doc exists before incrementing
      const ref = db.collection("presence").doc("global");
      try {
        const snap = await ref.get();
        if (!snap.exists) {
          await ref.set({ count: 0 });
        }
      } catch(e) { console.warn("Presence: init doc failed:", e); }

      // Increment — one per tab
      try {
        await ref.update({
          count: firebase.firestore.FieldValue.increment(1)
        });
        joined = true;
      } catch(e) { console.warn("Presence: join failed:", e); }

      // Listen to the counter and update the pill
      db.collection("presence").doc("global").onSnapshot(snap => {
        if (!snap.exists) return;
        const count = Math.max(0, snap.data().count || 0);
        const el = window.__ccUserCountEl__;
        if (el) el.querySelector('.euc-text').textContent = count + ' Active';
      }, () => {});
    });

    // On tab close — decrement via keepalive REST (same pattern as chat memberCount)
    window.addEventListener("beforeunload", () => {
      if (!joined) return;
      try {
        fetch(COMMIT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            writes: [{
              transform: {
                document: DOC_PATH,
                fieldTransforms: [{
                  fieldPath: "count",
                  increment: { integerValue: "-1" }
                }]
              }
            }]
          }),
          keepalive: true
        });
      } catch(_) {}
    });
  }

  setTimeout(setupPresence, 2000);
  window.__createSliderBox__ = createSliderBox;
})();