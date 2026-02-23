(() => {
    const content = window.__engineContent__;
    const contentWrap = window.__engineContentWrap__;

    if (!content || !contentWrap) {
        console.error("⏱ engine-timer: __engineContent__ not ready");
        return;
    }

    // Always use real (unscaled) timers — game speed must not affect clocks
    const REAL_SET_INTERVAL   = window.__REAL__?.setInterval  ?? setInterval.bind(window);
    const REAL_CLEAR_INTERVAL = window.__REAL__?.clearInterval ?? clearInterval.bind(window);

    // ── Timer Tab ──────────────────────────────────────────────────────────────
    const timerContent = document.createElement("div");
    timerContent.style.display = "none";
    contentWrap.appendChild(timerContent);
    content["Timer"] = timerContent;

    // ── Helpers ────────────────────────────────────────────────────────────────
    function formatTimeMs(totalMs) {
        totalMs = Math.max(0, totalMs);
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const ms      = Math.floor(totalMs % 1000);
        return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
    }

    // ── Timer state ────────────────────────────────────────────────────────────
    let penTimeMs   = 55 * 60000;
    let penInterval = null;
    let bellCount   = 3;   // ← default 3
    let running     = false;

    // ── Pen Timer Slider ───────────────────────────────────────────────────────
    const penSliderBox = document.createElement("div");
    penSliderBox.className = "slider-box";

    const penLabel = document.createElement("label");
    penLabel.innerHTML = `Pen Timer <span>${formatTimeMs(penTimeMs)}</span>`;
    const penValue = penLabel.querySelector("span");

    const penSlider = document.createElement("input");
    penSlider.type  = "range";
    penSlider.min   = 1;
    penSlider.max   = 59;
    penSlider.value = 55;

    penSlider.oninput = () => {
        if (running) return;
        penTimeMs = parseInt(penSlider.value) * 60000;
        penValue.textContent = formatTimeMs(penTimeMs);
    };

    penSliderBox.append(penLabel, penSlider);
    timerContent.appendChild(penSliderBox);

    // ── Bell selector + Start button row ──────────────────────────────────────
    const timerButtonRow = document.createElement("div");
    timerButtonRow.className = "button-row";
    timerContent.appendChild(timerButtonRow);

    const bellWrapper = document.createElement("div");
    bellWrapper.style.cssText = "display:flex;align-items:center;gap:6px;flex:0.5;";

    const bellIcon = document.createElement("span");
    bellIcon.textContent  = "🔔";
    bellIcon.style.fontSize = "14px";

    const bellSelect = document.createElement("select");
    bellSelect.style.cssText = "width:100%;color:white;border:none;border-radius:6px;padding:4px;background-color:#222;";

    for (let i = 1; i <= 10; i++) {
        const o = document.createElement("option");
        o.value       = i;
        o.textContent = ` ${i} `;
        o.style.color = "white";
        bellSelect.appendChild(o);
    }
    bellSelect.value    = 3;   // ← default 3
    bellSelect.onchange = () => (bellCount = parseInt(bellSelect.value));

    bellWrapper.append(bellIcon, bellSelect);
    timerButtonRow.appendChild(bellWrapper);

    const startBtn = document.createElement("button");
    startBtn.textContent = "Start";
    startBtn.className = "engine-btn enabled";
    startBtn.style.cssText = "flex:1;background:rgba(0,50,0,0.9);";
    timerButtonRow.appendChild(startBtn);

    // ── Bell sound (Web Audio API fallback so autoplay policy is not an issue) ─
    function createBellAudio() {
        // Try loading the OGG; fall back to a synthesised beep via Web Audio API
        const audio = new Audio();
        audio.src = "https://actions.google.com/sounds/v1/alarms/bell_ring.ogg";
        return audio;
    }

    // Synthesise a simple bell tone using Web Audio so it always works even when
    // the network asset is blocked / when browser autoplay restrictions fire.
    function playBeepFallback() {
        try {
            const ctx  = new (window.AudioContext || window.webkitAudioContext)();
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
            gain.gain.setValueAtTime(0.8, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) { /* silently ignore */ }
    }

    function playBells(count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const audio = createBellAudio();
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => playBeepFallback());
                }
            }, i * 600);
        }
    }

    // ── "Timer is up!" overlay popup ─────────────────────────────────────────
    // Inject keyframes + popup styles once
    (function injectTimerPopupStyles() {
        if (document.getElementById("engine-timer-popup-styles")) return;
        const style = document.createElement("style");
        style.id = "engine-timer-popup-styles";
        style.textContent = `
            @keyframes timerPopupIn {
                0%   { transform: translate(-50%, -60px) scale(0.85); opacity: 0; }
                60%  { transform: translate(-50%,  16px) scale(1.03); opacity: 1; }
                100% { transform: translate(-50%,   8px) scale(1);    opacity: 1; }
            }
            @keyframes timerPulseGlow {
                0%, 100% { box-shadow: 0 0 18px 4px rgba(255,60,60,0.55), 0 8px 32px rgba(0,0,0,0.7); }
                50%       { box-shadow: 0 0 36px 10px rgba(255,100,60,0.8), 0 8px 40px rgba(0,0,0,0.8); }
            }
            @keyframes timerIconBounce {
                0%, 100% { transform: scale(1) rotate(-8deg); }
                50%       { transform: scale(1.25) rotate(8deg); }
            }
            @keyframes timerShimmer {
                0%   { background-position: -200% center; }
                100% { background-position:  200% center; }
            }

            .engine-timer-alarm {
                position: fixed;
                top: 8px;
                left: 50%;
                transform: translate(-50%, 0);
                z-index: 999999;

                /* glass-dark card */
                background: linear-gradient(135deg,
                    rgba(30, 6, 6, 0.97) 0%,
                    rgba(60, 10, 10, 0.97) 50%,
                    rgba(30, 6, 6, 0.97) 100%);
                border: 1.5px solid rgba(255, 80, 60, 0.55);
                border-radius: 16px;
                padding: 18px 28px 18px 22px;
                min-width: 260px;
                max-width: 340px;

                display: flex;
                align-items: center;
                gap: 14px;

                animation:
                    timerPopupIn   0.45s cubic-bezier(0.34,1.56,0.64,1) forwards,
                    timerPulseGlow 1.8s  ease-in-out 0.45s infinite;

                /* subtle inner glow */
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
            }

            .engine-timer-alarm__icon {
                font-size: 28px;
                flex-shrink: 0;
                animation: timerIconBounce 0.8s ease-in-out 0.5s infinite;
                filter: drop-shadow(0 0 6px rgba(255,140,60,0.9));
            }

            .engine-timer-alarm__body {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .engine-timer-alarm__title {
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 16px;
                font-weight: 700;
                letter-spacing: 0.4px;
                color: transparent;
                background: linear-gradient(90deg,
                    #ff9060 0%, #ffcf80 40%, #ff6040 70%, #ffb060 100%);
                background-size: 200% auto;
                -webkit-background-clip: text;
                background-clip: text;
                animation: timerShimmer 2s linear 0.6s infinite;
                white-space: nowrap;
            }

            .engine-timer-alarm__sub {
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 11px;
                color: rgba(255,200,160,0.65);
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            .engine-timer-alarm__close {
                position: absolute;
                top: 8px;
                right: 10px;

                background: none;
                border: none;
                cursor: pointer;
                color: rgba(255,160,120,0.75);
                font-size: 16px;
                line-height: 1;
                padding: 2px 4px;
                border-radius: 4px;
                transition: color 0.15s, background 0.15s;
            }
            .engine-timer-alarm__close:hover {
                color: #fff;
                background: rgba(255,80,60,0.3);
            }

            /* Red progress bar along the bottom — purely decorative */
            .engine-timer-alarm__bar {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                width: 100%;
                border-radius: 0 0 16px 16px;
                background: linear-gradient(90deg, #ff4020, #ffaa40, #ff4020);
                background-size: 200% auto;
                animation: timerShimmer 1.4s linear infinite;
            }
        `;
        document.head.appendChild(style);
    })();

    function timerPopup() {
        // Remove any existing alarm popup first
        const existing = document.querySelector(".engine-timer-alarm");
        if (existing) existing.remove();

        const popup = document.createElement("div");
        popup.className = "engine-timer-alarm";

        // Close button
        const closeBtn = document.createElement("button");
        closeBtn.className = "engine-timer-alarm__close";
        closeBtn.innerHTML = "✕";
        closeBtn.title = "Dismiss";
        closeBtn.onclick = () => popup.remove();
        popup.appendChild(closeBtn);

        // Icon
        const icon = document.createElement("div");
        icon.className = "engine-timer-alarm__icon";
        icon.textContent = "⏰";
        popup.appendChild(icon);

        // Text body
        const body = document.createElement("div");
        body.className = "engine-timer-alarm__body";

        const title = document.createElement("div");
        title.className = "engine-timer-alarm__title";
        title.textContent = "Timer is up!";

        const sub = document.createElement("div");
        sub.className = "engine-timer-alarm__sub";
        sub.textContent = "Pen time has ended";

        body.append(title, sub);
        popup.appendChild(body);

        // Decorative bar
        const bar = document.createElement("div");
        bar.className = "engine-timer-alarm__bar";
        popup.appendChild(bar);

        document.body.appendChild(popup);
        // Does NOT auto-close — user must click ✕
    }

    // ── Start / Reset logic ────────────────────────────────────────────────────
    startBtn.onclick = () => {
        if (!running) {
            running = true;
            startBtn.textContent      = "Reset";
            startBtn.style.background = "rgba(50,0,0,0.9)";
            penSlider.disabled        = true;
            penSlider.classList.add("slider-rolling");

            let lastTick = Date.now();
            penInterval  = REAL_SET_INTERVAL(() => {
                const now   = Date.now();
                const delta = now - lastTick;
                lastTick    = now;
                penTimeMs  -= delta;

                penSlider.value      = Math.ceil(penTimeMs / 60000);
                penValue.textContent = formatTimeMs(penTimeMs);

                if (penTimeMs <= 0) {
                    REAL_CLEAR_INTERVAL(penInterval);
                    running = false;

                    timerPopup();
                    playBells(bellCount);

                    startBtn.textContent      = "Start";
                    startBtn.style.background = "rgba(0,50,0,0.9)";
                    penSlider.disabled        = false;
                    penSlider.classList.remove("slider-rolling");
                    penTimeMs            = 55 * 60000;
                    penSlider.value      = 55;
                    penValue.textContent = formatTimeMs(penTimeMs);
                }
            }, 50);
        } else {
            REAL_CLEAR_INTERVAL(penInterval);
            running               = false;
            penTimeMs             = 55 * 60000;
            penValue.textContent  = formatTimeMs(penTimeMs);
            penSlider.value       = 55;
            penSlider.disabled    = false;
            startBtn.textContent      = "Start";
            startBtn.style.background = "rgba(0,50,0,0.9)";
            penSlider.classList.remove("slider-rolling");
        }
    };

    // ── Stopwatch ──────────────────────────────────────────────────────────────
    const swBox = document.createElement("div");
    swBox.className = "slider-box";
    timerContent.appendChild(swBox);

    const swTitleLabel = document.createElement("label");
    swTitleLabel.style.cssText = "justify-content:center;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;opacity:0.6;";
    swTitleLabel.textContent = "Stopwatch";
    swBox.appendChild(swTitleLabel);

    const swDisplay = document.createElement("div");
    swDisplay.textContent = "0:00.000";
    Object.assign(swDisplay.style, {
        fontFamily:    "monospace",
        fontSize:      "22px",
        fontWeight:    "bold",
        textAlign:     "center",
        letterSpacing: "1px",
        padding:       "4px 0 6px",
        color:         "white",
    });
    swBox.appendChild(swDisplay);

    const swBtnRow = document.createElement("div");
    swBtnRow.className = "button-row";
    swBtnRow.style.marginBottom = "0";
    swBox.appendChild(swBtnRow);

    const swStartStopBtn = document.createElement("button");
    swStartStopBtn.textContent   = "Start";
    swStartStopBtn.className     = "engine-btn";
    swStartStopBtn.style.cssText = "flex:1;background:rgba(0,50,0,0.9);";

    const swResetBtn = document.createElement("button");
    swResetBtn.textContent   = "Reset";
    swResetBtn.className     = "engine-btn";
    swResetBtn.style.cssText = "flex:0.5;background:rgba(50,0,0,0.9);";

    swBtnRow.append(swStartStopBtn, swResetBtn);

    let swRunning   = false;
    let swElapsedMs = 0;
    let swLastTick  = null;
    let swInterval  = null;

    function swRender() {
        const m  = Math.floor(swElapsedMs / 60000);
        const s  = Math.floor((swElapsedMs % 60000) / 1000);
        const ms = Math.floor(swElapsedMs % 1000);
        swDisplay.textContent = `${m}:${s.toString().padStart(2,"0")}.${ms.toString().padStart(3,"0")}`;
    }

    swStartStopBtn.onclick = () => {
        if (!swRunning) {
            swRunning  = true;
            swLastTick = Date.now();
            swStartStopBtn.textContent    = "Stop";
            swStartStopBtn.style.background = "rgba(120,60,0,0.9)";
            swInterval = REAL_SET_INTERVAL(() => {
                const now   = Date.now();
                swElapsedMs += now - swLastTick;
                swLastTick   = now;
                swRender();
            }, 30);
        } else {
            swRunning = false;
            REAL_CLEAR_INTERVAL(swInterval);
            swInterval = null;
            swStartStopBtn.textContent    = "Start";
            swStartStopBtn.style.background = "rgba(0,50,0,0.9)";
        }
    };

    swResetBtn.onclick = () => {
        swRunning  = false;
        REAL_CLEAR_INTERVAL(swInterval);
        swInterval  = null;
        swElapsedMs = 0;
        swLastTick  = null;
        swStartStopBtn.textContent    = "Start";
        swStartStopBtn.style.background = "rgba(0,50,0,0.9)";
        swRender();
    };

    console.log("⏱ engine-timer loaded");
})();