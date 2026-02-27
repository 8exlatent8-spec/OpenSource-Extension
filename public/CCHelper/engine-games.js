(() => {
  const content = window.__engineContent__;
  const contentWrap = window.__engineContentWrap__;

  const FIREBASE_API_KEY = "AIzaSyBNcwFgoFyKUP3vm7eYSjDRvzzNsSnIABM";
  const FIRESTORE_PROJECT = "chat-7144e";

  const gamesContent = document.createElement("div");
  gamesContent.style.cssText =
    "display:none;position:relative;font-family:monospace;overflow:hidden;height:100%;";
  contentWrap.appendChild(gamesContent);
  content["Games"] = gamesContent;

  function getUser() {
    return (
      sessionStorage.getItem("cc_session_username") ||
      localStorage.getItem("cc_chat_username") ||
      "Player" + Math.floor(Math.random() * 9999)
    );
  }

  const ST = document.createElement("style");
  ST.textContent = `
    @keyframes gcShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
    @keyframes gcPop   { 0%{transform:scale(0.85);opacity:0} 100%{transform:scale(1);opacity:1} }
    @keyframes diceRoll{ 0%{transform:rotate(0deg) scale(1)} 25%{transform:rotate(-15deg) scale(0.9)} 75%{transform:rotate(12deg) scale(1.1)} 100%{transform:rotate(0deg) scale(1)} }
    @keyframes diceLand{ 0%{transform:translateY(-8px) scale(1.15);opacity:0.7} 100%{transform:translateY(0) scale(1);opacity:1} }
    @keyframes scoreFlash{ 0%{background:rgba(212,175,55,0.4)} 100%{background:transparent} }
    .gc-shake { animation:gcShake 0.38s ease; }
    .gc-scroll::-webkit-scrollbar       { width:3px; }
    .gc-scroll::-webkit-scrollbar-track { background:rgba(255,255,255,0.05); }
    .gc-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.2);border-radius:2px; }
    .gc-input {
      background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.18);
      color:#e0e0e0;border-radius:5px;font-family:monospace;
      padding:5px 8px;font-size:11px;outline:none;
      transition:border-color 0.2s;box-sizing:border-box;
    }
    .gc-input:focus { border-color:rgba(255,255,255,0.42); }
    .gc-input.gc-err { border-color:#922 !important; }
    .gc-btn {
      background:rgba(0,0,0,0.55);border:1px solid rgba(255,255,255,0.15);
      color:#c0c0c0;border-radius:5px;padding:5px 10px;cursor:pointer;
      font-family:monospace;font-size:11px;
      transition:background 0.15s,border-color 0.15s,color 0.15s;
    }
    .gc-btn:hover  { background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.28);color:#eee; }
    .gc-btn.gc-act { background:rgba(35,55,35,0.85);border-color:rgba(255,255,255,0.22);color:#ddd; }
    .gc-btn.gc-sm  { padding:3px 8px;font-size:10px; }
    .gc-btn.gc-danger { background:rgba(80,20,20,0.75);border-color:rgba(180,60,60,0.4);color:#f88; }
    .gc-btn.gc-danger:hover { background:rgba(110,30,30,0.85);color:#faa; }
    .gc-tgl     { background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.13);color:#888; }
    .gc-tgl.gc-on { background:rgba(35,50,35,0.9);border-color:rgba(255,255,255,0.22);color:#ccc; }
    .gc-lbl { font-size:10px;color:rgba(255,255,255,0.65);margin-bottom:3px;letter-spacing:0.3px;font-weight:bold; }
    .gc-row-pub  { background:rgba(22,38,62,0.6); }
    .gc-row-game { background:rgba(30,22,50,0.6); }
    .gc-row-pub:hover  { background:rgba(32,54,88,0.78); }
    .gc-row-game:hover { background:rgba(50,36,75,0.78); }
    .gc-popup-wrap {
  position:fixed;inset:0;background:rgba(0,0,0,0.78);
  display:flex;align-items:center;justify-content:center;
  z-index:10010;
}
    .gc-popup {
      background:rgba(14,14,14,0.97);border:1px solid rgba(255,255,255,0.15);
      border-radius:8px;padding:14px 12px;width:168px;
      text-align:center;color:#ccc;font-family:monospace;
      box-shadow:0 6px 28px rgba(0,0,0,0.75);
      animation:gcPop 0.18s ease;
    }
    .gc-popup.gc-perr { border-color:#7a1a1a !important; }
    .gc-board {
      display:grid;grid-template-columns:repeat(8,1fr);
      width:100%;max-width:260px;aspect-ratio:1;
      border:2px solid rgba(255,255,255,0.15);border-radius:4px;overflow:hidden;
      box-shadow:0 4px 20px rgba(0,0,0,0.5);
    }
    .gc-sq { position:relative;overflow:hidden;box-sizing:border-box;cursor:pointer;transition:background 0.1s;user-select:none;min-width:0;min-height:0; }
    .gc-sq.light { background:#c8b89a; } .gc-sq.dark  { background:#7c5c3a; }
    .gc-sq.selected   { background:#f6f669 !important; }
    .gc-sq.valid-move { background:#80c26b !important; }
    .gc-sq.capturable { background:rgba(180,30,30,0.85) !important; }
    .gc-sq.last-from  { background:#e6d44a !important; }
    .gc-sq.last-to    { background:#e6d44a !important; }
    .gc-sq.in-check   { background:#d44 !important; }
    .gc-sq.valid-move::after { content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:30%;height:30%;border-radius:50%;background:rgba(0,0,0,0.2);pointer-events:none; }
    .gc-sq.capturable::after { display:none; }
    .gc-piece { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:clamp(14px,3.5vw,24px);line-height:1;pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,0.6); }
    .gc-piece.white { color:#fff;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.8)); }
    .gc-piece.black { color:#1a1008;filter:drop-shadow(0 1px 1px rgba(255,255,255,0.15)); }
    .gc-coord-row { display:flex;width:100%;max-width:260px;justify-content:space-between;padding:0 2px;margin-top:1px; }
    .gc-coord { font-size:8px;color:rgba(255,255,255,0.35);width:12.5%;text-align:center; }
    .gc-player-bar { display:flex;align-items:center;gap:6px;width:100%;max-width:260px;padding:4px 6px;border-radius:4px;font-size:10px;color:#ccc;margin:2px 0;box-sizing:border-box; }
    .gc-player-bar.active { background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12); }
    .gc-player-bar.inactive { background:rgba(0,0,0,0.2); }
    .gc-player-dot { width:6px;height:6px;border-radius:50%;flex-shrink:0; }
    .gc-player-name { flex:1;font-weight:bold;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
    .gc-player-color { font-size:8px;opacity:0.6;flex-shrink:0; }
    .gc-status { font-size:10px;text-align:center;padding:3px 8px;border-radius:4px;margin:2px 0;width:100%;max-width:260px;box-sizing:border-box; }
    .gc-status.playing  { color:rgba(255,255,255,0.55);background:transparent; }
    .gc-status.check    { color:#f8a;background:rgba(180,40,40,0.25);border:1px solid rgba(180,40,40,0.3); }
    .gc-status.waiting  { color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.04); }
    .gc-status.finished { color:#ffd;background:rgba(80,70,30,0.35);border:1px solid rgba(200,160,40,0.3); }
    .gc-spectator-bar { display:flex;align-items:center;justify-content:center;gap:6px;width:100%;max-width:260px;padding:4px 8px;border-radius:4px;font-size:10px;color:rgba(255,255,255,0.5);margin:2px 0;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);box-sizing:border-box; }
    .gc-spectator-count { font-size:9px;color:rgba(255,255,255,0.3); }
    .gc-promo-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:8px; }
    .gc-promo-opt { aspect-ratio:1;font-size:22px;display:flex;align-items:center;justify-content:center;border-radius:5px;cursor:pointer;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.12);transition:background 0.15s,border-color 0.15s; }
    .gc-promo-opt:hover { background:rgba(255,255,255,0.28);border-color:rgba(255,255,255,0.4); }
    .gc-promo-opt.black-piece { background:#c8b89a;border-color:rgba(0,0,0,0.25); }
    .gc-promo-opt.black-piece:hover { background:#ddd0b8; }
    .gc-gameover { position:absolute;inset:0;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;z-index:200;border-radius:4px; }
    .gc-gameover-box { background:rgba(14,14,14,0.97);border:1px solid rgba(255,255,255,0.18);border-radius:8px;padding:16px 14px;text-align:center;color:#ccc;font-family:monospace;animation:gcPop 0.22s ease; }
    @keyframes yhSlideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes yhSlideDown { from{transform:translateY(0);opacity:1} to{transform:translateY(100%);opacity:0} }
    .yh-game { display:flex;flex-direction:column;height:100%;background:linear-gradient(170deg,#0e1a10 0%,#081008 100%);position:relative;overflow:hidden; }
    .yh-scorebar { display:flex;align-items:stretch;flex-shrink:0;border-bottom:1px solid rgba(212,175,55,0.2); }
    .yh-scorebar-half { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px 4px 5px;gap:1px;min-width:0;transition:background 0.25s; }
    .yh-scorebar-half.active { background:rgba(212,175,55,0.1);border-bottom:2px solid #d4af37; }
    .yh-scorebar-half.inactive { border-bottom:2px solid transparent; }
    .yh-scorebar-div { width:1px;background:rgba(255,255,255,0.1);flex-shrink:0; }
    .yh-sb-name { font-size:9px;color:rgba(255,255,255,0.55);font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;text-align:center; }
    .yh-sb-score { font-size:20px;font-weight:bold;color:#d4af37;line-height:1; }
    .yh-sb-you { font-size:7px;color:rgba(100,220,120,0.7);letter-spacing:1px; }
    .yh-dice-area { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px; }
    .yh-dice-row { display:flex;gap:8px;justify-content:center; }
    .yh-die { width:44px;height:44px;border-radius:8px;background:linear-gradient(145deg,#f5f0e8,#ddd4b8);border:2px solid rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;box-shadow:2px 3px 8px rgba(0,0,0,0.6),inset 0 1px 2px rgba(255,255,255,0.9);transition:transform 0.15s,box-shadow 0.15s,filter 0.15s;position:relative;flex-shrink:0; }
    .yh-die:active:not(.yh-die-inactive) { transform:scale(0.93); }
    .yh-die.yh-die-held { background:linear-gradient(145deg,#c8e8c8,#9ccc9c);border-color:rgba(50,160,80,0.8);box-shadow:2px 3px 8px rgba(0,0,0,0.4),inset 0 1px 2px rgba(255,255,255,0.7),0 0 10px rgba(60,180,80,0.5); }
    .yh-die.yh-die-rolling { animation:diceRoll 0.35s ease; }
    .yh-die.yh-die-inactive { cursor:default;opacity:0.45;filter:grayscale(0.3); }
    .yh-die-dot { position:absolute;width:6px;height:6px;border-radius:50%;background:#1a0e08; }
    .yh-die-lock { position:absolute;bottom:2px;right:3px;font-size:7px;line-height:1;opacity:0.7;pointer-events:none; }
    .yh-roll-area { display:flex;flex-direction:column;align-items:center;gap:4px; }
    .yh-roll-btn { padding:8px 28px;border-radius:20px;border:none;cursor:pointer;font-family:monospace;font-size:12px;font-weight:bold;letter-spacing:0.5px;background:linear-gradient(135deg,#b00000,#e02030);color:#fff;box-shadow:0 4px 14px rgba(180,0,0,0.5),inset 0 1px rgba(255,255,255,0.2);transition:all 0.15s; }
    .yh-roll-btn:hover:not(:disabled) { background:linear-gradient(135deg,#c50,#e83040);transform:translateY(-1px); }
    .yh-roll-btn:active:not(:disabled) { transform:translateY(1px);box-shadow:0 2px 6px rgba(180,0,0,0.4); }
    .yh-roll-btn:disabled { opacity:0.35;cursor:not-allowed;transform:none;box-shadow:none; }
    .yh-pip-dots { display:flex;gap:4px; }
    .yh-pip { width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.2);transition:background 0.2s; }
    .yh-pip.used { background:#d4af37; }
    .yh-status-txt { font-size:10px;color:rgba(255,255,255,0.4);text-align:center;padding:0 8px;min-height:14px; }
    .yh-status-txt.myturn { color:rgba(212,175,55,0.8); }
    .yh-tray-btn { flex-shrink:0;margin:0 12px 8px;padding:7px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);cursor:pointer;font-family:monospace;font-size:10px;text-align:center;transition:background 0.15s,border-color 0.15s; }
    .yh-tray-btn:hover { background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.25); }
    .yh-tray-btn.highlight { background:rgba(212,175,55,0.12);border-color:rgba(212,175,55,0.45);color:#d4af37; }
    .yh-tray-overlay { position:absolute;inset:0;background:rgba(0,0,0,0.55);z-index:50;display:flex;align-items:flex-end; }
    .yh-tray { width:100%;background:rgba(12,22,14,0.98);border-top:1px solid rgba(212,175,55,0.25);border-radius:12px 12px 0 0;padding:0 0 6px;animation:yhSlideUp 0.22s ease;max-height:78%;display:flex;flex-direction:column; }
    .yh-tray-handle { display:flex;align-items:center;justify-content:center;padding:8px 12px 4px;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0;cursor:pointer; }
    .yh-tray-handle-bar { width:32px;height:3px;border-radius:2px;background:rgba(255,255,255,0.2); }
    .yh-tray-title { font-size:10px;color:rgba(212,175,55,0.7);font-weight:bold;letter-spacing:1px;text-transform:uppercase;margin-right:8px; }
    .yh-tray-scroll { overflow-y:auto;flex:1; }
    .yh-tray-scroll::-webkit-scrollbar { width:2px; }
    .yh-tray-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15);border-radius:2px; }
    .yh-tray-section { font-size:8px;color:rgba(212,175,55,0.5);padding:4px 10px 2px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.05); }
    .yh-tray-row { display:flex;align-items:center;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.04);cursor:default;transition:background 0.12s;gap:6px; }
    .yh-tray-row.scoreable { cursor:pointer; }
    .yh-tray-row.scoreable:hover { background:rgba(212,175,55,0.1); }
    .yh-tray-row.scoreable:active { background:rgba(212,175,55,0.2); }
    .yh-tray-icon { font-size:13px;flex-shrink:0;width:18px;text-align:center; }
    .yh-tray-cat { flex:1;min-width:0; }
    .yh-tray-catname { font-size:10px;color:#ccc;font-weight:bold; }
    .yh-tray-cathint { font-size:8px;color:rgba(255,255,255,0.3); }
    .yh-tray-scores { display:flex;gap:2px;flex-shrink:0; }
    .yh-tray-score { width:28px;text-align:center;font-size:10px;font-weight:bold;border-radius:4px;padding:1px 0; }
    .yh-tray-score.mine-pot { color:#d4af37;background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.3); }
    .yh-tray-score.mine-zero { color:rgba(255,100,100,0.7);background:rgba(200,60,60,0.1); }
    .yh-tray-score.mine-done { color:rgba(212,175,55,0.6);background:transparent; }
    .yh-tray-score.opp-done { color:rgba(255,255,255,0.35);background:transparent; }
    .yh-tray-score.empty { color:rgba(255,255,255,0.15);background:transparent; }
    .yh-tray-bonus { display:flex;padding:4px 10px;background:rgba(212,175,55,0.06);border-bottom:1px solid rgba(255,255,255,0.05);font-size:9px;color:rgba(212,175,55,0.6); }
    .yh-tray-total { display:flex;padding:5px 10px;background:rgba(0,0,0,0.3);font-size:10px;font-weight:bold; }
    .yh-gameover-wrap { position:absolute;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:300; }
    .yh-gameover-box { background:linear-gradient(160deg,#0d2a14,#091a0e);border:1px solid rgba(212,175,55,0.4);border-radius:12px;padding:20px 16px;text-align:center;color:#ccc;font-family:monospace;animation:gcPop 0.22s ease;min-width:170px; }
    @keyframes pbPop { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
    @keyframes pbPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .pb-game { display:flex;flex-direction:column;height:100%;background:linear-gradient(160deg,#0a1a0d 0%,#050e07 100%);position:relative;overflow:hidden; }
    .pb-hdr { position:relative;display:flex;align-items:center;padding:4px 8px;background:rgba(0,0,0,0.5);border-bottom:1px solid rgba(100,200,100,0.15);min-height:28px;flex-shrink:0; }
    .pb-scorebar { display:flex;align-items:stretch;flex-shrink:0;border-bottom:1px solid rgba(100,200,100,0.15); }
    .pb-sb-half { flex:1;display:flex;flex-direction:column;align-items:center;padding:5px 4px;gap:2px;min-width:0;transition:background 0.2s; }
    .pb-sb-half.active { background:rgba(100,200,100,0.08);border-bottom:2px solid #64c864; }
    .pb-sb-half.inactive { border-bottom:2px solid transparent; }
    .pb-sb-name { font-size:9px;color:rgba(255,255,255,0.5);font-weight:bold;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center; }
    .pb-sb-balls { display:flex;gap:2px;flex-wrap:wrap;justify-content:center;min-height:14px; }
    .pb-sb-ball { width:10px;height:10px;border-radius:50%;border:1px solid rgba(0,0,0,0.5); }
    .pb-sb-you { font-size:7px;color:rgba(100,220,120,0.7);letter-spacing:1px; }
    .pb-sb-div { width:1px;background:rgba(255,255,255,0.1);flex-shrink:0; }
    .pb-canvas-wrap { flex:1;display:flex;align-items:center;justify-content:center;padding:4px;position:relative;overflow:hidden; }
    .pb-canvas { border-radius:6px;border:2px solid rgba(100,180,100,0.3);touch-action:none;cursor:crosshair;box-shadow:0 0 20px rgba(0,100,0,0.3),inset 0 0 30px rgba(0,50,0,0.5); }
    .pb-controls { flex-shrink:0;padding:6px 10px;border-top:1px solid rgba(100,200,100,0.12);display:flex;flex-direction:column;gap:5px; }
    .pb-power-bar { width:100%;height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;border:1px solid rgba(255,255,255,0.1); }
    .pb-power-fill { height:100%;border-radius:4px;transition:width 0.05s;background:linear-gradient(90deg,#22c55e,#eab308,#ef4444); }
    .pb-ctrl-row { display:flex;align-items:center;gap:6px; }
    .pb-shoot-btn { padding:5px 14px;border-radius:12px;border:none;cursor:pointer;font-family:monospace;font-size:11px;font-weight:bold;background:linear-gradient(135deg,#166534,#22c55e);color:#fff;box-shadow:0 2px 8px rgba(34,197,94,0.4);transition:all 0.15s;white-space:nowrap;flex-shrink:0; }
    .pb-shoot-btn:hover:not(:disabled) { background:linear-gradient(135deg,#15803d,#4ade80);transform:translateY(-1px); }
    .pb-shoot-btn:disabled { opacity:0.3;cursor:not-allowed;transform:none;box-shadow:none; }
    .pb-gameover-wrap { position:absolute;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:300; }
    .pb-gameover-box { background:linear-gradient(160deg,#0a2010,#050e07);border:1px solid rgba(100,200,100,0.3);border-radius:12px;padding:20px 16px;text-align:center;color:#ccc;font-family:monospace;animation:pbPop 0.22s ease;min-width:170px; }
    @keyframes c4Drop { 0%{transform:translateY(-120px) scale(0.8);opacity:0} 80%{transform:translateY(6px) scale(1.05);opacity:1} 100%{transform:translateY(0) scale(1);opacity:1} }
@keyframes c4Win { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.18);filter:brightness(1.5)} }
@keyframes c4Pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.c4-game { display:flex;flex-direction:column;height:100%;background:linear-gradient(160deg,#08101e 0%,#04080f 100%);position:relative;overflow:hidden; }
.c4-scorebar { display:flex;align-items:stretch;flex-shrink:0;border-bottom:1px solid rgba(80,120,255,0.2); }
.c4-sb-half { flex:1;display:flex;flex-direction:column;align-items:center;padding:5px 4px;gap:2px;min-width:0;transition:background 0.2s; }
.c4-sb-half.active { background:rgba(80,120,255,0.1);border-bottom:2px solid #5a8aff; }
.c4-sb-half.inactive { border-bottom:2px solid transparent; }
.c4-sb-name { font-size:9px;color:rgba(255,255,255,0.5);font-weight:bold;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center; }
.c4-sb-disc { width:15px;height:15px;border-radius:50%;border:2px solid rgba(0,0,0,0.5); }
.c4-sb-disc.r { background:radial-gradient(circle at 35% 30%,#ff8080,#b91c1c); }
.c4-sb-disc.y { background:radial-gradient(circle at 35% 30%,#ffe566,#d97706); }
.c4-sb-you { font-size:7px;color:rgba(100,220,120,0.7);letter-spacing:1px; }
.c4-sb-div { width:1px;background:rgba(255,255,255,0.1);flex-shrink:0; }
.c4-board-wrap { flex:1;display:flex;align-items:center;justify-content:center;padding:6px;overflow:hidden; }
.c4-board { background:linear-gradient(145deg,#1a2ea0,#0f1c70);border-radius:10px;padding:6px 4px;box-shadow:0 8px 32px rgba(0,0,60,0.9),inset 0 1px rgba(255,255,255,0.08);display:flex;flex-direction:row;gap:0; }
.c4-col { display:flex;flex-direction:column;cursor:pointer;border-radius:5px;transition:background 0.12s;padding:2px; }
.c4-col:hover { background:rgba(255,255,255,0.08); }
.c4-col.inactive { cursor:default; }
.c4-col.inactive:hover { background:transparent; }
.c4-col-arrow { font-size:9px;text-align:center;opacity:0;transition:opacity 0.15s;line-height:1.4;margin-bottom:1px;pointer-events:none; }
.c4-col:hover .c4-col-arrow { opacity:1; }
.c4-col.inactive .c4-col-arrow { opacity:0 !important; }
.c4-cell { width:32px;height:32px;border-radius:50%;margin:2px;box-shadow:inset 0 3px 8px rgba(0,0,0,0.7);background:rgba(0,0,0,0.6);transition:none; }
.c4-cell.r { background:radial-gradient(circle at 35% 28%,#ff9090,#b91c1c);box-shadow:0 2px 10px rgba(185,28,28,0.7),inset 0 1px rgba(255,200,200,0.25); }
.c4-cell.y { background:radial-gradient(circle at 35% 28%,#fff176,#d97706);box-shadow:0 2px 10px rgba(217,119,6,0.7),inset 0 1px rgba(255,245,150,0.3); }
.c4-cell.drop { animation:c4Drop 0.32s cubic-bezier(0.22,0.61,0.36,1) forwards; }
.c4-cell.win { animation:c4Win 0.55s ease infinite; }
.c4-status { font-size:10px;text-align:center;padding:4px 8px;color:rgba(255,255,255,0.4);flex-shrink:0;min-height:22px;letter-spacing:0.2px; }
.c4-status.myturn { color:rgba(140,180,255,0.95);font-weight:bold; }
.c4-status.waiting { color:rgba(255,255,255,0.28); }
.c4-gameover-wrap { position:absolute;inset:0;background:rgba(0,0,0,0.84);display:flex;align-items:center;justify-content:center;z-index:300; }
.c4-gameover-box { background:linear-gradient(160deg,#0c1a40,#060c22);border:1px solid rgba(80,120,255,0.4);border-radius:12px;padding:20px 16px;text-align:center;color:#ccc;font-family:monospace;animation:gcPop 0.22s ease;min-width:170px; }
    .pb-foul-banner { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(180,0,0,0.9);border:1px solid #f00;border-radius:8px;padding:8px 16px;font-size:12px;font-weight:bold;color:#fff;z-index:100;pointer-events:none;white-space:nowrap;animation:pbPop 0.15s ease; }
  @keyframes bsHit { 0%{transform:scale(1)} 50%{transform:scale(1.5)} 100%{transform:scale(1)} }
    .bs-game { display:flex;flex-direction:column;height:100%;background:linear-gradient(160deg,#050d1a 0%,#020810 100%);position:relative;overflow:hidden; }
    .bs-hdr { position:relative;display:flex;align-items:center;padding:4px 8px;background:rgba(0,0,0,0.5);border-bottom:1px solid rgba(0,150,255,0.2);min-height:28px;flex-shrink:0; }
    .bs-cell { aspect-ratio:1;border-radius:2px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:9px;line-height:1;transition:background 0.1s;user-select:none;box-sizing:border-box; }
    .bs-cell.water { background:rgba(0,80,180,0.3);border:1px solid rgba(0,120,255,0.12); }
    .bs-cell.target:hover { background:rgba(255,60,60,0.55);border:1px solid rgba(255,80,80,0.6); }
    .bs-cell.ship { background:rgba(80,110,170,0.65);border:1px solid rgba(130,170,255,0.3); }
    .bs-cell.hit { background:rgba(220,40,40,0.85);border:1px solid rgba(255,80,80,0.5);animation:bsHit 0.35s ease; }
    .bs-cell.miss { background:rgba(200,220,255,0.1);border:1px solid rgba(200,220,255,0.18); }
    .bs-cell.sunk { background:rgba(160,0,0,0.9);border:1px solid rgba(255,40,40,0.6); }
    .bs-cell.preview { background:rgba(0,200,100,0.5);border:1px solid rgba(0,255,120,0.65); }
    .bs-cell.preview-bad { background:rgba(200,50,50,0.5);border:1px solid rgba(255,80,80,0.65); }
    .bs-ship-item { display:flex;align-items:center;gap:6px;padding:4px 7px;border-radius:4px;cursor:pointer;transition:background 0.12s;border:1px solid transparent;font-family:monospace; }
    .bs-ship-item:hover:not(.bs-placed) { background:rgba(0,120,255,0.15); }
    .bs-ship-item.bs-selected { background:rgba(0,120,255,0.22);border-color:rgba(0,160,255,0.45); }
    .bs-ship-item.bs-placed { opacity:0.38;cursor:default; }
    .bs-gameover-wrap { position:absolute;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:300; }
    .bs-gameover-box { background:linear-gradient(160deg,#060e1e,#020810);border:1px solid rgba(0,150,255,0.4);border-radius:12px;padding:20px 16px;text-align:center;color:#ccc;font-family:monospace;animation:gcPop 0.22s ease;min-width:170px; }
    `;
  (document.head || document.documentElement).appendChild(ST);

  const Chess = (() => {
    const row = (i) => i >> 3,
      col = (i) => i & 7,
      sq = (r, c) => (r << 3) | c,
      inB = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    const clr = (p) => (p ? p[0] : ""),
      opp = (c) => (c === "w" ? "b" : "w"),
      E = "";
    function initBoard() {
      const b = Array(64).fill(E);
      const back = ["R", "N", "B", "Q", "K", "B", "N", "R"];
      for (let i = 0; i < 8; i++) {
        b[i] = "b" + back[i];
        b[8 + i] = "bP";
        b[48 + i] = "wP";
        b[56 + i] = "w" + back[i];
      }
      return b;
    }
    function initCastling() {
      return { wK: true, wQ: true, bK: true, bQ: true };
    }
    function isAttacked(board, target, byColor) {
      const r = row(target),
        c = col(target);
      const pd = byColor === "w" ? 1 : -1;
      for (const dc of [-1, 1]) {
        if (inB(r + pd, c + dc) && board[sq(r + pd, c + dc)] === byColor + "P")
          return true;
      }
      for (const [dr, dc] of [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ]) {
        if (inB(r + dr, c + dc) && board[sq(r + dr, c + dc)] === byColor + "N")
          return true;
      }
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        let nr = r + dr,
          nc = c + dc;
        while (inB(nr, nc)) {
          const p = board[sq(nr, nc)];
          if (p) {
            if (p === byColor + "R" || p === byColor + "Q") return true;
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      for (const [dr, dc] of [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]) {
        let nr = r + dr,
          nc = c + dc;
        while (inB(nr, nc)) {
          const p = board[sq(nr, nc)];
          if (p) {
            if (p === byColor + "B" || p === byColor + "Q") return true;
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      for (const [dr, dc] of [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ]) {
        if (inB(r + dr, c + dc) && board[sq(r + dr, c + dc)] === byColor + "K")
          return true;
      }
      return false;
    }
    function inCheck(board, color) {
      const k = board.indexOf(color + "K");
      return k >= 0 && isAttacked(board, k, opp(color));
    }
    function pseudoMoves(board, from, enPassant) {
      const p = board[from];
      if (!p) return [];
      const c = clr(p),
        t = p[1];
      const r = row(from),
        co = col(from);
      const mv = [];
      if (t === "P") {
        const d = c === "w" ? -1 : 1;
        const startR = c === "w" ? 6 : 1;
        if (inB(r + d, co) && !board[sq(r + d, co)]) {
          mv.push(sq(r + d, co));
          if (r === startR && !board[sq(r + 2 * d, co)])
            mv.push(sq(r + 2 * d, co));
        }
        for (const dc of [-1, 1]) {
          if (!inB(r + d, co + dc)) continue;
          const t2 = sq(r + d, co + dc);
          if ((board[t2] && clr(board[t2]) !== c) || t2 === enPassant)
            mv.push(t2);
        }
      } else if (t === "N") {
        for (const [dr, dc] of [
          [-2, -1],
          [-2, 1],
          [-1, -2],
          [-1, 2],
          [1, -2],
          [1, 2],
          [2, -1],
          [2, 1],
        ]) {
          if (inB(r + dr, co + dc) && clr(board[sq(r + dr, co + dc)]) !== c)
            mv.push(sq(r + dr, co + dc));
        }
      } else if (t === "K") {
        for (const [dr, dc] of [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ]) {
          if (inB(r + dr, co + dc) && clr(board[sq(r + dr, co + dc)]) !== c)
            mv.push(sq(r + dr, co + dc));
        }
      } else {
        const dirs =
          t === "B"
            ? [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1],
              ]
            : t === "R"
              ? [
                  [-1, 0],
                  [1, 0],
                  [0, -1],
                  [0, 1],
                ]
              : [
                  [-1, -1],
                  [-1, 1],
                  [1, -1],
                  [1, 1],
                  [-1, 0],
                  [1, 0],
                  [0, -1],
                  [0, 1],
                ];
        for (const [dr, dc] of dirs) {
          let nr = r + dr,
            nc = co + dc;
          while (inB(nr, nc)) {
            const to = sq(nr, nc);
            if (board[to]) {
              if (clr(board[to]) !== c) mv.push(to);
              break;
            }
            mv.push(to);
            nr += dr;
            nc += dc;
          }
        }
      }
      return mv;
    }
    function applyMove(board, from, to, enPassant, promo = "Q") {
      const b = [...board];
      const p = b[from];
      const c = clr(p);
      let newEP = -1;
      if (p[1] === "P" && to === enPassant && enPassant >= 0) {
        const capR = row(to) + (c === "w" ? 1 : -1);
        b[sq(capR, col(to))] = E;
      }
      b[to] = p;
      b[from] = E;
      if (p[1] === "P" && (row(to) === 0 || row(to) === 7)) b[to] = c + promo;
      if (p[1] === "P" && Math.abs(row(to) - row(from)) === 2)
        newEP = sq((row(from) + row(to)) >> 1, col(from));
      return { board: b, enPassant: newEP };
    }
    function applyCastle(board, color, side) {
      const b = [...board],
        rank = color === "w" ? 7 : 0;
      if (side === "K") {
        b[sq(rank, 6)] = color + "K";
        b[sq(rank, 4)] = E;
        b[sq(rank, 5)] = color + "R";
        b[sq(rank, 7)] = E;
      } else {
        b[sq(rank, 2)] = color + "K";
        b[sq(rank, 4)] = E;
        b[sq(rank, 3)] = color + "R";
        b[sq(rank, 0)] = E;
      }
      return b;
    }
    function legalMoves(board, from, castling, enPassant) {
      const p = board[from];
      if (!p) return [];
      const c = clr(p),
        legal = [];
      for (const to of pseudoMoves(board, from, enPassant)) {
        const { board: nb } = applyMove(board, from, to, enPassant);
        if (!inCheck(nb, c)) legal.push(to);
      }
      if (p[1] === "K" && !inCheck(board, c)) {
        const rank = c === "w" ? 7 : 0,
          kSq = sq(rank, 4);
        if (from === kSq) {
          if (
            castling[c + "K"] &&
            !board[sq(rank, 5)] &&
            !board[sq(rank, 6)] &&
            !isAttacked(board, sq(rank, 5), opp(c)) &&
            !isAttacked(board, sq(rank, 6), opp(c))
          )
            legal.push(sq(rank, 6));
          if (
            castling[c + "Q"] &&
            !board[sq(rank, 3)] &&
            !board[sq(rank, 2)] &&
            !board[sq(rank, 1)] &&
            !isAttacked(board, sq(rank, 3), opp(c)) &&
            !isAttacked(board, sq(rank, 2), opp(c))
          )
            legal.push(sq(rank, 2));
        }
      }
      return legal;
    }
    function allLegalMoves(board, color, castling, enPassant) {
      const moves = [];
      for (let i = 0; i < 64; i++) {
        if (clr(board[i]) === color)
          for (const to of legalMoves(board, i, castling, enPassant))
            moves.push({ from: i, to });
      }
      return moves;
    }
    function updateCastling(castling, piece, from, to) {
      const c = { ...castling };
      if (piece === "wK") {
        c.wK = false;
        c.wQ = false;
      }
      if (piece === "bK") {
        c.bK = false;
        c.bQ = false;
      }
      if (from === 56 || to === 56) c.wQ = false;
      if (from === 63 || to === 63) c.wK = false;
      if (from === 0 || to === 0) c.bQ = false;
      if (from === 7 || to === 7) c.bK = false;
      return c;
    }
    function processMove(gs, from, to, promo = "Q") {
      const { board, turn, castling, enPassant } = gs;
      const p = board[from];
      if (!p || clr(p) !== turn) return null;
      const legal = legalMoves(board, from, castling, enPassant);
      if (!legal.includes(to)) return null;
      const isCastle = p[1] === "K" && Math.abs(col(to) - col(from)) === 2;
      let newBoard,
        newEP = -1;
      if (isCastle) {
        newBoard = applyCastle(board, turn, col(to) === 6 ? "K" : "Q");
      } else {
        const res = applyMove(board, from, to, enPassant, promo);
        newBoard = res.board;
        newEP = res.enPassant;
      }
      const newCastling = updateCastling(castling, p, from, to);
      const nextTurn = opp(turn);
      const allMoves = allLegalMoves(newBoard, nextTurn, newCastling, newEP);
      const nowInCheck = inCheck(newBoard, nextTurn);
      let status = "playing",
        result = null;
      if (allMoves.length === 0) {
        if (nowInCheck) {
          status = "checkmate";
          result = turn === "w" ? "white" : "black";
        } else {
          status = "stalemate";
          result = "draw";
        }
      } else if (nowInCheck) {
        status = "check";
      }
      return {
        board: newBoard,
        turn: nextTurn,
        castling: newCastling,
        enPassant: newEP,
        lastMove: { from, to },
        status,
        result,
      };
    }
    function isPromotion(board, from, to) {
      const p = board[from];
      return p && p[1] === "P" && (row(to) === 0 || row(to) === 7);
    }
    const GLYPHS = { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" };
    return {
      initBoard,
      initCastling,
      legalMoves,
      processMove,
      inCheck,
      isPromotion,
      GLYPHS,
      clr,
      opp,
      row,
      col,
      sq,
      allLegalMoves,
    };
  })();

  const Yahtzee = (() => {
    const CATEGORIES = [
      { id: "ones", label: "Ones", hint: "Sum of 1s", section: "upper" },
      { id: "twos", label: "Twos", hint: "Sum of 2s", section: "upper" },
      { id: "threes", label: "Threes", hint: "Sum of 3s", section: "upper" },
      { id: "fours", label: "Fours", hint: "Sum of 4s", section: "upper" },
      { id: "fives", label: "Fives", hint: "Sum of 5s", section: "upper" },
      { id: "sixes", label: "Sixes", hint: "Sum of 6s", section: "upper" },
      {
        id: "threeKind",
        label: "3 of a Kind",
        hint: "Sum all if >=3 same",
        section: "lower",
      },
      {
        id: "fourKind",
        label: "4 of a Kind",
        hint: "Sum all if >=4 same",
        section: "lower",
      },
      {
        id: "fullHouse",
        label: "Full House",
        hint: "3+2 same -> 25 pts",
        section: "lower",
      },
      {
        id: "smStraight",
        label: "Sm Straight",
        hint: "4 seq. -> 30 pts",
        section: "lower",
      },
      {
        id: "lgStraight",
        label: "Lg Straight",
        hint: "5 seq. -> 40 pts",
        section: "lower",
      },
      {
        id: "yahtzee",
        label: "YAHTZEE!",
        hint: "All 5 same -> 50 pts",
        section: "lower",
      },
      { id: "chance", label: "Chance", hint: "Sum all dice", section: "lower" },
    ];
    const DICE_FACES = [
      "",
      "\u2680",
      "\u2681",
      "\u2682",
      "\u2683",
      "\u2684",
      "\u2685",
    ];
    function rollDice(current, held) {
      return current.map((v, i) =>
        held[i] ? v : Math.floor(Math.random() * 6) + 1,
      );
    }
    function initDice() {
      return [0, 0, 0, 0, 0];
    }
    function initHeld() {
      return [false, false, false, false, false];
    }
    function initScores() {
      return {};
    }
    function counts(dice) {
      const c = [0, 0, 0, 0, 0, 0, 0];
      dice.forEach((d) => {
        if (d) c[d]++;
      });
      return c;
    }
    function sum(dice) {
      return dice.reduce((a, b) => a + b, 0);
    }
    function calcScore(catId, dice) {
      if (!dice || dice.some((d) => !d)) return 0;
      const c = counts(dice);
      const s = sum(dice);
      switch (catId) {
        case "ones":
          return c[1] * 1;
        case "twos":
          return c[2] * 2;
        case "threes":
          return c[3] * 3;
        case "fours":
          return c[4] * 4;
        case "fives":
          return c[5] * 5;
        case "sixes":
          return c[6] * 6;
        case "threeKind":
          return c.some((x) => x >= 3) ? s : 0;
        case "fourKind":
          return c.some((x) => x >= 4) ? s : 0;
        case "fullHouse":
          return c.some((x) => x === 3) && c.some((x) => x === 2) ? 25 : 0;
        case "smStraight": {
          const u = dice.filter((v, i, a) => a.indexOf(v) === i).sort();
          let best = 1,
            cur = 1;
          for (let i = 1; i < u.length; i++) {
            if (u[i] === u[i - 1] + 1) {
              cur++;
              best = Math.max(best, cur);
            } else cur = 1;
          }
          return best >= 4 ? 30 : 0;
        }
        case "lgStraight": {
          const u = dice.filter((v, i, a) => a.indexOf(v) === i).sort();
          let best = 1,
            cur = 1;
          for (let i = 1; i < u.length; i++) {
            if (u[i] === u[i - 1] + 1) {
              cur++;
              best = Math.max(best, cur);
            } else cur = 1;
          }
          return best >= 5 ? 40 : 0;
        }
        case "yahtzee":
          return c.some((x) => x === 5) ? 50 : 0;
        case "chance":
          return s;
        default:
          return 0;
      }
    }
    function upperTotal(scores) {
      return ["ones", "twos", "threes", "fours", "fives", "sixes"].reduce(
        (a, k) => a + (scores[k] != null ? scores[k] : 0),
        0,
      );
    }
    function grandTotal(scores) {
      const upper = upperTotal(scores);
      const bonus = upper >= 63 ? 35 : 0;
      const lower = [
        "threeKind",
        "fourKind",
        "fullHouse",
        "smStraight",
        "lgStraight",
        "yahtzee",
        "chance",
      ].reduce((a, k) => a + (scores[k] != null ? scores[k] : 0), 0);
      const yBonus = scores["yahtzeeBonus"] || 0;
      return upper + bonus + lower + yBonus;
    }
    function isComplete(scores) {
      return CATEGORIES.every((c) => scores[c.id] != null);
    }
    function applyYahtzeeBonus(scores, dice) {
      if (!dice.every((d) => d === dice[0])) return scores;
      if (scores["yahtzee"] == null || scores["yahtzee"] === 0) return scores;
      return { ...scores, yahtzeeBonus: (scores.yahtzeeBonus || 0) + 100 };
    }
    function initGameState(p1, p2) {
      return {
        players: { p1, p2 },
        currentPlayer: "p1",
        dice: initDice(),
        held: initHeld(),
        rollsLeft: 3,
        scores: { p1: initScores(), p2: initScores() },
        turnsTotal: 0,
        status: "playing",
        result: null,
        yahtzeeBonus: { p1: 0, p2: 0 },
      };
    }
    return {
      CATEGORIES,
      DICE_FACES,
      rollDice,
      initDice,
      initHeld,
      initScores,
      calcScore,
      upperTotal,
      grandTotal,
      isComplete,
      applyYahtzeeBonus,
      initGameState,
    };
  })();

  const Pool = (() => {
    const TW = 280,
      TH = 160;
    const POCKET_R = 10;
    const BALL_R = 7;
    const FRICTION = 0.988;
    const MIN_SPEED = 0.04;
    const POCKETS = [
      { x: POCKET_R, y: POCKET_R },
      { x: TW / 2, y: 0 },
      { x: TW - POCKET_R, y: POCKET_R },
      { x: POCKET_R, y: TH - POCKET_R },
      { x: TW / 2, y: TH },
      { x: TW - POCKET_R, y: TH - POCKET_R },
    ];
    const BALL_COLORS = [
      "#ffffff",
      "#f5c400",
      "#1e3a8a",
      "#dc2626",
      "#7e22ce",
      "#f97316",
      "#16a34a",
      "#7f1d1d",
      "#111111",
      "#f5c400",
      "#1e3a8a",
      "#dc2626",
      "#7e22ce",
      "#f97316",
      "#16a34a",
      "#7f1d1d",
    ];
    function rackBalls() {
      const balls = [];
      const startX = TW * 0.65;
      const startY = TH / 2;
      const rows = [
        [9],
        [2, 10],
        [3, 8, 11],
        [4, 13, 5, 12],
        [6, 14, 1, 15, 7],
      ];
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
          const bx = startX + r * (BALL_R * 2 + 0.5);
          const by =
            startY -
            (rows[r].length - 1) * (BALL_R + 0.3) +
            c * (BALL_R * 2 + 0.6);
          balls.push({
            id: rows[r][c],
            x: bx,
            y: by,
            vx: 0,
            vy: 0,
            pocketed: false,
          });
        }
      }
      balls.unshift({
        id: 0,
        x: TW * 0.25,
        y: TH / 2,
        vx: 0,
        vy: 0,
        pocketed: false,
      });
      return balls;
    }
    function initGameState(p1, p2) {
      return {
        players: { p1, p2 },
        currentPlayer: "p1",
        balls: rackBalls(),
        p1Type: null,
        p2Type: null,
        status: "waiting",
        result: null,
        resultReason: null,
        foul: false,
        foulMsg: "",
        breakShot: true,
        shotInProgress: false,
        lastShot: null,
      };
    }
    function dist(a, b) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }
    function stepPhysics(bs) {
      let moving = false;
      for (const b of bs) {
        if (b.pocketed) continue;
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= FRICTION;
        b.vy *= FRICTION;
        if (Math.abs(b.vx) < MIN_SPEED) b.vx = 0;
        if (Math.abs(b.vy) < MIN_SPEED) b.vy = 0;
        if (b.x - BALL_R < 0) {
          b.x = BALL_R;
          b.vx = Math.abs(b.vx) * 0.82;
        }
        if (b.x + BALL_R > TW) {
          b.x = TW - BALL_R;
          b.vx = -Math.abs(b.vx) * 0.82;
        }
        if (b.y - BALL_R < 0) {
          b.y = BALL_R;
          b.vy = Math.abs(b.vy) * 0.82;
        }
        if (b.y + BALL_R > TH) {
          b.y = TH - BALL_R;
          b.vy = -Math.abs(b.vy) * 0.82;
        }
        if (b.vx !== 0 || b.vy !== 0) moving = true;
      }
      for (let i = 0; i < bs.length; i++) {
        if (bs[i].pocketed) continue;
        for (let j = i + 1; j < bs.length; j++) {
          if (bs[j].pocketed) continue;
          const dx = bs[j].x - bs[i].x,
            dy = bs[j].y - bs[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < BALL_R * 2 && d > 0) {
            const ov = BALL_R * 2 - d,
              nx = dx / d,
              ny = dy / d;
            bs[i].x -= (nx * ov) / 2;
            bs[i].y -= (ny * ov) / 2;
            bs[j].x += (nx * ov) / 2;
            bs[j].y += (ny * ov) / 2;
            const dvx = bs[i].vx - bs[j].vx,
              dvy = bs[i].vy - bs[j].vy;
            const dot = dvx * nx + dvy * ny;
            if (dot > 0) {
              bs[i].vx -= dot * nx;
              bs[i].vy -= dot * ny;
              bs[j].vx += dot * nx;
              bs[j].vy += dot * ny;
              moving = true;
            }
          }
        }
      }
      for (const b of bs) {
        if (b.pocketed) continue;
        for (const p of POCKETS) {
          if (dist(b, p) < POCKET_R * 1.1) {
            b.pocketed = true;
            b.vx = 0;
            b.vy = 0;
            break;
          }
        }
      }
      return moving;
    }
    function simulate(balls, maxSteps = 4000) {
      const bs = balls.map((b) => ({ ...b }));
      let s = 0;
      while (s < maxSteps) {
        if (!stepPhysics(bs)) break;
        s++;
      }
      return bs;
    }
    function resolveShot(gs, ballsBefore, ballsAfter) {
      const curSlot = gs.currentPlayer,
        oppSlot = curSlot === "p1" ? "p2" : "p1";
      const prevPocketed = ballsBefore
        .filter((b) => b.pocketed)
        .map((b) => b.id);
      const newPocketed = ballsAfter.filter((b) => b.pocketed).map((b) => b.id);
      const justPocketed = newPocketed.filter(
        (id) => !prevPocketed.includes(id),
      );
      const myType = gs[curSlot + "Type"];
      const isBreak = gs.breakShot;
      let foul = false,
        foulMsg = "",
        extraTurn = false;
      const newBalls = ballsAfter.map((b) => ({ ...b }));
      if (justPocketed.includes(0)) {
        const cb = newBalls.find((b) => b.id === 0);
        cb.pocketed = false;
        cb.x = TW * 0.25;
        cb.y = TH / 2;
        cb.vx = 0;
        cb.vy = 0;
        foul = true;
        foulMsg = "Scratch! Ball in hand.";
      }
      if (justPocketed.includes(8)) {
        const myLeft = newBalls.filter(
          (b) =>
            !b.pocketed && b.id !== 0 && b.id !== 8 && isMine(b.id, myType),
        ).length;
        if (isBreak || myLeft > 0 || foul) {
          return {
            ...gs,
            balls: newBalls,
            status: "finished",
            result: oppSlot,
            resultReason: "8-ball sunk illegally",
            foul: true,
            foulMsg: "Sunk the 8-ball early! Opponent wins.",
            lastShot: gs.lastShot,
            breakShot: false,
          };
        } else {
          return {
            ...gs,
            balls: newBalls,
            status: "finished",
            result: curSlot,
            resultReason: "sunk 8-ball",
            foul: false,
            foulMsg: "",
            lastShot: gs.lastShot,
            breakShot: false,
          };
        }
      }
      let newP1Type = gs.p1Type,
        newP2Type = gs.p2Type;
      if (
        !gs.p1Type &&
        justPocketed.filter((id) => id !== 0 && id !== 8).length > 0
      ) {
        const first = justPocketed.find((id) => id !== 0 && id !== 8);
        if (first != null) {
          const type = first <= 7 ? "solids" : "stripes";
          newP1Type =
            curSlot === "p1" ? type : type === "solids" ? "stripes" : "solids";
          newP2Type =
            curSlot === "p1"
              ? type === "solids"
                ? "stripes"
                : "solids"
              : type;
        }
      }
      const myType2 = curSlot === "p1" ? newP1Type : newP2Type;
      const myMade = justPocketed.filter(
        (id) => id !== 0 && id !== 8 && myType2 && isMine(id, myType2),
      ).length;
      const oppMade = justPocketed.filter(
        (id) => id !== 0 && id !== 8 && myType2 && !isMine(id, myType2),
      ).length;
      if (myMade > 0 && !foul) extraTurn = true;
      if (oppMade > 0) {
        foul = true;
        foulMsg = (foulMsg ? foulMsg + " " : "") + "Wrong ball pocketed.";
      }
      return {
        ...gs,
        balls: newBalls,
        p1Type: newP1Type,
        p2Type: newP2Type,
        currentPlayer: extraTurn && !foul ? curSlot : oppSlot,
        breakShot: false,
        foul,
        foulMsg,
        lastShot: gs.lastShot,
        shotInProgress: false,
      };
    }
    function isMine(ballId, type) {
      if (type === "solids") return ballId >= 1 && ballId <= 7;
      if (type === "stripes") return ballId >= 9 && ballId <= 15;
      return false;
    }
    return {
      TW,
      TH,
      POCKET_R,
      BALL_R,
      POCKETS,
      BALL_COLORS,
      rackBalls,
      initGameState,
      stepPhysics,
      simulate,
      resolveShot,
      isMine,
      FRICTION,
      MIN_SPEED,
    };
  })();
  const Connect4 = (() => {
    const ROWS = 6, COLS = 7;
    function idx(r, c) { return r * COLS + c; }
    function initBoard() { return Array(ROWS * COLS).fill(null); }
    function getCell(board, r, c) { return board[idx(r, c)]; }
    function dropPiece(board, col, color) {
      for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[idx(r, col)]) {
          const nb = [...board];
          nb[idx(r, col)] = color;
          return { board: nb, row: r };
        }
      }
      return null;
    }
    function checkWinner(board) {
      const check = (r, c, dr, dc) => {
        const v = board[idx(r, c)];
        if (!v) return null;
        const cells = [{r, c}];
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[idx(nr, nc)] !== v) return null;
          cells.push({r: nr, c: nc});
        }
        return { winner: v, cells };
      };
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const w = check(r,c,0,1)||check(r,c,1,0)||check(r,c,1,1)||check(r,c,1,-1);
        if (w) return w;
      }
      if (board.every(v => v !== null)) return { winner: 'draw', cells: [] };
      return null;
    }
    function initGameState(p1, p2) {
      return {
        players: { p1, p2 }, currentPlayer: 'p1',
        board: initBoard(), lastMove: null, winCells: null,
        status: 'playing', result: null,
      };
    }
    return { ROWS, COLS, initBoard, dropPiece, checkWinner, getCell, initGameState };
  })();
  const Battleship = (() => {
    const GRID = 10;
    const SHIPS = [
      { id: 'C', name: 'Carrier',    size: 5 },
      { id: 'B', name: 'Battleship', size: 4 },
      { id: 'R', name: 'Cruiser',    size: 3 },
      { id: 'S', name: 'Submarine',  size: 3 },
      { id: 'D', name: 'Destroyer',  size: 2 },
    ];
    function initGrid() { return Array(GRID * GRID).fill(null); }
    function idx(r, c) { return r * GRID + c; }
    function canPlace(grid, row, col, size, horiz) {
      for (let i = 0; i < size; i++) {
        const r = horiz ? row : row + i, c = horiz ? col + i : col;
        if (r < 0 || r >= GRID || c < 0 || c >= GRID || grid[idx(r, c)]) return false;
      }
      return true;
    }
    function placeShip(grid, row, col, size, horiz, shipId) {
      if (!canPlace(grid, row, col, size, horiz)) return null;
      const ng = [...grid];
      for (let i = 0; i < size; i++) {
        const r = horiz ? row : row + i, c = horiz ? col + i : col;
        ng[idx(r, c)] = shipId;
      }
      return ng;
    }
    function checkAllSunk(grid, shots) {
      for (let i = 0; i < grid.length; i++) {
        if (grid[i] && shots[i] !== 'hit') return false;
      }
      return true;
    }
    function initGameState(p1, p2) {
      return {
        players: { p1, p2 }, currentPlayer: 'p1',
        p1Grid: initGrid(), p2Grid: initGrid(),
        p1Shots: initGrid(), p2Shots: initGrid(),
        p1Ready: false, p2Ready: false,
        status: 'waiting', result: null,
      };
    }
    return { GRID, SHIPS, initGrid, idx, canPlace, placeShip, checkAllSunk, initGameState };
  })();

  let db = null,
    currentRoom = null,
    myColor = null,
    isSpectator = false;
  let unsubRoom = null,
    unsubList = null;
  let selectedSq = null,
    validTargets = [];
  let yhLocalRolling = false;

  function clearSubs() {
    if (unsubRoom) {
      unsubRoom();
      unsubRoom = null;
    }
    if (unsubList) {
      unsubList();
      unsubList = null;
    }
  }

  const GAME_EMPTY_TTL_MS = 15_000,
    gameDeleteTimers = {};
  function scheduleGameDelete(roomId, emptyAtMs) {
    cancelGameDelete(roomId);
    const elapsed = Date.now() - emptyAtMs;
    const delay = Math.max(0, GAME_EMPTY_TTL_MS - elapsed);
    gameDeleteTimers[roomId] = setTimeout(async () => {
      delete gameDeleteTimers[roomId];
      try {
        const snap = await db.collection("gameRooms").doc(roomId).get();
        if (!snap.exists) return;
        if ((snap.data().memberCount || 0) > 0) return;
        await db.collection("gameRooms").doc(roomId).delete();
      } catch (e) {
        console.warn("scheduleGameDelete:", e);
      }
    }, delay);
  }
  function cancelGameDelete(roomId) {
    if (gameDeleteTimers[roomId]) {
      clearTimeout(gameDeleteTimers[roomId]);
      delete gameDeleteTimers[roomId];
    }
  }
  function evaluateGameAutoDelete(roomId, data) {
    if ((data.memberCount || 0) > 0) {
      cancelGameDelete(roomId);
      return;
    }
    const ea = data.emptyAt;
    const emptyAtMs = ea
      ? ea.toMillis
        ? ea.toMillis()
        : ea.seconds * 1000
      : Date.now();
    scheduleGameDelete(roomId, emptyAtMs);
  }

  function mk(tag, css) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    return e;
  }
  function mkBtn(label, cls, css) {
    const b = document.createElement("button");
    b.textContent = label;
    b.className = cls;
    if (css) b.style.cssText += css;
    return b;
  }
  function mkLbl(t) {
    const d = mk("div");
    d.className = "gc-lbl";
    d.textContent = t;
    return d;
  }
  function mkTgl(label, on) {
    return mkBtn(label, "gc-btn gc-tgl" + (on ? " gc-on" : ""), "flex:1;");
  }
  function setTgl(btn, on) {
    btn.classList.toggle("gc-on", on);
  }
  function stopInput(el) {
    ["keydown", "keyup", "keypress", "input", "paste"].forEach((ev) =>
      el.addEventListener(ev, (e) => e.stopPropagation()),
    );
  }
  function setStatus(msg, phase) {
  const phases = {
    connecting: { icon: "🔥", color: "#5CC85B", sub: "Establishing connection…" },
    username:   { icon: "🪪", color: "#FFD84D", sub: "Reserving your identity…" },
    rooms:      { icon: "🏰", color: "#FF8C42", sub: "Loading party rooms…" },
    error:      { icon: "⚠️", color: "#ff6b6b", sub: "" },
  };

  const p = phases[phase] || { icon: "⚙️", color: "#888", sub: "" };

  gamesContent.innerHTML = `
    <div style="
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:28px 16px;gap:10px;font-family:'Nunito',monospace;
    ">
      <!-- Animated logo grid -->
      <div style="
        display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);
        gap:2px;width:32px;height:32px;animation:cc-blockBob 1.2s ease-in-out infinite;
      ">
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

      <!-- Phase icon + main message -->
      <div style="text-align:center;">
        <div style="font-size:18px;margin-bottom:4px;">${p.icon}</div>
        <div style="font-size:12px;font-weight:800;color:${p.color};letter-spacing:0.03em;">
          ${msg}
        </div>
        ${p.sub ? `<div style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:3px;">${p.sub}</div>` : ""}
      </div>

      <!-- Animated dots bar -->
      <div style="display:flex;gap:5px;margin-top:2px;">
        ${[0,1,2].map(i => `
          <span style="
            width:6px;height:6px;border-radius:50%;
            background:${p.color};opacity:0.85;
            animation:cc-pulse 1.2s ease-in-out ${i*0.22}s infinite;
            display:inline-block;
          "></span>
        `).join("")}
      </div>
    </div>
  `;
}

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-ccfs="${url}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.setAttribute("data-ccfs", url);
      s.src = url;
      s.onload = resolve;
      s.onerror = reject;
      document.documentElement.appendChild(s);
    });
  }
  function getFirebaseDb() {
    if (!window.__ccFirebaseInit__) {
      window.__ccFirebaseInit__ = (async () => {
        await loadScript(
          "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
        );
        await loadScript(
          "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js",
        );
        if (!firebase.apps.length) {
          firebase.initializeApp({
            apiKey: FIREBASE_API_KEY,
            authDomain: "chat-7144e.firebaseapp.com",
            projectId: FIRESTORE_PROJECT,
            storageBucket: "chat-7144e.firebasestorage.app",
            messagingSenderId: "1006738885816",
            appId: "1:1006738885816:web:bbfd4eac22f6b24347784d",
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
    setStatus("Loading Rooms", "rooms");
    renderList();
  } catch(e) {
    console.error("Games: Firebase init failed", e);
    setStatus("Could not connect to Firebase.", "error");
  }
}

  function renderList() {
    clearSubs();
    selectedSq = null;
    validTargets = [];
    currentRoom = null;
    myColor = null;
    isSpectator = false;
    gamesContent.innerHTML = "";
    const searchWrap = mk(
      "div",
      "padding:5px 7px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:0;position:relative;",
    );
    const newBtn = document.createElement("button");
    newBtn.textContent = "+ Room";
    newBtn.className = "gc-btn gc-act";
    newBtn.style.cssText +=
      "border-radius:5px 0 0 5px;border-right:none;flex-shrink:0;font-size:11px;padding:0 10px;white-space:nowrap;height:28px;line-height:28px;box-sizing:border-box;";
    newBtn.onclick = renderCreate;
    const searchIn = document.createElement("input");
    searchIn.type = "text";
    searchIn.placeholder = "Search rooms...";
    searchIn.className = "gc-input";
    searchIn.style.cssText +=
      "flex:1;border-radius:0 5px 5px 0;border-left:none;min-width:0;padding-right:26px;height:28px;box-sizing:border-box;";
    stopInput(searchIn);
    const searchIcon = mk(
      "div",
      "position:absolute;right:12px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.35);font-size:13px;pointer-events:none;",
    );
    searchIcon.textContent = "\u2315";
    searchWrap.append(newBtn, searchIn, searchIcon);
    gamesContent.appendChild(searchWrap);
    const list = mk("div", "overflow-y:auto;max-height:210px;");
    list.className = "gc-scroll";
    gamesContent.appendChild(list);
    let allDocs = [];
    const GAME_ICONS = {
      chess: "\u265f",
      yahtzee: "\uD83C\uDFB2",
      pool: "\uD83C\uDFB1",
      connect4: "🔴",
      battleship: "🚢",
    };
    function renderRooms() {
      const q = searchIn.value.trim().toLowerCase();
      list.innerHTML = "";
      const filtered = q
        ? allDocs.filter((d) => d.data().name.toLowerCase().includes(q))
        : allDocs;
      if (!filtered.length) {
        list.innerHTML = `<div style="padding:22px 10px;color:rgba(255,255,255,0.28);font-size:11px;text-align:center;line-height:1.8;">${q ? `No rooms matching "${searchIn.value}"` : "No game rooms yet.<br>Create one!"}</div>`;
        return;
      }
      filtered.forEach((doc) => {
        const d = doc.data();
        const isPub = d.visibility === "public";
        const status = d.status || "waiting";
        const gameType = d.game || "chess";
        const players = d.players || {};
        let playerCount = 0;
        if (gameType === "chess") {
          playerCount = [players.white, players.black].filter(Boolean).length;
        } else {
          playerCount = [players.p1, players.p2].filter(Boolean).length;
        }
        const maxPlayers = 2;
        const canSpectate =
          (status === "playing" || status === "check" || status === "placing") &&
          playerCount >= maxPlayers;
        const row = mk(
          "div",
          "display:flex;align-items:center;padding:7px 9px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.15s;",
        );
        row.className = isPub ? "gc-row-pub" : "gc-row-game";
        const info = mk("div", "flex:1;overflow:hidden;min-width:0;");
        const nameEl = mk(
          "div",
          "font-size:12px;font-weight:bold;color:#ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
        );
        nameEl.textContent = d.name;
        const tags = mk(
          "div",
          "display:flex;align-items:center;gap:5px;margin-top:3px;",
        );
        const visTag = mk(
          "span",
          `font-size:9px;padding:1px 5px;border-radius:3px;background:${isPub ? "rgba(28,52,100,0.75)" : "rgba(80,48,12,0.75)"};color:${isPub ? "rgba(150,190,255,0.9)" : "rgba(220,165,70,0.9)"};border:1px solid ${isPub ? "rgba(70,110,220,0.28)" : "rgba(170,110,22,0.28)"};`,
        );
        visTag.textContent = isPub ? "Public" : "Private";
        const gameTag = mk(
          "span",
          "font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(50,30,70,0.8);color:rgba(190,150,255,0.9);border:1px solid rgba(130,90,200,0.3);",
        );
        const gameLabel =
          gameType === "yahtzee"  ? "Yahtzee"
          : gameType === "pool"   ? "8-Ball Pool"
          : gameType === "connect4" ? "Connect 4"
          : gameType === "battleship" ? "Battleship"
          : "Chess";
        gameTag.textContent =
          (GAME_ICONS[gameType] || "\uD83C\uDFAE") + " " + gameLabel;
        const statusColors = {
          waiting:  "rgba(180,180,100,0.85)",
          placing:  "rgba(100,180,255,0.85)",
          playing:  "rgba(80,200,120,0.85)",
          check:    "rgba(80,200,120,0.85)",
          finished: "rgba(120,120,120,0.5)",
        };
        const statusLabels = {
          waiting:  `${playerCount}/${maxPlayers} players`,
          placing:  "Placing ships",
          playing:  "In progress",
          check:    "In progress",
          finished: "Finished",
        };
        const dot = mk(
          "span",
          `display:inline-block;width:5px;height:5px;border-radius:50%;background:${statusColors[status] || statusColors.waiting};`,
        );
        const stEl = mk(
          "span",
          "font-size:9px;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:3px;",
        );
        stEl.append(
          dot,
          document.createTextNode(statusLabels[status] || "Waiting"),
        );
        const specCount = d.spectatorCount || 0;
        if (canSpectate && specCount > 0) {
          const specTag = mk(
            "span",
            "font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(20,60,60,0.7);color:rgba(100,220,220,0.85);border:1px solid rgba(50,160,160,0.3);",
          );
          specTag.textContent = `\uD83D\uDC41 ${specCount}`;
          tags.append(specTag);
        }
        tags.append(visTag, gameTag, stEl);
        info.append(nameEl, tags);
        const btnWrap = mk(
          "div",
          "display:flex;gap:4px;align-items:center;margin-left:8px;flex-shrink:0;",
        );
        if (canSpectate) {
          const specBtn = mkBtn(
            "\uD83D\uDC41 Watch",
            "gc-btn gc-sm",
            "background:rgba(20,60,60,0.7);border-color:rgba(50,160,160,0.35);color:rgba(100,220,220,0.9);",
          );
          specBtn.onclick = (e) => {
            e.stopPropagation();
            handleSpectate(doc.id, d);
          };
          btnWrap.appendChild(specBtn);
        }
        const enterBtn = mkBtn(
          canSpectate ? "Join" : "Enter ->",
          "gc-btn gc-sm",
          "",
        );
        enterBtn.onclick = (e) => {
          e.stopPropagation();
          handleEnter(doc.id, d);
        };
        btnWrap.appendChild(enterBtn);
        row.append(info, btnWrap);
        row.onclick = () => {
          if (canSpectate) handleSpectate(doc.id, d);
          else handleEnter(doc.id, d);
        };
        list.appendChild(row);
      });
    }
    searchIn.addEventListener("input", renderRooms);
    unsubList = db
      .collection("gameRooms")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snap) => {
          allDocs = [];
          snap.forEach((doc) => allDocs.push(doc));
          allDocs.forEach((doc) => evaluateGameAutoDelete(doc.id, doc.data()));
          renderRooms();
        },
        (err) => console.error("gameRooms list:", err),
      );
  }

  function handleEnter(roomId, data) {
    if (data.visibility === "public") tryJoinRoom(roomId, data);
    else showCodePopup(roomId, data, false);
  }
  function handleSpectate(roomId, data) {
    if (data.visibility === "public") trySpectateRoom(roomId, data);
    else showCodePopup(roomId, data, true);
  }

  function showCodePopup(roomId, data, spectateMode) {
    const overlay = mk("div");
    overlay.className = "gc-popup-wrap";
    const popup = mk("div");
    popup.className = "gc-popup";
    const title = mk(
      "div",
      "font-size:11px;font-weight:bold;color:#ccc;margin-bottom:2px;",
    );
    title.textContent = spectateMode
      ? "\uD83D\uDD12 Code to Watch"
      : "\uD83D\uDD12 Enter Code";
    const sub = mk(
      "div",
      "font-size:10px;color:rgba(255,255,255,0.45);margin-bottom:10px;",
    );
    sub.textContent = data.name;
    const codeIn = document.createElement("input");
    codeIn.type = "text";
    codeIn.maxLength = 4;
    codeIn.placeholder = "XXXX";
    codeIn.className = "gc-input";
    codeIn.style.cssText +=
      "width:100%;text-align:center;letter-spacing:6px;font-size:17px;font-weight:bold;text-transform:uppercase;margin-bottom:8px;";
    stopInput(codeIn);
    const errEl = mk(
      "div",
      "font-size:9px;color:#b44;min-height:12px;margin-bottom:6px;",
    );
    const btnRow = mk("div", "display:flex;gap:5px;");
    const cancelBtn = mkBtn("Cancel", "gc-btn", "flex:1;");
    cancelBtn.onclick = () => overlay.remove();
    const joinBtn = mkBtn(
      spectateMode ? "Watch" : "Join",
      "gc-btn gc-act",
      "flex:1;",
    );
    btnRow.append(cancelBtn, joinBtn);
    popup.append(title, sub, codeIn, errEl, btnRow);
    overlay.appendChild(popup);
    gamesContent.appendChild(overlay);
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
    setTimeout(() => codeIn.focus(), 40);
    async function tryJoin() {
  const v = codeIn.value.toUpperCase().trim();
  if (!v) return;
  joinBtn.disabled = true;
  joinBtn.textContent = "…";
  try {
    const snap = await db.collection("gameRooms").doc(roomId).get();
    const liveCode = (snap.exists ? (snap.data().code || "") : "").toUpperCase();
    if (v === liveCode) {
      overlay.remove();
      if (spectateMode) trySpectateRoom(roomId, snap.data());
      else tryJoinRoom(roomId, snap.data());
    } else {
      joinBtn.disabled = false;
      joinBtn.textContent = spectateMode ? "Watch" : "Join";
      errEl.textContent = "Wrong code.";
      popup.classList.add("gc-perr", "gc-shake");
      codeIn.value = "";
      setTimeout(() => {
        popup.classList.remove("gc-shake");
        setTimeout(() => { popup.classList.remove("gc-perr"); errEl.textContent = ""; }, 400);
      }, 380);
    }
  } catch(e) {
    joinBtn.disabled = false;
    joinBtn.textContent = spectateMode ? "Watch" : "Join";
    errEl.textContent = "Network error, try again.";
  }
}
joinBtn.onclick = tryJoin;
codeIn.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.key === "Enter") tryJoin();
});
}

  async function tryJoinRoom(roomId, data) {
    clearSubs();
    const user = getUser();
    const roomRef = db.collection("gameRooms").doc(roomId);
    const gameType = data.game || "chess";
    let assignedSlot = null,
      willSpectate = false;
    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists) return;
        const d = snap.data();
        const pl = d.players || {};
        
const upd = {};
        if (gameType === "chess") {
          if (pl.white === user) {
            assignedSlot = "white";
            return;
          }
          if (pl.black === user) {
            assignedSlot = "black";
            return;
          }
          if (!pl.white) {
            upd["players.white"] = user;
            assignedSlot = "white";
          } else if (!pl.black) {
            upd["players.black"] = user;
            assignedSlot = "black";
            if (d.status === "waiting") upd.status = "playing";
          } else {
            willSpectate = true;
            upd.spectatorCount = firebase.firestore.FieldValue.increment(1);
          }
        } else if (gameType === "battleship") {
          if (pl.p1 === user) { assignedSlot = "p1"; return; }
          if (pl.p2 === user) { assignedSlot = "p2"; return; }
          if (!pl.p1) {
            upd["players.p1"] = user; assignedSlot = "p1";
          } else if (!pl.p2) {
            upd["players.p2"] = user; assignedSlot = "p2";
            if (d.status === "waiting") upd.status = "placing";
          } else {
            willSpectate = true;
            upd.spectatorCount = firebase.firestore.FieldValue.increment(1);
          }
        }
        tx.update(roomRef, upd);
      });
    } catch (e) {
      console.error("join game room:", e);
    }
    cancelGameDelete(roomId);
    currentRoom = { id: roomId, ...data };
    myColor = assignedSlot;
    isSpectator = willSpectate;
    renderGame();
  }

  async function trySpectateRoom(roomId, data) {
    clearSubs();
    const roomRef = db.collection("gameRooms").doc(roomId);
    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists) return;
        tx.update(roomRef, {
          spectatorCount: firebase.firestore.FieldValue.increment(1),
        });
      });
    } catch (e) {
      console.error("spectate room:", e);
    }
    cancelGameDelete(roomId);
    currentRoom = { id: roomId, ...data };
    myColor = null;
    isSpectator = true;
    renderGame();
  }

  async function leaveRoom() {
    if (!currentRoom) {
      renderList();
      return;
    }
    const user = getUser();
    const roomRef = db.collection("gameRooms").doc(currentRoom.id);
    const gameType = currentRoom.game || "chess";
    if (isSpectator) {
      try {
        await roomRef.update({
          spectatorCount: firebase.firestore.FieldValue.increment(-1),
        });
      } catch (e) {
        console.warn("leaveRoom(spec):", e);
      }
    } else {
      try {
        await db.runTransaction(async (tx) => {
          const snap = await tx.get(roomRef);
          if (!snap.exists) return;
          const d = snap.data();
          const pl = d.players || {};
          const newCount = Math.max(0, (d.memberCount || 1) - 1);
          const upd = {
            memberCount: firebase.firestore.FieldValue.increment(-1),
          };
          if (newCount <= 0)
            upd.emptyAt = firebase.firestore.FieldValue.serverTimestamp();
          if (gameType === "chess") {
            if (d.status === "playing" || d.status === "check") {
              if (pl.white === user) {
                upd.status = "finished";
                upd.result = "black";
                upd.resultReason = "resigned";
                upd["players.white"] = null;
              } else if (pl.black === user) {
                upd.status = "finished";
                upd.result = "white";
                upd.resultReason = "resigned";
                upd["players.black"] = null;
              }
            } else if (pl.white === user) upd["players.white"] = null;
            else if (pl.black === user) upd["players.black"] = null;
          } else if (gameType === "yahtzee") {
            if (d.status === "playing") {
              if (pl.p1 === user) {
                upd.status = "finished";
                upd.result = "p2";
                upd.resultReason = "forfeit";
                upd["players.p1"] = null;
              } else if (pl.p2 === user) {
                upd.status = "finished";
                upd.result = "p1";
                upd.resultReason = "forfeit";
                upd["players.p2"] = null;
              }
            } else if (pl.p1 === user) upd["players.p1"] = null;
            else if (pl.p2 === user) upd["players.p2"] = null;
          } else if (gameType === "pool") {
            if (d.status === "playing") {
              if (pl.p1 === user) {
                upd.status = "finished";
                upd.result = "p2";
                upd.resultReason = "forfeit";
                upd["players.p1"] = null;
              } else if (pl.p2 === user) {
                upd.status = "finished";
                upd.result = "p1";
                upd.resultReason = "forfeit";
                upd["players.p2"] = null;
              }
            } else if (pl.p1 === user) upd["players.p1"] = null;
            else if (pl.p2 === user) upd["players.p2"] = null;
          }
          else if (gameType === "battleship") {
            if (d.status === "playing" || d.status === "placing") {
              if (pl.p1 === user) {
                upd.status = "finished"; upd.result = "p2";
                upd.resultReason = "forfeit"; upd["players.p1"] = null;
              } else if (pl.p2 === user) {
                upd.status = "finished"; upd.result = "p1";
                upd.resultReason = "forfeit"; upd["players.p2"] = null;
              }
            } else if (pl.p1 === user) upd["players.p1"] = null;
            else if (pl.p2 === user) upd["players.p2"] = null;
          }
          
          tx.update(roomRef, upd);
        });
      } catch (e) {
        console.warn("leaveRoom:", e);
      }
    }
    clearSubs();
    currentRoom = null;
    myColor = null;
    isSpectator = false;
    selectedSq = null;
    validTargets = [];
    renderList();
  }

  function renderCreate() {
    clearSubs();
    gamesContent.innerHTML = "";
    const wrap = mk(
      "div",
      "padding:7px 9px;display:flex;flex-direction:column;height:100%;",
    );
    const hdrRow = mk(
      "div",
      "display:flex;align-items:center;margin-bottom:10px;position:relative;",
    );
    const bk = mkBtn("<- Back", "gc-btn gc-sm", "flex-shrink:0;");
    bk.onclick = renderList;
    const titleEl = mk(
      "div",
      "position:absolute;left:50%;transform:translateX(-50%);font-size:12px;font-weight:bold;color:#ddd;white-space:nowrap;",
    );
    titleEl.textContent = "Create Game Room";
    hdrRow.append(bk, titleEl);
    wrap.appendChild(hdrRow);
    wrap.appendChild(mkLbl("Room Name"));
    const nameIn = document.createElement("input");
    nameIn.type = "text";
    nameIn.maxLength = 28;
    nameIn.placeholder = "Enter name...";
    nameIn.className = "gc-input";
    nameIn.style.cssText += "width:100%;margin-bottom:8px;display:block;";
    stopInput(nameIn);
    wrap.appendChild(nameIn);
    wrap.appendChild(mkLbl("Game"));
    const gameSel = document.createElement("select");
    gameSel.className = "gc-input";
    gameSel.style.cssText +=
      "width:100%;margin-bottom:8px;display:block;cursor:pointer;background-color:rgba(0,0,0,0.7);";
    [
      ["chess", "\u265f  Chess"],
      ["yahtzee", "\uD83C\uDFB2  Yahtzee"],
      ["pool", "\uD83C\uDFB1  8-Ball Pool"],
      ["connect4", "🔴  Connect 4"],
      ["battleship", "🚢  Battleship"],
    ].forEach(([val, label]) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = label;
      opt.style.cssText = "background:#111;color:#ddd;";
      gameSel.appendChild(opt);
    });
    stopInput(gameSel);
    let selectedGame = "chess";
    gameSel.onchange = () => {
      selectedGame = gameSel.value;
    };
    wrap.appendChild(gameSel);
    wrap.appendChild(mkLbl("Visibility"));
    const visRow = mk("div", "display:flex;gap:5px;margin-bottom:8px;");
    let isPrivate = false;
    const pubBtn = mkTgl("\uD83C\uDF10 Public", true),
      privBtn = mkTgl("\uD83D\uDD12 Private", false);
    visRow.append(pubBtn, privBtn);
    wrap.appendChild(visRow);
    const codeBox = mk(
      "div",
      "background:rgba(50,32,10,0.5);border:1px solid rgba(255,255,255,0.12);border-radius:5px;padding:7px 8px;margin-bottom:8px;text-align:center;display:none;",
    );
    const codeLbl = mk(
      "div",
      "font-size:9px;color:rgba(255,255,255,0.5);margin-bottom:3px;",
    );
    codeLbl.textContent = "Room Code - share with friends";
    const codeVal = mk(
      "div",
      "font-size:20px;font-weight:bold;color:#ccc;letter-spacing:10px;",
    );
    codeVal.textContent = "....";
    codeBox.append(codeLbl, codeVal);
    wrap.appendChild(codeBox);
    let generatedCode = "";
    pubBtn.onclick = () => {
      isPrivate = false;
      setTgl(pubBtn, true);
      setTgl(privBtn, false);
      codeBox.style.display = "none";
    };
    let codeGenerating = false;
privBtn.onclick = async () => {
  isPrivate = true;
  setTgl(privBtn, true);
  setTgl(pubBtn, false);
  codeBox.style.display = "block";
  if (!generatedCode && !codeGenerating) {
    codeGenerating = true;
    codeVal.textContent = "....";
    generatedCode = await genCode();
    codeVal.textContent = generatedCode;
    codeGenerating = false;
  }
};
    const createBtn = mkBtn(
      "Create Room",
      "gc-btn gc-act",
      "width:100%;margin-top:4px;",
    );
    createBtn.onclick = async () => {
      const name = nameIn.value.trim();
      if (!name) {
        nameIn.classList.add("gc-err");
        nameIn.focus();
        setTimeout(() => nameIn.classList.remove("gc-err"), 1400);
        return;
      }
      if (isPrivate && !generatedCode) {
  while (codeGenerating) await new Promise(r => setTimeout(r, 50));
  if (!generatedCode) {
    generatedCode = await genCode();
    codeVal.textContent = generatedCode;
  }
}
      createBtn.disabled = true;
      createBtn.textContent = "Creating...";
      const user = getUser();
      let data = {
        name,
        visibility: isPrivate ? "private" : "public",
        code: isPrivate ? generatedCode : null,
        game: selectedGame,
        status: "waiting",
        result: null,
        resultReason: null,
        memberCount: 1,
        spectatorCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      if (selectedGame === "chess") {
        const boardArr = Chess.initBoard();
        data = {
          ...data,
          players: { white: user, black: null },
          board: boardArr,
          turn: "w",
          castling: { wK: true, wQ: true, bK: true, bQ: true },
          enPassant: -1,
          lastMove: null,
        };
      } else if (selectedGame === "yahtzee") {
        const gs = Yahtzee.initGameState(user, null);
        data = { ...data, players: { p1: user, p2: null }, ...gs };
      } else if (selectedGame === "pool") {
        const gs = Pool.initGameState(user, null);
        data = { ...data, players: { p1: user, p2: null }, ...gs };
      }
      else if (selectedGame === "connect4") {
        const gs = Connect4.initGameState(user, null);
        data = { ...data, players: { p1: user, p2: null }, ...gs };
      }else if (selectedGame === "battleship") {
        const gs = Battleship.initGameState(user, null);
        data = { ...data, players: { p1: user, p2: null }, ...gs };
      }
      try {
        const ref = await db.collection("gameRooms").add(data);
        currentRoom = { id: ref.id, ...data, createdAt: Date.now() };
        myColor = selectedGame === "chess" ? "white" : "p1";
        isSpectator = false;
        renderGame();
      } catch (e) {
        console.error("Games: create room failed ->", e.message || e);
        createBtn.disabled = false;
        createBtn.textContent = "Create Room";
        const errEl =
          wrap.querySelector(".gc-create-err") ||
          mk(
            "div",
            "font-size:10px;color:#f88;margin-top:6px;text-align:center;",
          );
        errEl.className = "gc-create-err";
        errEl.textContent = "Error: " + (e.message || "check console");
        if (!wrap.contains(errEl)) wrap.appendChild(errEl);
      }
    };
    wrap.appendChild(createBtn);
    gamesContent.appendChild(wrap);
    setTimeout(() => nameIn.focus(), 50);
  }

  async function genCode() {
    const ch = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const rand = () =>
      Array.from(
        { length: 4 },
        () => ch[Math.floor(Math.random() * ch.length)],
      ).join("");
    let code = rand();
    try {
      let a = 0;
      while (a < 8) {
        const s = await db
          .collection("gameRooms")
          .where("code", "==", code)
          .get();
        if (s.empty) break;
        code = rand();
        a++;
      }
    } catch (_) {}
    return code;
  }

  function renderGame() {
    clearSubs();
    if (!currentRoom) {
      renderList();
      return;
    }
    const gameType = currentRoom.game || "chess";
   if (gameType === "yahtzee") renderYahtzeeGame();
    else if (gameType === "pool") renderPoolGame();
    else if (gameType === "connect4") renderConnect4Game();
    else if (gameType === "battleship") renderBattleshipGame();
    else renderChessGame();
  }

  function renderChessGame() {
    gamesContent.innerHTML = "";
    selectedSq = null;
    validTargets = [];
    const outer = mk("div", "display:flex;flex-direction:column;");
    gamesContent.appendChild(outer);
    const hdr = mk(
      "div",
      "position:relative;display:flex;align-items:center;padding:4px 8px;background:rgba(0,0,0,0.28);border-bottom:1px solid rgba(255,255,255,0.08);min-height:30px;flex-shrink:0;",
    );
    const bk = mkBtn(
      "<- Back",
      "gc-btn gc-sm",
      "flex-shrink:0;position:relative;z-index:1;",
    );
    bk.onclick = leaveRoom;
    hdr.appendChild(bk);
    const center = mk(
      "div",
      "position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;padding:0 60px;"

    );
    const rName = mk(
      "div",
      "font-size:11px;font-weight:bold;color:#ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;text-align:center;",
    );
    rName.textContent = currentRoom.name;
center.appendChild(rName);
if (currentRoom.visibility === 'private' && currentRoom.code) {
  const codeTag = mk("span", "font-size:8px;padding:1px 5px;border-radius:3px;letter-spacing:2px;font-weight:bold;background:rgba(65,42,12,0.65);color:rgba(210,158,65,0.9);border:1px solid rgba(170,110,22,0.3);margin-top:2px;pointer-events:auto;");
  codeTag.textContent = currentRoom.code;
  center.appendChild(codeTag);
}

    hdr.appendChild(center);
    const resignBtn = mkBtn(
      "Resign",
      "gc-btn gc-sm gc-danger",
      "flex-shrink:0;position:relative;z-index:1;margin-left:auto;",
    );
    resignBtn.onclick = handleChessResign;
    if (isSpectator) resignBtn.style.display = "none";
    hdr.appendChild(resignBtn);
    outer.appendChild(hdr);
    const boardArea = mk(
      "div",
      "flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:4px 0 6px;",
    );
    boardArea.className = "gc-scroll";
    outer.appendChild(boardArea);
    const topBar = mk("div");
    topBar.className = "gc-player-bar inactive";
    boardArea.appendChild(topBar);
    const boardEl = mk("div");
    boardEl.className = "gc-board";
    boardArea.appendChild(boardEl);
    const fileCoordsEl = mk("div");
    fileCoordsEl.className = "gc-coord-row";
    boardArea.appendChild(fileCoordsEl);
    const botBar = mk("div");
    botBar.className = "gc-player-bar inactive";
    boardArea.appendChild(botBar);
    const spectatorBar = mk("div");
    spectatorBar.className = "gc-spectator-bar";
    spectatorBar.style.display = isSpectator ? "flex" : "none";
    boardArea.appendChild(spectatorBar);
    const statusEl = mk("div");
    statusEl.className = "gc-status playing";
    boardArea.appendChild(statusEl);
    let latestGameData = null;
    function renderBoard(gd) {
      latestGameData = gd;
      const board = gd.board;
      const flipped = !isSpectator && myColor === "black";
      const lm = gd.lastMove;
      const inCheckColor = gd.status === "check" ? gd.turn : null;
      const kingCheckSq = inCheckColor ? board.indexOf(inCheckColor + "K") : -1;
      boardEl.innerHTML = "";
      const files = flipped
        ? ["h", "g", "f", "e", "d", "c", "b", "a"]
        : ["a", "b", "c", "d", "e", "f", "g", "h"];
      fileCoordsEl.innerHTML = "";
      files.forEach((f) => {
        const c = mk("div");
        c.className = "gc-coord";
        c.textContent = f;
        fileCoordsEl.appendChild(c);
      });
      for (let vi = 0; vi < 64; vi++) {
        const bi = flipped ? 63 - vi : vi;
        const r = Chess.row(bi),
          c = Chess.col(bi);
        const isLight = (r + c) % 2 !== 0;
        const cell = mk("div");
        cell.className = "gc-sq " + (isLight ? "light" : "dark");
        if (vi === selectedSq) cell.classList.add("selected");
        if (validTargets.includes(vi)) {
          if (board[bi]) cell.classList.add("capturable");
          else cell.classList.add("valid-move");
        }
        if (lm) {
          const lmFromVi = flipped ? 63 - lm.from : lm.from;
          const lmToVi = flipped ? 63 - lm.to : lm.to;
          if (vi === lmFromVi) cell.classList.add("last-from");
          if (vi === lmToVi) cell.classList.add("last-to");
        }
        if (bi === kingCheckSq) cell.classList.add("in-check");
        if (c === 0) {
          const rlbl = mk(
            "span",
            "position:absolute;left:2px;top:1px;font-size:7px;opacity:0.5;color:inherit;line-height:1;pointer-events:none;",
          );
          rlbl.textContent = flipped ? r + 1 : 8 - r;
          cell.appendChild(rlbl);
        }
        const piece = board[bi];
        if (piece) {
          const pc = mk("span");
          pc.className = "gc-piece " + (piece[0] === "w" ? "white" : "black");
          pc.textContent = Chess.GLYPHS[piece[1]] || "?";
          cell.appendChild(pc);
        }
        if (!isSpectator) {
          cell.addEventListener("click", () => handleChessSqClick(vi, bi, gd));
        } else {
          cell.style.cursor = "default";
        }
        boardEl.appendChild(cell);
      }
      const pl = gd.players || { white: null, black: null };
      const topColor = flipped ? "white" : "black",
        botColor = flipped ? "black" : "white";
      function fillBar(bar, color) {
        bar.innerHTML = "";
        const colorLabel = color === "white" ? "\u2654 White" : "\u265A Black";
        const name = pl[color] || "(waiting...)";
        const isActive =
          gd.status !== "waiting" &&
          gd.status !== "finished" &&
          gd.turn === (color === "white" ? "w" : "b");
        bar.className = "gc-player-bar " + (isActive ? "active" : "inactive");
        const dotClr = isActive
          ? "rgba(80,200,120,0.9)"
          : pl[color]
            ? "rgba(160,160,160,0.4)"
            : "rgba(80,80,80,0.3)";
        const dot = mk("span", "");
        dot.className = "gc-player-dot";
        dot.style.background = dotClr;
        const nameEl = mk("span", "");
        nameEl.className = "gc-player-name";
        nameEl.textContent = name;
        const clrEl = mk("span", "");
        clrEl.className = "gc-player-color";
        clrEl.textContent = colorLabel;
        bar.append(dot, nameEl, clrEl);
      }
      fillBar(topBar, topColor);
      fillBar(botBar, botColor);
      if (isSpectator) {
        const specCount = gd.spectatorCount || 0;
        spectatorBar.innerHTML = "";
        const eyeIcon = mk("span", "font-size:11px;");
        eyeIcon.textContent = "\uD83D\uDC41";
        const specText = mk("span", "");
        specText.textContent = "Spectating";
        const specCountEl = mk("span", "");
        specCountEl.className = "gc-spectator-count";
        specCountEl.textContent =
          specCount > 1 ? `\u00b7 ${specCount} watching` : "";
        spectatorBar.append(eyeIcon, specText, specCountEl);
        spectatorBar.style.display = "flex";
      }
      updateChessStatus(gd);
      const isFinished =
        gd.status === "finished" ||
        gd.status === "checkmate" ||
        gd.status === "stalemate";
      if (!isSpectator)
        resignBtn.style.display = myColor && !isFinished ? "" : "none";
      if (isFinished && !gamesContent.querySelector(".gc-gameover"))
        showChessGameOver(gd);
    }
    function updateChessStatus(gd) {
      const pl = gd.players || {};
      const user = getUser();
      if (gd.status === "waiting") {
        statusEl.className = "gc-status waiting";
        statusEl.textContent = isSpectator
          ? "Waiting for players..."
          : pl.white === user
            ? "Waiting for opponent to join..."
            : "Waiting for game to start...";
      } else if (
        gd.status === "checkmate" ||
        gd.status === "stalemate" ||
        gd.status === "finished"
      ) {
        statusEl.className = "gc-status finished";
        if (gd.status === "stalemate") {
          statusEl.textContent = "Stalemate - Draw!";
          return;
        }
        const winner = gd.result;
        const reason = gd.resultReason === "resigned" ? " (resigned)" : "";
        statusEl.textContent =
          winner === "draw"
            ? "Draw!"
            : winner
              ? `${winner[0].toUpperCase() + winner.slice(1)} wins!${reason}`
              : "Game over";
      } else {
        const myTurn =
          (myColor === "white" && gd.turn === "w") ||
          (myColor === "black" && gd.turn === "b");
        const turnName = gd.turn === "w" ? "White" : "Black";
        if (gd.status === "check") {
          statusEl.className = "gc-status check";
          statusEl.textContent = isSpectator
            ? `${turnName} is in check!`
            : myTurn
              ? "You are in check!"
              : "Opponent is in check!";
        } else {
          statusEl.className = "gc-status playing";
          statusEl.textContent = isSpectator
            ? `${turnName}'s turn`
            : myTurn
              ? "Your turn"
              : "Opponent's turn";
        }
      }
    }
    function handleChessSqClick(vi, bi, gd) {
      const isFinished =
        gd.status === "finished" ||
        gd.status === "checkmate" ||
        gd.status === "stalemate";
      if (!myColor || isFinished || gd.status === "waiting") return;
      const myTurn =
        (myColor === "white" && gd.turn === "w") ||
        (myColor === "black" && gd.turn === "b");
      const board = gd.board,
        piece = board[bi],
        myPieceColor = myColor === "white" ? "w" : "b";
      const flipped = myColor === "black";
      if (selectedSq !== null) {
        if (validTargets.includes(vi)) {
          const fromBi = flipped ? 63 - selectedSq : selectedSq;
          selectedSq = null;
          validTargets = [];
          renderBoard(gd);
          if (Chess.isPromotion(board, fromBi, bi))
            showChessPromotion(gd, fromBi, bi);
          else executeChessMove(gd, fromBi, bi, "Q");
          return;
        }
        if (piece && Chess.clr(piece) === myPieceColor && myTurn) {
          selectedSq = vi;
          validTargets = Chess.legalMoves(
            board,
            bi,
            gd.castling,
            gd.enPassant,
          ).map((m) => (flipped ? 63 - m : m));
          renderBoard(gd);
          return;
        }
        selectedSq = null;
        validTargets = [];
        renderBoard(gd);
        return;
      }
      if (piece && Chess.clr(piece) === myPieceColor && myTurn) {
        selectedSq = vi;
        validTargets = Chess.legalMoves(
          board,
          bi,
          gd.castling,
          gd.enPassant,
        ).map((m) => (flipped ? 63 - m : m));
        renderBoard(gd);
      }
    }
    async function executeChessMove(gd, from, to, promo) {
      const newGs = Chess.processMove(
        {
          board: gd.board,
          turn: gd.turn,
          castling: gd.castling,
          enPassant: gd.enPassant,
        },
        from,
        to,
        promo,
      );
      if (!newGs) return;
      try {
        const upd = {
          board: newGs.board,
          turn: newGs.turn,
          castling: newGs.castling,
          enPassant: newGs.enPassant,
          lastMove: newGs.lastMove,
          status: newGs.status,
          result: newGs.result || null,
        };
        if (newGs.status === "checkmate" || newGs.status === "stalemate")
          upd.status = "finished";
        await db.collection("gameRooms").doc(currentRoom.id).update(upd);
      } catch (e) {
        console.error("executeMove:", e);
      }
    }
    function showChessPromotion(gd, from, to) {
      const overlay = mk("div");
      overlay.className = "gc-popup-wrap";
      const popup = mk("div");
      popup.className = "gc-popup";
      popup.style.width = "175px";
      const title = mk(
        "div",
        "font-size:11px;font-weight:bold;color:#ccc;margin-bottom:6px;",
      );
      title.textContent = "Promote Pawn";
      const grid = mk("div");
      grid.className = "gc-promo-grid";
      const color = myColor === "white" ? "w" : "b";
      [
        ["Q", "Queen"],
        ["R", "Rook"],
        ["B", "Bishop"],
        ["N", "Knight"],
      ].forEach(([p, name]) => {
        const opt = mk("div");
        opt.className = "gc-promo-opt" + (color === "b" ? " black-piece" : "");
        opt.title = name;
        opt.textContent = Chess.GLYPHS[p];
        opt.style.color = color === "w" ? "#fff" : "#1a1008";
        opt.style.textShadow =
          color === "w"
            ? "0 1px 2px rgba(0,0,0,0.8)"
            : "0 1px 2px rgba(255,255,255,0.4)";
        opt.onclick = () => {
          overlay.remove();
          executeChessMove(gd, from, to, p);
        };
        grid.appendChild(opt);
      });
      popup.append(title, grid);
      overlay.appendChild(popup);
      gamesContent.appendChild(overlay);
    }
    function showChessGameOver(gd) {
      const overlay = mk("div");
      overlay.className = "gc-gameover";
      const box = mk("div");
      box.className = "gc-gameover-box";
      const trophy = mk("div", "font-size:28px;margin-bottom:6px;");
      const headline = mk(
        "div",
        "font-size:13px;font-weight:bold;color:#eee;margin-bottom:4px;",
      );
      const sub = mk(
        "div",
        "font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:10px;",
      );
      const pl = gd.players || {};
      let trophy_icon = "\uD83C\uDFC6",
        hl = "",
        sv = "";
      if (gd.status === "stalemate" || gd.result === "draw") {
        trophy_icon = "\uD83E\uDD1D";
        hl = "Draw!";
        sv = "Stalemate - no legal moves";
      } else if (gd.result === "white" || gd.result === "black") {
        const winner = gd.result;
        const winnerName =
          pl[winner] || winner[0].toUpperCase() + winner.slice(1);
        const reason =
          gd.resultReason === "resigned" ? " by resignation" : " by checkmate";
        if (isSpectator) {
          trophy_icon = "\uD83C\uDFAF";
          hl = `${winnerName} wins!`;
        } else if (pl[winner] === getUser()) {
          trophy_icon = "\uD83C\uDFC6";
          hl = "You win!";
        } else {
          trophy_icon = "\uD83D\uDC80";
          hl = "You lose!";
        }
        sv = `${winnerName} wins${reason}`;
      }
      trophy.textContent = trophy_icon;
      headline.textContent = hl;
      sub.textContent = sv;
      const closeBtn = mkBtn(
        "Back to lobby",
        "gc-btn gc-act",
        "margin-top:4px;width:100%;",
      );
      closeBtn.onclick = () => {
        overlay.remove();
        leaveRoom();
      };
      box.append(trophy, headline, sub, closeBtn);
      overlay.appendChild(box);
      gamesContent
        .querySelector(".gc-board")
        ?.parentElement?.appendChild(overlay) || boardArea.appendChild(overlay);
    }
    renderBoard(currentRoom);
    unsubRoom = db
      .collection("gameRooms")
      .doc(currentRoom.id)
      .onSnapshot(
        (snap) => {
          if (!snap.exists) {
            renderList();
            return;
          }
          const gd = snap.data();
          if (
            gd.turn !== latestGameData?.turn ||
            gd.status !== latestGameData?.status
          ) {
            selectedSq = null;
            validTargets = [];
          }
          renderBoard(gd);
        },
        (e) => console.error("room sub:", e),
      );
  }

  async function handleChessResign() {
    if (!currentRoom || !myColor || isSpectator) return;
    const winner = myColor === "white" ? "black" : "white";
    try {
      await db
        .collection("gameRooms")
        .doc(currentRoom.id)
        .update({
          status: "finished",
          result: winner,
          resultReason: "resigned",
        });
    } catch (e) {
      console.error("resign:", e);
    }
  }

  function renderYahtzeeGame() {
    gamesContent.innerHTML = "";
    const game = mk("div");
    game.className = "yh-game";
    gamesContent.appendChild(game);
    const hdr = mk(
      "div",
      "position:relative;display:flex;align-items:center;padding:4px 8px;background:rgba(0,0,0,0.5);border-bottom:1px solid rgba(212,175,55,0.15);min-height:28px;flex-shrink:0;",
    );
    const bk = mkBtn(
      "<- Back",
      "gc-btn gc-sm",
      "flex-shrink:0;position:relative;z-index:1;",
    );
    bk.onclick = leaveRoom;
    hdr.appendChild(bk);
    const centerHdr = mk(
      "div",
      "position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;pointer-events:none;",
    );
    const rName = mk(
      "div",
      "font-size:10px;font-weight:bold;color:rgba(212,175,55,0.6);letter-spacing:1px;",
    );
    rName.textContent = currentRoom.name;
    centerHdr.appendChild(rName);
    if (currentRoom.visibility === 'private' && currentRoom.code) {
      const codeTag = mk("span", "font-size:8px;padding:1px 5px;border-radius:3px;letter-spacing:2px;font-weight:bold;background:rgba(65,42,12,0.65);color:rgba(210,158,65,0.9);border:1px solid rgba(170,110,22,0.3);margin-top:2px;pointer-events:auto;");
      codeTag.textContent = currentRoom.code;
      centerHdr.appendChild(codeTag);
    }
    hdr.appendChild(centerHdr);
    game.appendChild(hdr);
    const scorebar = mk("div");
    scorebar.className = "yh-scorebar";

    const sb1 = mk("div");
    sb1.className = "yh-scorebar-half";
    const sb1name = mk("div");
    sb1name.className = "yh-sb-name";
    const sb1score = mk("div");
    sb1score.className = "yh-sb-score";
    sb1score.textContent = "0";
    const sb1you = mk("div");
    sb1you.className = "yh-sb-you";
    sb1.append(sb1name, sb1score, sb1you);
    const sbDiv = mk("div");
    sbDiv.className = "yh-scorebar-div";
    const sb2 = mk("div");
    sb2.className = "yh-scorebar-half";
    const sb2name = mk("div");
    sb2name.className = "yh-sb-name";
    const sb2score = mk("div");
    sb2score.className = "yh-sb-score";
    sb2score.textContent = "0";
    const sb2you = mk("div");
    sb2you.className = "yh-sb-you";
    sb2.append(sb2name, sb2score, sb2you);
    scorebar.append(sb1, sbDiv, sb2);
    game.appendChild(scorebar);
    const diceArea = mk("div");
    diceArea.className = "yh-dice-area";
    const statusTxt = mk("div");
    statusTxt.className = "yh-status-txt";
    diceArea.appendChild(statusTxt);
    const diceRow = mk("div");
    diceRow.className = "yh-dice-row";
    const dieDivs = [];
    for (let i = 0; i < 5; i++) {
      const d = mk("div");
      d.className = "yh-die yh-die-inactive";
      dieDivs.push(d);
      diceRow.appendChild(d);
    }
    diceArea.appendChild(diceRow);
    const rollArea = mk("div");
    rollArea.className = "yh-roll-area";
    const rollBtn = mk("button");
    rollBtn.className = "yh-roll-btn";
    rollBtn.textContent = "Roll Dice";
    rollBtn.disabled = true;
    const pipRow = mk("div");
    pipRow.className = "yh-pip-dots";
    const pips = [];
    for (let i = 0; i < 3; i++) {
      const p = mk("div");
      p.className = "yh-pip";
      pips.push(p);
      pipRow.appendChild(p);
    }
    rollArea.append(rollBtn, pipRow);
    diceArea.appendChild(rollArea);
    game.appendChild(diceArea);
    const trayBtn = mk("div");
    trayBtn.className = "yh-tray-btn";
    trayBtn.innerHTML =
      "\uD83D\uDCCB &nbsp;Score Card &nbsp;<span style='opacity:0.5;font-size:9px;'>&#9650;</span>";
    trayBtn.style.display = "none";
    game.appendChild(trayBtn);
    let latestGd = null,
      trayOpen = false,
      trayOverlayEl = null;
    const DOT_POS = {
      1: [[50, 50]],
      2: [
        [28, 28],
        [72, 72],
      ],
      3: [
        [28, 28],
        [50, 50],
        [72, 72],
      ],
      4: [
        [28, 28],
        [72, 28],
        [28, 72],
        [72, 72],
      ],
      5: [
        [28, 28],
        [72, 28],
        [50, 50],
        [28, 72],
        [72, 72],
      ],
      6: [
        [28, 28],
        [72, 28],
        [28, 50],
        [72, 50],
        [28, 72],
        [72, 72],
      ],
    };
    function drawDie(el, val, isHeld, inactive) {
      el.innerHTML = "";
      el.className =
        "yh-die" +
        (inactive ? " yh-die-inactive" : "") +
        (isHeld ? " yh-die-held" : "");
      if (val > 0) {
        (DOT_POS[val] || []).forEach(([x, y]) => {
          const dot = mk("span");
          dot.className = "yh-die-dot";
          dot.style.cssText = `left:${x}%;top:${y}%;transform:translate(-50%,-50%);`;
          el.appendChild(dot);
        });
        if (isHeld) {
          const lk = mk("span");
          lk.className = "yh-die-lock";
          lk.textContent = "\uD83D\uDD12";
          el.appendChild(lk);
        }
      } else {
        el.style.opacity = "0.3";
      }
    }
    function updateUI(gd) {
      latestGd = gd;
      const pl = gd.players || {};
      const mySlot = myColor;
      const isMyTurn =
        !isSpectator && gd.status === "playing" && gd.currentPlayer === mySlot;
      const dice = gd.dice || [0, 0, 0, 0, 0];
      const held = gd.held || [false, false, false, false, false];
      const rollsLeft = gd.rollsLeft != null ? gd.rollsLeft : 3;
      const scores = gd.scores || { p1: {}, p2: {} };
      const isFinished = gd.status === "finished";
      const hasRolled = rollsLeft < 3 && dice.some((d) => d > 0);
      const p1total = Yahtzee.grandTotal(scores.p1 || {});
      const p2total = Yahtzee.grandTotal(scores.p2 || {});
      sb1name.textContent = (pl.p1 || "Player 1").slice(0, 12);
      sb2name.textContent = (pl.p2 || "Waiting...").slice(0, 12);
      sb1score.textContent = p1total;
      sb2score.textContent = p2total;
      sb1you.textContent = mySlot === "p1" && !isSpectator ? "YOU" : "";
      sb2you.textContent = mySlot === "p2" && !isSpectator ? "YOU" : "";
      const p1active = gd.status === "playing" && gd.currentPlayer === "p1";
      const p2active = gd.status === "playing" && gd.currentPlayer === "p2";
      sb1.className = "yh-scorebar-half " + (p1active ? "active" : "inactive");
      sb2.className = "yh-scorebar-half " + (p2active ? "active" : "inactive");
      statusTxt.className = "yh-status-txt" + (isMyTurn ? " myturn" : "");
      if (gd.status === "waiting")
        statusTxt.textContent = "Waiting for opponent...";
      else if (isFinished) statusTxt.textContent = "";
      else if (isSpectator)
        statusTxt.textContent = `${pl[gd.currentPlayer] || gd.currentPlayer}'s turn`;
      else if (isMyTurn) {
        if (rollsLeft === 3)
          statusTxt.textContent = "Your turn - roll the dice!";
        else if (rollsLeft === 0)
          statusTxt.textContent = "No rolls left - pick a score";
        else statusTxt.textContent = "Hold dice to keep, then roll again";
      } else {
        statusTxt.textContent = `${pl[gd.currentPlayer] || "Opponent"}'s turn...`;
      }
      const inactive = !isMyTurn || isFinished || gd.status === "waiting";
      dieDivs.forEach((el, i) => {
        drawDie(el, dice[i], held[i], inactive || rollsLeft === 3);
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        dieDivs[i] = newEl;
        drawDie(newEl, dice[i], held[i], inactive || rollsLeft === 3);
        if (!inactive && rollsLeft < 3 && dice[i] > 0) {
          newEl.onclick = () => {
            const newHeld = [...held];
            newHeld[i] = !newHeld[i];
            db.collection("gameRooms")
              .doc(currentRoom.id)
              .update({ held: newHeld })
              .catch(console.error);
          };
        }
      });
      const canRoll =
        isMyTurn && rollsLeft > 0 && !isFinished && gd.status === "playing";
      rollBtn.disabled = !canRoll;
      rollBtn.textContent =
        rollsLeft === 3 ? "Roll Dice \uD83C\uDFB2" : "Roll Again \uD83C\uDFB2";
      pips.forEach((p, i) => {
        p.className = "yh-pip" + (i < 3 - rollsLeft ? " used" : "");
      });
      if (isMyTurn && hasRolled && !isFinished) {
        trayBtn.style.display = "block";
        trayBtn.className =
          "yh-tray-btn" + (rollsLeft === 0 ? " highlight" : "");
        trayBtn.innerHTML =
          "\uD83D\uDCCB &nbsp;Score Card &nbsp;<span style='opacity:0.5;font-size:9px;'>&#9650;</span>";
      } else if (isSpectator || !isMyTurn) {
        trayBtn.style.display = "block";
        trayBtn.className = "yh-tray-btn";
        trayBtn.innerHTML =
          "\uD83D\uDCCB &nbsp;View Scores &nbsp;<span style='opacity:0.5;font-size:9px;'>&#9650;</span>";
      } else {
        trayBtn.style.display = "none";
        if (trayOpen) closeTray();
      }
      if (isFinished && !gamesContent.querySelector(".yh-gameover-wrap")) {
        if (trayOpen) closeTray();
        showYahtzeeGameOver(gd, pl, scores);
      }
      if (trayOpen) openTray(true);
    }
    rollBtn.onclick = async () => {
      if (yhLocalRolling || !latestGd) return;
      const gd = latestGd;
      const dice = gd.dice || [0, 0, 0, 0, 0];
      const held = gd.held || [false, false, false, false, false];
      const rollsLeft = gd.rollsLeft != null ? gd.rollsLeft : 3;
      if (rollsLeft <= 0) return;
      yhLocalRolling = true;
      rollBtn.disabled = true;
      dieDivs.forEach((d, i) => {
        if (!held[i] || rollsLeft === 3) d.classList.add("yh-die-rolling");
      });
      setTimeout(async () => {
        dieDivs.forEach((d) => d.classList.remove("yh-die-rolling"));
        const newHeld =
          rollsLeft === 3 ? [false, false, false, false, false] : held;
        const newDice = Yahtzee.rollDice(dice, newHeld);
        const newRolls = rollsLeft - 1;
        const scores = gd.scores || { p1: {}, p2: {} };
        let slotScores = scores[myColor] || {};
        if (newDice.every((d) => d === newDice[0]) && newDice[0] > 0) {
          slotScores = Yahtzee.applyYahtzeeBonus(slotScores, newDice);
        }
        const upd = {
          dice: newDice,
          held: newHeld,
          rollsLeft: newRolls,
          [`scores.${myColor}`]: slotScores,
        };
        try {
          await db.collection("gameRooms").doc(currentRoom.id).update(upd);
        } catch (e) {
          console.error("roll:", e);
        }
        yhLocalRolling = false;
      }, 340);
    };
    function openTray(refresh) {
      if (!trayOverlayEl) {
        trayOverlayEl = mk("div");
        trayOverlayEl.className = "yh-tray-overlay";
        trayOverlayEl.onclick = (e) => {
          if (e.target === trayOverlayEl) closeTray();
        };
        game.appendChild(trayOverlayEl);
      }
      trayOverlayEl.style.display = "flex";
      const oldTray = trayOverlayEl.querySelector(".yh-tray");
      if (oldTray) oldTray.remove();
      const gd = latestGd;
      if (!gd) return;
      const pl = gd.players || {};
      const dice = gd.dice || [0, 0, 0, 0, 0];
      const rollsLeft = gd.rollsLeft != null ? gd.rollsLeft : 3;
      const scores = gd.scores || { p1: {}, p2: {} };
      const isMyTurn =
        !isSpectator && gd.status === "playing" && gd.currentPlayer === myColor;
      const hasRolled = rollsLeft < 3 && dice.some((d) => d > 0);
      const isFinished = gd.status === "finished";
      const mySlot = myColor;
      const tray = mk("div");
      tray.className = "yh-tray";
      const handle = mk("div");
      handle.className = "yh-tray-handle";
      const bar = mk("div");
      bar.className = "yh-tray-handle-bar";
      const ttl = mk("div");
      ttl.className = "yh-tray-title";
      ttl.textContent = "Score Card";
      handle.append(ttl, bar);
      handle.onclick = closeTray;
      tray.appendChild(handle);
      const colHdr = mk(
        "div",
        "display:flex;padding:4px 10px;gap:2px;border-bottom:1px solid rgba(255,255,255,0.07);",
      );
      const chCat = mk(
        "div",
        "flex:1;font-size:8px;color:rgba(255,255,255,0.35);",
      );
      chCat.textContent = "Category";
      colHdr.appendChild(chCat);
      ["p1", "p2"].forEach((slot) => {
        const ch = mk(
          "div",
          "width:28px;text-align:center;font-size:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
        );
        ch.style.color =
          slot === mySlot ? "rgba(100,220,120,0.75)" : "rgba(255,255,255,0.3)";
        ch.textContent = (pl[slot] || (slot === "p1" ? "P1" : "P2")).slice(
          0,
          4,
        );
        colHdr.appendChild(ch);
      });
      tray.appendChild(colHdr);
      const scroll = mk("div");
      scroll.className = "yh-tray-scroll";
      const CAT_ICONS = {
        ones: "1\uFE0F\u20E3",
        twos: "2\uFE0F\u20E3",
        threes: "3\uFE0F\u20E3",
        fours: "4\uFE0F\u20E3",
        fives: "5\uFE0F\u20E3",
        sixes: "6\uFE0F\u20E3",
        threeKind: "\uD83C\uDFAF",
        fourKind: "\uD83D\uDCA5",
        fullHouse: "\uD83C\uDFE0",
        smStraight: "\u3030\uFE0F",
        lgStraight: "\u26A1",
        yahtzee: "\u2B50",
        chance: "\uD83C\uDFB2",
      };
      function addSection(label) {
        const s = mk("div");
        s.className = "yh-tray-section";
        s.textContent = label;
        scroll.appendChild(s);
      }
      function addRow(cat) {
        const row = mk("div");
        row.className = "yh-tray-row";
        const icn = mk("div");
        icn.className = "yh-tray-icon";
        icn.textContent = CAT_ICONS[cat.id] || "*";
        const catInfo = mk("div");
        catInfo.className = "yh-tray-cat";
        const cn = mk("div");
        cn.className = "yh-tray-catname";
        cn.textContent = cat.label;
        const ch = mk("div");
        ch.className = "yh-tray-cathint";
        ch.textContent = cat.hint;
        catInfo.append(cn, ch);
        const scoreWrap = mk("div");
        scoreWrap.className = "yh-tray-scores";
        let canScore = false;
        ["p1", "p2"].forEach((slot) => {
          const sc = scores[slot] || {};
          const cell = mk("div");
          cell.className = "yh-tray-score";
          cell.style.width = "28px";
          if (sc[cat.id] != null) {
            cell.textContent = sc[cat.id];
            cell.className =
              "yh-tray-score " + (slot === mySlot ? "mine-done" : "opp-done");
          } else if (slot === mySlot && isMyTurn && hasRolled && !isFinished) {
            const pot = Yahtzee.calcScore(cat.id, dice);
            cell.textContent = pot;
            cell.className =
              "yh-tray-score " + (pot > 0 ? "mine-pot" : "mine-zero");
            canScore = true;
          } else {
            cell.textContent = "-";
            cell.className = "yh-tray-score empty";
          }
          scoreWrap.appendChild(cell);
        });
        row.append(icn, catInfo, scoreWrap);
        if (canScore) {
          row.classList.add("scoreable");
          row.onclick = () => {
            const sc = scores[myColor] || {};
            if (sc[cat.id] != null) return;
            const val = Yahtzee.calcScore(cat.id, dice);
            const newScores = { ...sc, [cat.id]: val };
            const nextPlayer = gd.currentPlayer === "p1" ? "p2" : "p1";
            const newTurns = (gd.turnsTotal || 0) + 1;
            const p1Done = Yahtzee.isComplete({
              ...(scores.p1 || {}),
              ...(gd.currentPlayer === "p1" ? { [cat.id]: val } : {}),
            });
            const p2Done = Yahtzee.isComplete({
              ...(scores.p2 || {}),
              ...(gd.currentPlayer === "p2" ? { [cat.id]: val } : {}),
            });
            const gameOver = newTurns >= 26 || (p1Done && p2Done);
            const upd = {
              [`scores.${gd.currentPlayer}`]: newScores,
              dice: Yahtzee.initDice(),
              held: Yahtzee.initHeld(),
              rollsLeft: 3,
              currentPlayer: gameOver ? gd.currentPlayer : nextPlayer,
              turnsTotal: newTurns,
            };
            if (gameOver) {
              upd.status = "finished";
              const sc1 = Yahtzee.grandTotal({
                ...(scores.p1 || {}),
                ...(gd.currentPlayer === "p1" ? { [cat.id]: val } : {}),
              });
              const sc2 = Yahtzee.grandTotal({
                ...(scores.p2 || {}),
                ...(gd.currentPlayer === "p2" ? { [cat.id]: val } : {}),
              });
              upd.result = sc1 > sc2 ? "p1" : sc2 > sc1 ? "p2" : "draw";
            }
            closeTray();
            db.collection("gameRooms")
              .doc(currentRoom.id)
              .update(upd)
              .catch((e) => console.error("score:", e));
          };
        }
        scroll.appendChild(row);
      }
      addSection("Upper Section");
      Yahtzee.CATEGORIES.filter((c) => c.section === "upper").forEach(addRow);
      const bonRow = mk("div");
      bonRow.className = "yh-tray-bonus";
      const bl = mk("div", "flex:1;");
      bl.textContent = "Bonus (>=63 upper -> +35)";
      bonRow.appendChild(bl);
      ["p1", "p2"].forEach((slot) => {
        const sc = scores[slot] || {};
        const ut = Yahtzee.upperTotal(sc);
        const bv = mk("div", "width:28px;text-align:center;font-weight:bold;");
        bv.textContent = ut >= 63 ? "+35" : ut > 0 ? `${63 - ut}` : "-";
        bonRow.appendChild(bv);
      });
      scroll.appendChild(bonRow);
      addSection("Lower Section");
      Yahtzee.CATEGORIES.filter((c) => c.section === "lower").forEach(addRow);
      const totRow = mk("div");
      totRow.className = "yh-tray-total";
      const tl = mk("div", "flex:1;color:rgba(255,255,255,0.6);");
      tl.textContent = "Total";
      totRow.appendChild(tl);
      ["p1", "p2"].forEach((slot) => {
        const tv = mk("div", "width:28px;text-align:center;color:#d4af37;");
        tv.textContent = Yahtzee.grandTotal(scores[slot] || {});
        totRow.appendChild(tv);
      });
      scroll.appendChild(totRow);
      tray.appendChild(scroll);
      trayOverlayEl.appendChild(tray);
      trayOpen = true;
    }
    function closeTray() {
      if (trayOverlayEl) trayOverlayEl.style.display = "none";
      trayOpen = false;
    }
    trayBtn.onclick = () => {
      if (trayOpen) closeTray();
      else openTray(false);
    };
    function showYahtzeeGameOver(gd, pl, scores) {
      const overlay = mk("div");
      overlay.className = "yh-gameover-wrap";
      const box = mk("div");
      box.className = "yh-gameover-box";
      const icon = mk("div", "font-size:32px;margin-bottom:6px;");
      const hl = mk(
        "div",
        "font-size:14px;font-weight:bold;color:#d4af37;margin-bottom:4px;",
      );
      const sub = mk(
        "div",
        "font-size:10px;color:rgba(255,255,255,0.45);margin-bottom:12px;",
      );
      const sc1 = Yahtzee.grandTotal(scores.p1 || {});
      const sc2 = Yahtzee.grandTotal(scores.p2 || {});
      const winner = gd.result;
      const user = getUser();
      if (winner === "draw") {
        icon.textContent = "\uD83E\uDD1D";
        hl.textContent = "It's a Draw!";
      } else {
        const winnerName = pl[winner] || winner;
        const reason = gd.resultReason === "forfeit" ? " (forfeit)" : "";
        if (isSpectator) {
          icon.textContent = "\uD83C\uDFAF";
          hl.textContent = winnerName + " wins!" + reason;
        } else if (pl[winner] === user) {
          icon.textContent = "\uD83C\uDFC6";
          hl.textContent = "You win!";
        } else {
          icon.textContent = "\uD83D\uDC80";
          hl.textContent = "You lose!";
        }
      }
      sub.textContent = `${pl.p1 || "P1"}: ${sc1} pts  \u00b7  ${pl.p2 || "P2"}: ${sc2} pts`;
      const closeBtn = mkBtn(
        "Back to lobby",
        "gc-btn gc-act",
        "margin-top:4px;width:100%;",
      );
      closeBtn.onclick = () => {
        overlay.remove();
        leaveRoom();
      };
      box.append(icon, hl, sub, closeBtn);
      overlay.appendChild(box);
      gamesContent.appendChild(overlay);
    }
    updateUI(currentRoom);
    unsubRoom = db
      .collection("gameRooms")
      .doc(currentRoom.id)
      .onSnapshot(
        (snap) => {
          if (!snap.exists) {
            renderList();
            return;
          }
          yhLocalRolling = false;
          updateUI(snap.data());
        },
        (e) => console.error("yahtzee sub:", e),
      );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  8-BALL POOL GAME VIEW
  // ════════════════════════════════════════════════════════════════════════════
  function renderPoolGame() {
    gamesContent.innerHTML = "";
    const game = mk("div");
    game.className = "pb-game";
    gamesContent.appendChild(game);
    const hdr = mk("div");
    hdr.className = "pb-hdr";
    const bk = mkBtn(
      "<- Back",
      "gc-btn gc-sm",
      "flex-shrink:0;position:relative;z-index:1;",
    );
    bk.onclick = () => {
      stopAnimation();
      ro.disconnect();
      leaveRoom();
    };
    const centerHdr = mk(
      "div",
      "position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;"

    );
    const rName = mk(
      "div",
      "font-size:10px;font-weight:bold;color:rgba(100,200,100,0.7);letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%;text-align:center;",
    );
    rName.textContent = currentRoom.name;
    centerHdr.appendChild(rName);
    const forfeitBtn = mkBtn(
      "Forfeit",
      "gc-btn gc-sm gc-danger",
      "flex-shrink:0;position:relative;z-index:1;margin-left:auto;",
    );
    forfeitBtn.onclick = () => {
      stopAnimation();
      ro.disconnect();
      leaveRoom();
    };
    if (isSpectator) forfeitBtn.style.display = "none";
    hdr.append(bk, centerHdr, forfeitBtn);
    game.appendChild(hdr);
    const scorebar = mk("div");
    scorebar.className = "pb-scorebar";
    const sb1 = mk("div");
    sb1.className = "pb-sb-half";
    const sb1name = mk("div");
    sb1name.className = "pb-sb-name";
    const sb1balls = mk("div");
    sb1balls.className = "pb-sb-balls";
    const sb1type = mk("div", "font-size:7px;color:rgba(255,255,255,0.35);");
    const sb1you = mk("div");
    sb1you.className = "pb-sb-you";
    sb1.append(sb1name, sb1balls, sb1type, sb1you);
    const sbDiv = mk("div");
    sbDiv.className = "pb-sb-div";
    const sb2 = mk("div");
    sb2.className = "pb-sb-half";
    const sb2name = mk("div");
    sb2name.className = "pb-sb-name";
    const sb2balls = mk("div");
    sb2balls.className = "pb-sb-balls";
    const sb2type = mk("div", "font-size:7px;color:rgba(255,255,255,0.35);");
    const sb2you = mk("div");
    sb2you.className = "pb-sb-you";
    sb2.append(sb2name, sb2balls, sb2type, sb2you);
    scorebar.append(sb1, sbDiv, sb2);
    game.appendChild(scorebar);
    const canvasWrap = mk("div");
    canvasWrap.className = "pb-canvas-wrap";
    const canvas = document.createElement("canvas");
    canvas.className = "pb-canvas";
    canvasWrap.appendChild(canvas);

    // ── DROP BUTTON (ball-in-hand placement) ─────────────────────────────────
    const dropBtn = mk("button");
    dropBtn.textContent = "Drop \uD83C\uDFB1";
    dropBtn.style.cssText =
      "position:absolute;bottom:12px;left:12px;padding:7px 18px;border-radius:14px;border:none;cursor:pointer;font-family:monospace;font-size:12px;font-weight:bold;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;box-shadow:0 3px 12px rgba(59,130,246,0.55);display:none;z-index:20;letter-spacing:0.3px;transition:opacity 0.12s,transform 0.12s;";
    dropBtn.onmouseenter = () => {
      dropBtn.style.opacity = "0.85";
      dropBtn.style.transform = "translateY(-1px)";
    };
    dropBtn.onmouseleave = () => {
      dropBtn.style.opacity = "1";
      dropBtn.style.transform = "";
    };
    dropBtn.onclick = () => {
      if (!bihPos || !latestGd) return;
      // Block drop if overlapping another ball
      const minDist = Pool.BALL_R * 2 + 1;
      const blocked = latestGd.balls.some(b =>
        !b.pocketed && b.id !== 0 &&
        Math.sqrt((b.x - bihPos.x) ** 2 + (b.y - bihPos.y) ** 2) < minDist
      );
      if (blocked) {
        dropBtn.style.background = "linear-gradient(135deg,#7f1d1d,#dc2626)";
        setTimeout(() => { dropBtn.style.background = "linear-gradient(135deg,#1e40af,#3b82f6)"; }, 500);
        return;
      }
      // Commit the cue ball position into latestGd so drawBalls sees the new spot
      const cb = latestGd.balls.find(b => b.id === 0);
      if (cb) { cb.x = bihPos.x; cb.y = bihPos.y; cb.pocketed = false; }
      const droppedBalls = latestGd.balls.map(b => ({ ...b }));
      ballInHand = false;
      bihPos = null;
      dropBtn.style.display = "none";
      shootBtn.disabled = false;
      shootBtn.style.background = "";
      shootBtn.style.boxShadow = "";
      shootBtn.title = "";
      drawBalls(latestGd.balls, true, null);
      db.collection("gameRooms").doc(currentRoom.id).update({ 
  balls: droppedBalls, 
  foul: false, 
  foulMsg: "" 
}).catch(console.error);
    };
    canvasWrap.appendChild(dropBtn);

    game.appendChild(canvasWrap);
    const controls = mk("div");
    controls.className = "pb-controls";
    const powerBar = mk("div");
    powerBar.className = "pb-power-bar";
    const powerFill = mk("div");
    powerFill.className = "pb-power-fill";
    powerFill.style.width = "50%";
    powerBar.appendChild(powerFill);
    const shootBtn = mk("button");
    shootBtn.className = "pb-shoot-btn";
    shootBtn.textContent = "Shoot \uD83C\uDFB1";
    shootBtn.disabled = true;
    const pMinus = mkBtn("-", "gc-btn gc-sm", "flex-shrink:0;padding:2px 8px;");
    const pPlus = mkBtn("+", "gc-btn gc-sm", "flex-shrink:0;padding:2px 8px;");
    const pwrWrap = mk(
      "div",
      "display:flex;align-items:center;gap:5px;margin-bottom:4px;",
    );
    const pwrLbl = mk(
      "div",
      "font-size:9px;color:rgba(255,255,255,0.4);flex-shrink:0;",
    );
    pwrLbl.textContent = "Power:";
    pwrWrap.append(pwrLbl, pMinus, powerBar, pPlus);
    const ctrlRow = mk("div");
    ctrlRow.className = "pb-ctrl-row";
    ctrlRow.style.justifyContent = "flex-end";
    ctrlRow.append(shootBtn);
    controls.append(pwrWrap, ctrlRow);
    game.appendChild(controls);

    const ctx = canvas.getContext("2d");
    const TW = Pool.TW,
      TH = Pool.TH,
      BR = Pool.BALL_R,
      PR = Pool.POCKET_R;
    let latestGd = null,
      aimAngle = Math.PI,
      power = 0.5,
      isAiming = false,
      ballInHand = false,
      bihPos = null;
    let animBalls = null,
      animRunning = false,
      animRafId = null,
      lastAnimatedShotKey = null,
      iWasTheShooter = false;

    function stopAnimation() {
      animRunning = false;
      if (animRafId) {
        cancelAnimationFrame(animRafId);
        animRafId = null;
      }
      animBalls = null;
    }

    function getScale() {
      const cw = canvasWrap.clientWidth - 8,
        ch = canvasWrap.clientHeight - 8;
      return Math.min(cw / TW, ch / TH, 2.0);
    }
    function resizeCanvas() {
      const s = getScale();
      canvas.width = Math.round(TW * s);
      canvas.height = Math.round(TH * s);
    }
    function toCanvas(lx, ly) {
      const s = getScale();
      return { x: lx * s, y: ly * s };
    }

    function lightenColor(hex, amt) {
      try {
        let r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)})`;
      } catch (e) {
        return hex;
      }
    }

    function drawBalls(balls, showAim, cueBallOverride) {
      const s = getScale();
      const W = canvas.width,
        H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#1a5c2e");
      grad.addColorStop(1, "#0d3d1d");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 3 * s;
      ctx.strokeRect(3 * s, 3 * s, W - 6 * s, H - 6 * s);
      ctx.setLineDash([4 * s, 4 * s]);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(TW * 0.25 * s, 0);
      ctx.lineTo(TW * 0.25 * s, H);
      ctx.stroke();
      Pool.POCKETS.forEach((p) => {
        const cp = toCanvas(p.x, p.y);
        const pg = ctx.createRadialGradient(
          cp.x,
          cp.y,
          0,
          cp.x,
          cp.y,
          PR * s * 1.15,
        );
        pg.addColorStop(0, "#000");
        pg.addColorStop(1, "rgba(0,0,0,0.4)");
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, PR * s * 1.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(90,65,30,0.9)";
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, PR * s, 0, Math.PI * 2);
        ctx.stroke();
      });
      balls.forEach((b) => {
        if (b.pocketed) return;
        const cp = toCanvas(b.x, b.y);
        const isStripe = b.id >= 9 && b.id <= 15;
        const color = Pool.BALL_COLORS[b.id] || "#888";
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.arc(cp.x + s, cp.y + 1.5 * s, BR * s, 0, Math.PI * 2);
        ctx.fill();
        if (isStripe) {
          const sbg = ctx.createRadialGradient(
            cp.x - BR * s * 0.3,
            cp.y - BR * s * 0.35,
            0,
            cp.x,
            cp.y,
            BR * s,
          );
          sbg.addColorStop(0, lightenColor(color, 40));
          sbg.addColorStop(1, color);
          ctx.fillStyle = sbg;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, BR * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.save();
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, BR * s, 0, Math.PI * 2);
          ctx.clip();
          ctx.fillStyle = "rgba(255,255,255,0.90)";
          ctx.fillRect(
            cp.x - BR * s,
            cp.y - BR * s * 0.38,
            BR * s * 2,
            BR * s * 0.76,
          );
          ctx.restore();
        } else {
          const bg = ctx.createRadialGradient(
            cp.x - BR * s * 0.3,
            cp.y - BR * s * 0.35,
            0,
            cp.x,
            cp.y,
            BR * s,
          );
          bg.addColorStop(0, lightenColor(color, 45));
          bg.addColorStop(1, color);
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, BR * s, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = "rgba(0,0,0,0.28)";
        ctx.lineWidth = 0.5 * s;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, BR * s, 0, Math.PI * 2);
        ctx.stroke();
        if (b.id !== 0) {
          ctx.fillStyle = "rgba(255,255,255,0.93)";
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, BR * s * 0.42, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#111";
          ctx.font = `bold ${Math.max(5, BR * s * 0.55)}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(b.id, cp.x, cp.y + 0.5);
        }
        if (b.id === 0) {
          const shine = ctx.createRadialGradient(
            cp.x - BR * s * 0.38,
            cp.y - BR * s * 0.38,
            0,
            cp.x,
            cp.y,
            BR * s,
          );
          shine.addColorStop(0, "rgba(255,255,255,0.82)");
          shine.addColorStop(0.38, "rgba(255,255,255,0.12)");
          shine.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = shine;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, BR * s, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      if (cueBallOverride) {
        const cp = toCanvas(cueBallOverride.x, cueBallOverride.y);
        ctx.save();
        ctx.globalAlpha = 0.7;
        const cg = ctx.createRadialGradient(
          cp.x - BR * s * 0.3,
          cp.y - BR * s * 0.3,
          0,
          cp.x,
          cp.y,
          BR * s,
        );
        cg.addColorStop(0, "rgba(200,230,255,0.98)");
        cg.addColorStop(1, "rgba(120,180,255,0.7)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, BR * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(100,200,255,0.9)";
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, BR * s + 3 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      if (showAim) {
        const cueBall = balls.find((b) => b.id === 0 && !b.pocketed);
        if (cueBall) {
          const cp = toCanvas(cueBall.x, cueBall.y);
          ctx.setLineDash([5 * s, 7 * s]);
          ctx.strokeStyle = "rgba(255,255,255,0.22)";
          ctx.lineWidth = s;
          const lineLen = Math.max(W, H) * 1.5;
          ctx.beginPath();
          ctx.moveTo(cp.x, cp.y);
          ctx.lineTo(
            cp.x + Math.cos(aimAngle) * lineLen,
            cp.y + Math.sin(aimAngle) * lineLen,
          );
          ctx.stroke();
          ctx.setLineDash([]);
          const ghost = findFirstCollision(balls, cueBall, aimAngle);
          if (ghost) {
            const gcp = toCanvas(ghost.x, ghost.y);
            ctx.strokeStyle = "rgba(255,255,255,0.18)";
            ctx.lineWidth = s;
            ctx.beginPath();
            ctx.arc(gcp.x, gcp.y, BR * s, 0, Math.PI * 2);
            ctx.stroke();
          }
          const gap = BR * s + 5 * s * (1 + power * 0.5);
          const stickLen = 85 * s;
          const sx = cp.x - Math.cos(aimAngle) * (stickLen + gap);
          const sy = cp.y - Math.sin(aimAngle) * (stickLen + gap);
          const ex = cp.x - Math.cos(aimAngle) * gap;
          const ey = cp.y - Math.sin(aimAngle) * gap;
          const cg = ctx.createLinearGradient(sx, sy, ex, ey);
          cg.addColorStop(0, "#3a1e06");
          cg.addColorStop(0.65, "#b88840");
          cg.addColorStop(1, "#e8d49a");
          ctx.strokeStyle = cg;
          ctx.lineWidth = Math.max(2, 4 * s * (1 - power * 0.25));
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          ctx.lineCap = "butt";
        }
      }
    }

    function findFirstCollision(balls, cueBall, angle) {
      const dx = Math.cos(angle),
        dy = Math.sin(angle);
      let best = null,
        bestT = Infinity;
      balls.forEach((b) => {
        if (b.pocketed || b.id === 0) return;
        const ex = b.x - cueBall.x,
          ey = b.y - cueBall.y;
        const dot = ex * dx + ey * dy;
        if (dot < 0) return;
        const cx = ex - dot * dx,
          cy = ey - dot * dy;
        const cross = cx * cx + cy * cy;
        const diam = BR * 2;
        if (cross > diam * diam) return;
        const t = dot - Math.sqrt(diam * diam - cross);
        if (t > 0 && t < bestT) {
          bestT = t;
          best = { x: cueBall.x + dx * t, y: cueBall.y + dy * t };
        }
      });
      return best;
    }

    function startAnimation(liveBalls, onDone) {
      stopAnimation();
      animBalls = liveBalls;
      animRunning = true;
      const STEPS_PER_FRAME = 1;
      function frame() {
        if (!animRunning) return;
        let stillMoving = false;
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          if (Pool.stepPhysics(animBalls)) stillMoving = true;
        }
        drawBalls(animBalls, false, null);
        if (stillMoving) {
          animRafId = requestAnimationFrame(frame);
        } else {
          animRunning = false;
          animRafId = null;
          onDone(animBalls);
        }
      }
      animRafId = requestAnimationFrame(frame);
    }

    function getEvtPos(e) {
      const rect = canvas.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      return { x: src.clientX - rect.left, y: src.clientY - rect.top };
    }
    function toLogical(cx, cy) {
      const s = getScale();
      return { x: cx / s, y: cy / s };
    }
    function updateAim(e) {
      if (!latestGd || animRunning) return;
      const balls = latestGd.balls || [];
      const pos = getEvtPos(e);
      if (ballInHand) {
        const lp = toLogical(pos.x, pos.y);
        const margin = Pool.BALL_R + 2;
        bihPos = {
          x: Math.max(margin, Math.min(Pool.TW - margin, lp.x)),
          y: Math.max(margin, Math.min(Pool.TH - margin, lp.y)),
        };
        drawBalls(balls, false, bihPos);
        return;
      }
      const cue = balls.find((b) => b.id === 0 && !b.pocketed);
      if (!cue) return;
      const cp = toCanvas(cue.x, cue.y);
      aimAngle = Math.atan2(pos.y - cp.y, pos.x - cp.x);
      drawBalls(balls, true, null);
    }

    canvas.addEventListener("mousedown", (e) => {
      if (!latestGd || animRunning) return;
      const myTurn =
        !isSpectator &&
        latestGd.status === "playing" &&
        latestGd.currentPlayer === myColor;
      if (!myTurn) return;
      isAiming = true;
      updateAim(e);
    });
    canvas.addEventListener("mousemove", (e) => {
      if (isAiming) updateAim(e);
    });
    canvas.addEventListener("mouseup", () => {
      isAiming = false;
    });
    canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        if (!latestGd || animRunning) return;
        const myTurn =
          !isSpectator &&
          latestGd.status === "playing" &&
          latestGd.currentPlayer === myColor;
        if (!myTurn) return;
        isAiming = true;
        updateAim(e);
      },
      { passive: false },
    );
    canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        if (isAiming) updateAim(e);
      },
      { passive: false },
    );
    canvas.addEventListener("touchend", () => {
      isAiming = false;
    });
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        power = Math.max(0.05, Math.min(1, power - e.deltaY * 0.002));
        powerFill.style.width = power * 100 + "%";
        if (latestGd && !animRunning)
          drawBalls(latestGd.balls || [], true, null);
      },
      { passive: false },
    );
    pMinus.onclick = () => {
      power = Math.max(0.05, power - 0.1);
      powerFill.style.width = power * 100 + "%";
      if (latestGd && !animRunning) drawBalls(latestGd.balls || [], true, null);
    };
    pPlus.onclick = () => {
      power = Math.min(1, power + 0.1);
      powerFill.style.width = power * 100 + "%";
      if (latestGd && !animRunning) drawBalls(latestGd.balls || [], true, null);
    };

    shootBtn.onclick = async () => {
      if (!latestGd || animRunning) return;
      const myTurn =
        !isSpectator &&
        latestGd.status === "playing" &&
        latestGd.currentPlayer === myColor;
      if (!myTurn) return;
      shootBtn.disabled = true;
      dropBtn.style.display = "none";
      iWasTheShooter = true;
      const gdAtShot = latestGd;
      const ballsBefore = gdAtShot.balls.map((b) => ({ ...b }));
      const liveBalls = gdAtShot.balls.map((b) => ({ ...b }));
      const cue = liveBalls.find((b) => b.id === 0);
      if (!cue) {
        shootBtn.disabled = false;
        return;
      }
      if (ballInHand && bihPos) {
        cue.x = bihPos.x;
        cue.y = bihPos.y;
        cue.pocketed = false;
      }
      ballInHand = false;
      bihPos = null;
      const speed = power * 20;
      cue.vx = Math.cos(aimAngle) * speed;
      cue.vy = Math.sin(aimAngle) * speed;
      const shotKey = Date.now();
      const shotData = {
        angle: aimAngle,
        power,
        preShotBalls: ballsBefore,
        key: shotKey,
      };
      // Immediately broadcast shot so opponent animates in sync
      try {
        await db.collection("gameRooms").doc(currentRoom.id).update({
          lastShot: { angle: aimAngle, power, key: shotKey, preShotBalls: ballsBefore },
          shotInProgress: true,
        });
      } catch (e) {
        console.error("pool shot broadcast:", e);
      }
      startAnimation(liveBalls, async (finalBalls) => {
        const resolvedGd = Pool.resolveShot(gdAtShot, ballsBefore, finalBalls);
        resolvedGd.lastShot = { ...shotData, preShotBalls: ballsBefore };
        if (resolvedGd.foul && resolvedGd.foulMsg) {
          const banner = mk("div");
          banner.className = "pb-foul-banner";
          banner.textContent = resolvedGd.foulMsg;
          canvasWrap.appendChild(banner);
          setTimeout(() => banner.parentNode && banner.remove(), 2500);
        }
        try {
          const upd = {
            balls: resolvedGd.balls,
            currentPlayer: resolvedGd.currentPlayer,
            p1Type: resolvedGd.p1Type,
            p2Type: resolvedGd.p2Type,
            breakShot: resolvedGd.breakShot,
            foul: resolvedGd.foul,
            foulMsg: resolvedGd.foulMsg,
            status: resolvedGd.status,
            result: resolvedGd.result || null,
            resultReason: resolvedGd.resultReason || null,
            lastShot: {
              angle: aimAngle,
              power,
              key: shotKey,
              preShotBalls: ballsBefore,
            },
            shotInProgress: false,
          };
          await db.collection("gameRooms").doc(currentRoom.id).update(upd);
        } catch (e) {
          console.error("pool shot commit:", e);
        }
        const nextIsMe =
          !isSpectator &&
          resolvedGd.currentPlayer === myColor &&
          resolvedGd.status === "playing";
        if (nextIsMe) {
          if (resolvedGd.foul) {
            ballInHand = true;
            bihPos = { x: Pool.TW * 0.25, y: Pool.TH / 2 };
            dropBtn.style.display = "block";
          }
          latestGd = resolvedGd;
          shootBtn.disabled = false;
          drawBalls(resolvedGd.balls, !ballInHand, ballInHand ? bihPos : null);
        }
      });
    };

    function updateScorebar(gd) {
      const pl = gd.players || {};
      const balls = gd.balls || [];
      const mySlot = myColor;
      sb1name.textContent = (pl.p1 || "Player 1").slice(0, 14);
      sb2name.textContent = (pl.p2 || "Waiting...").slice(0, 14);
      sb1you.textContent = mySlot === "p1" && !isSpectator ? "YOU" : "";
      sb2you.textContent = mySlot === "p2" && !isSpectator ? "YOU" : "";
      sb1.className =
        "pb-sb-half " +
        (gd.currentPlayer === "p1" && gd.status === "playing"
          ? "active"
          : "inactive");
      sb2.className =
        "pb-sb-half " +
        (gd.currentPlayer === "p2" && gd.status === "playing"
          ? "active"
          : "inactive");
      function fillBalls(el, type) {
        el.innerHTML = "";
        if (!type) {
          const ph = mk("span", "font-size:8px;color:rgba(255,255,255,0.2);");
          ph.textContent = "?";
          el.appendChild(ph);
          return;
        }
        const isSolid = type === "solids";
        for (let id = isSolid ? 1 : 9; id <= (isSolid ? 7 : 15); id++) {
          const inPlay = balls.find((b) => b.id === id && !b.pocketed);
          const dot = mk("div");
          dot.className = "pb-sb-ball";
          dot.style.background = inPlay
            ? Pool.BALL_COLORS[id]
            : "rgba(255,255,255,0.1)";
          dot.style.opacity = inPlay ? "1" : "0.3";
          el.appendChild(dot);
        }
        const eight = balls.find((b) => b.id === 8 && !b.pocketed);
        const eDot = mk("div");
        eDot.className = "pb-sb-ball";
        eDot.style.background = eight ? "#111" : "rgba(255,255,255,0.1)";
        eDot.style.opacity = eight ? "1" : "0.3";
        eDot.style.border = eight
          ? "1px solid rgba(255,255,255,0.3)"
          : "1px solid rgba(0,0,0,0.3)";
        el.appendChild(eDot);
      }
      fillBalls(sb1balls, gd.p1Type);
      fillBalls(sb2balls, gd.p2Type);
      sb1type.textContent = gd.p1Type
        ? gd.p1Type === "solids"
          ? "\u25cf Solids"
          : "\u25d1 Stripes"
        : "--";
      sb2type.textContent = gd.p2Type
        ? gd.p2Type === "solids"
          ? "\u25cf Solids"
          : "\u25d1 Stripes"
        : "--";
    }

    function updateUI(gd) {
      const isMe = !isSpectator && gd.status === "playing" && gd.currentPlayer === myColor;
      const isFinished = gd.status === "finished";
      const pl = gd.players || {};
      updateScorebar(gd);
      const shot = gd.lastShot;
      if (
        shot &&
        shot.key &&
        shot.key !== lastAnimatedShotKey &&
        !animRunning &&
        !iWasTheShooter
      ) {
        lastAnimatedShotKey = shot.key;
        const replayBalls = (shot.preShotBalls || gd.balls).map((b) => ({
          ...b,
        }));
        const cue = replayBalls.find((b) => b.id === 0);
        if (cue) {
          const spd = (shot.power || 0.5) * 20;
          cue.vx = Math.cos(shot.angle || 0) * spd;
          cue.vy = Math.sin(shot.angle || 0) * spd;
          latestGd = gd;
          startAnimation(replayBalls, () => {
            iWasTheShooter = false;
            updateUI(latestGd);
          });
          return;
        }
      }
      if (shot && shot.key) lastAnimatedShotKey = shot.key;
      iWasTheShooter = false;
      latestGd = gd;
      if (isMe && !isFinished && gd.foul && !ballInHand && !gd.shotInProgress) {
  ballInHand = true;
  const cb = gd.balls && gd.balls.find((b) => b.id === 0 && !b.pocketed);
  bihPos = cb
    ? { x: cb.x, y: cb.y }
    : { x: Pool.TW * 0.25, y: Pool.TH / 2 };
} else if (!isMe || isFinished) {
        ballInHand = false;
        bihPos = null;
      }
      shootBtn.disabled = !isMe || isFinished || animRunning || ballInHand;
      shootBtn.style.background = (isMe && !isFinished && ballInHand)
        ? "linear-gradient(135deg,#7f1d1d,#dc2626)"
        : "";
      shootBtn.style.boxShadow = (isMe && !isFinished && ballInHand)
        ? "0 2px 8px rgba(220,38,38,0.4)"
        : "";
      shootBtn.title = (isMe && !isFinished && ballInHand)
        ? "Place the cue ball first" : "";
      dropBtn.style.display =
        isMe && !isFinished && ballInHand ? "block" : "none";
      if (!animRunning) {
        resizeCanvas();
        drawBalls(
          gd.balls || [],
          isMe && !isFinished && !ballInHand,
          ballInHand ? bihPos : null,
        );
      }
      if (isFinished && !gamesContent.querySelector(".pb-gameover-wrap")) {
        stopAnimation();
        showPoolGameOver(gd, pl);
      }
    }

    function showPoolGameOver(gd, pl) {
      const overlay = mk("div");
      overlay.className = "pb-gameover-wrap";
      const box = mk("div");
      box.className = "pb-gameover-box";
      const icon = mk("div", "font-size:32px;margin-bottom:8px;");
      const hl = mk(
        "div",
        "font-size:14px;font-weight:bold;color:#64c864;margin-bottom:4px;",
      );
      const sub = mk(
        "div",
        "font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:12px;",
      );
      const winner = gd.result;
      const user = getUser();
      if (isSpectator) {
        icon.textContent = "\uD83C\uDFB1";
        hl.textContent = (pl[winner] || winner) + " wins!";
      } else if (pl[winner] === user) {
        icon.textContent = "\uD83C\uDFC6";
        hl.textContent = "You win!";
      } else {
        icon.textContent = "\uD83D\uDC80";
        hl.textContent = "You lose!";
      }
      sub.textContent = gd.resultReason || "Game over";
      const closeBtn = mkBtn(
        "Back to lobby",
        "gc-btn gc-act",
        "margin-top:4px;width:100%;font-size:11px;",
      );
      closeBtn.onclick = () => {
        overlay.remove();
        stopAnimation();
        leaveRoom();
      };
      box.append(icon, hl, sub, closeBtn);
      overlay.appendChild(box);
      gamesContent.appendChild(overlay);
    }

    const ro = new ResizeObserver(() => {
      resizeCanvas();
      const balls = animRunning ? animBalls : latestGd && latestGd.balls;
      if (balls) {
        const isMe =
          latestGd &&
          !isSpectator &&
          latestGd.currentPlayer === myColor &&
          !animRunning;
        drawBalls(balls, isMe, null);
      }
    });
    ro.observe(canvasWrap);
    resizeCanvas();
    updateUI(currentRoom);
    unsubRoom = db
      .collection("gameRooms")
      .doc(currentRoom.id)
      .onSnapshot(
        (snap) => {
          if (!snap.exists) {
            stopAnimation();
            renderList();
            return;
          }
          updateUI(snap.data());
        },
        (e) => console.error("pool sub:", e),
      );
  }
function renderConnect4Game() {
    gamesContent.innerHTML = "";
    const game = mk("div");
    game.className = "c4-game";
    gamesContent.appendChild(game);

    // Header
    const hdr = mk("div","position:relative;display:flex;align-items:center;padding:4px 8px;background:rgba(0,0,0,0.5);border-bottom:1px solid rgba(80,120,255,0.15);min-height:28px;flex-shrink:0;");
    const bk = mkBtn("<- Back","gc-btn gc-sm","flex-shrink:0;position:relative;z-index:1;");
    bk.onclick = leaveRoom;
    const centerHdr = mk("div","position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;");
    const rName = mk("div","font-size:10px;font-weight:bold;color:rgba(100,140,255,0.7);letter-spacing:1px;");
    rName.textContent = currentRoom.name;
    centerHdr.appendChild(rName);
    if (currentRoom.visibility === "private" && currentRoom.code) {
      const ct = mk("span","font-size:8px;padding:1px 5px;border-radius:3px;letter-spacing:2px;font-weight:bold;background:rgba(12,22,65,0.65);color:rgba(120,160,255,0.9);border:1px solid rgba(70,100,220,0.3);margin-top:2px;pointer-events:auto;");
      ct.textContent = currentRoom.code;
      centerHdr.appendChild(ct);
    }
    const forfeitBtn = mkBtn("Forfeit","gc-btn gc-sm gc-danger","flex-shrink:0;position:relative;z-index:1;margin-left:auto;");
    forfeitBtn.onclick = leaveRoom;
    if (isSpectator) forfeitBtn.style.display = "none";
    hdr.append(bk, centerHdr, forfeitBtn);
    game.appendChild(hdr);

    // Scorebar
    const scorebar = mk("div"); scorebar.className = "c4-scorebar";
    const sb1 = mk("div"); sb1.className = "c4-sb-half";
    const sb1name = mk("div"); sb1name.className = "c4-sb-name";
    const sb1disc = mk("div"); sb1disc.className = "c4-sb-disc r";
    const sb1you = mk("div"); sb1you.className = "c4-sb-you";
    sb1.append(sb1name, sb1disc, sb1you);
    const sbDiv = mk("div"); sbDiv.className = "c4-sb-div";
    const sb2 = mk("div"); sb2.className = "c4-sb-half";
    const sb2name = mk("div"); sb2name.className = "c4-sb-name";
    const sb2disc = mk("div"); sb2disc.className = "c4-sb-disc y";
    const sb2you = mk("div"); sb2you.className = "c4-sb-you";
    sb2.append(sb2name, sb2disc, sb2you);
    scorebar.append(sb1, sbDiv, sb2);
    game.appendChild(scorebar);

    // Board
    const boardWrap = mk("div"); boardWrap.className = "c4-board-wrap";
    const boardEl = mk("div"); boardEl.className = "c4-board";
    const colEls = [];
    for (let c = 0; c < Connect4.COLS; c++) {
      const col = mk("div"); col.className = "c4-col inactive";
      const arrow = mk("div"); arrow.className = "c4-col-arrow"; arrow.textContent = "▼";
      col.appendChild(arrow);
      const cells = [];
      for (let r = 0; r < Connect4.ROWS; r++) {
        const cell = mk("div"); cell.className = "c4-cell";
        col.appendChild(cell); cells.push(cell);
      }
      colEls.push({ col, cells, arrow });
      boardEl.appendChild(col);
    }
    boardWrap.appendChild(boardEl);
    game.appendChild(boardWrap);

    const statusEl = mk("div"); statusEl.className = "c4-status waiting";
    game.appendChild(statusEl);

    let latestGd = null;

    function renderBoard(gd) {
      latestGd = gd;
      const pl = gd.players || {};
      const board = gd.board || Connect4.initBoard();
      const isFinished = gd.status === "finished";
      const isMyTurn = !isSpectator && gd.status === "playing" && gd.currentPlayer === myColor;
      const myDisc = myColor === "p1" ? "r" : "y";
      const winCells = gd.winCells || [];

      sb1name.textContent = (pl.p1 || "Player 1").slice(0, 12);
      sb2name.textContent = (pl.p2 || "Waiting...").slice(0, 12);
      sb1you.textContent = myColor === "p1" && !isSpectator ? "YOU" : "";
      sb2you.textContent = myColor === "p2" && !isSpectator ? "YOU" : "";
      sb1.className = "c4-sb-half " + (gd.status==="playing"&&gd.currentPlayer==="p1" ? "active" : "inactive");
      sb2.className = "c4-sb-half " + (gd.status==="playing"&&gd.currentPlayer==="p2" ? "active" : "inactive");

      for (let c = 0; c < Connect4.COLS; c++) {
        const { col, cells, arrow } = colEls[c];
        const colFull = Connect4.getCell(board, 0, c) !== null;
        const canClick = isMyTurn && !isFinished && !colFull;
        col.className = "c4-col" + (canClick ? "" : " inactive");
        arrow.style.color = myDisc === "r" ? "#ff8080" : "#ffe566";
        col.onclick = canClick ? () => handleDrop(c) : null;
        for (let r = 0; r < Connect4.ROWS; r++) {
          const val = Connect4.getCell(board, r, c);
          const isWin = winCells.some(wc => wc.r===r && wc.c===c);
          // preserve drop animation class if this cell was just placed
          const wasDropping = cells[r].classList.contains("drop");
          cells[r].className = "c4-cell" + (val ? " "+val : "") + (isWin ? " win" : "") + (wasDropping ? " drop" : "");
        }
      }

      statusEl.className = "c4-status" + (isMyTurn ? " myturn" : gd.status==="waiting" ? " waiting" : "");
      if (gd.status === "waiting") statusEl.textContent = "Waiting for opponent...";
      else if (isFinished) statusEl.textContent = "";
      else if (isSpectator) {
        const whose = pl[gd.currentPlayer] || gd.currentPlayer;
        statusEl.textContent = `${whose}'s turn`;
      } else if (isMyTurn) {
        statusEl.textContent = "Your turn — click a column!";
      } else {
        statusEl.textContent = `${pl[gd.currentPlayer] || "Opponent"}'s turn...`;
      }

      if (isFinished && !gamesContent.querySelector(".c4-gameover-wrap")) {
        showConnect4GameOver(gd, pl);
      }
    }

    async function handleDrop(col) {
      if (!latestGd || !myColor || isSpectator) return;
      const gd = latestGd;
      if (gd.status !== "playing" || gd.currentPlayer !== myColor) return;
      const board = gd.board || Connect4.initBoard();
      const color = myColor === "p1" ? "r" : "y";
      const result = Connect4.dropPiece(board, col, color);
      if (!result) return;

      // Animate drop — remove class after animation ends to avoid re-trigger on re-render
      const cell = colEls[col].cells[result.row];
      cell.className = "c4-cell " + color + " drop";
      cell.addEventListener("animationend", () => cell.classList.remove("drop"), { once: true });

      const winResult = Connect4.checkWinner(result.board);
      const nextPlayer = gd.currentPlayer === "p1" ? "p2" : "p1";
      const upd = {
        board: result.board,
        lastMove: { row: result.row, col },
        currentPlayer: nextPlayer,
      };
      if (winResult) {
        upd.status = "finished";
        upd.result = winResult.winner === "draw" ? "draw" : gd.currentPlayer;
        upd.winCells = (winResult.cells || []).map(wc => Array.isArray(wc) ? {r: wc[0], c: wc[1]} : wc);
      }
      try {
        await db.collection("gameRooms").doc(currentRoom.id).update(upd);
      } catch(e) { console.error("c4 drop:", e); }
    }

    function showConnect4GameOver(gd, pl) {
      const overlay = mk("div"); overlay.className = "c4-gameover-wrap";
      const box = mk("div"); box.className = "c4-gameover-box";
      const icon = mk("div","font-size:32px;margin-bottom:6px;");
      const hl = mk("div","font-size:14px;font-weight:bold;color:#6488ff;margin-bottom:4px;");
      const sub = mk("div","font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:12px;");
      const winner = gd.result;
      const user = getUser();
      if (winner === "draw") {
        icon.textContent = "\uD83E\uDD1D"; hl.textContent = "It's a Draw!"; sub.textContent = "Board is full";
      } else {
        const wName = pl[winner] || winner;
        const reason = gd.resultReason === "forfeit" ? " (forfeit)" : "";
        if (isSpectator) { icon.textContent = "\uD83C\uDFAF"; hl.textContent = wName + " wins!" + reason; }
        else if (pl[winner] === user) { icon.textContent = "\uD83C\uDFC6"; hl.textContent = "You win!"; }
        else { icon.textContent = "\uD83D\uDC80"; hl.textContent = "You lose!"; }
        sub.textContent = wName + " connected 4!" + reason;
      }
      const closeBtn = mkBtn("Back to lobby","gc-btn gc-act","margin-top:4px;width:100%;");
      closeBtn.onclick = () => { overlay.remove(); leaveRoom(); };
      box.append(icon, hl, sub, closeBtn);
      overlay.appendChild(box);
      gamesContent.appendChild(overlay);
    }

    renderBoard(currentRoom);
    unsubRoom = db.collection("gameRooms").doc(currentRoom.id).onSnapshot(
      (snap) => { if (!snap.exists) { renderList(); return; } renderBoard(snap.data()); },
      (e) => console.error("c4 sub:", e)
    );
  }
  function renderBattleshipGame() {
    gamesContent.innerHTML = "";
    const game = mk("div"); game.className = "bs-game";
    gamesContent.appendChild(game);

    // ── Header ──────────────────────────────────────────────────────────────
    const hdr = mk("div"); hdr.className = "bs-hdr";
    const bk = mkBtn("<- Back","gc-btn gc-sm","flex-shrink:0;position:relative;z-index:1;");
    bk.onclick = leaveRoom;
    const centerHdr = mk("div","position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;");
    const rName = mk("div","font-size:10px;font-weight:bold;color:rgba(0,180,255,0.7);letter-spacing:1px;");
    rName.textContent = currentRoom.name;
    centerHdr.appendChild(rName);
    if (currentRoom.visibility === "private" && currentRoom.code) {
      const ct = mk("span","font-size:8px;padding:1px 5px;border-radius:3px;letter-spacing:2px;font-weight:bold;background:rgba(5,20,50,0.7);color:rgba(100,180,255,0.9);border:1px solid rgba(0,120,255,0.3);margin-top:2px;pointer-events:auto;");
      ct.textContent = currentRoom.code; centerHdr.appendChild(ct);
    }
    const forfeitBtn = mkBtn("Forfeit","gc-btn gc-sm gc-danger","flex-shrink:0;position:relative;z-index:1;margin-left:auto;");
    forfeitBtn.onclick = leaveRoom;
    if (isSpectator) forfeitBtn.style.display = "none";
    hdr.append(bk, centerHdr, forfeitBtn);
    game.appendChild(hdr);

    // ── Scrollable main area ─────────────────────────────────────────────────
    const main = mk("div","flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:6px 8px;gap:6px;");
    main.className = "gc-scroll";
    game.appendChild(main);

    let latestGd = null;

    // ── Placing phase ────────────────────────────────────────────────────────
    function renderPlacing(gd) {
      main.innerHTML = "";
      const mySlot = myColor;
      const myGrid   = (mySlot === "p1" ? gd.p1Grid : gd.p2Grid) || Battleship.initGrid();
      const myReady  = mySlot === "p1" ? gd.p1Ready : gd.p2Ready;
      const oppReady = mySlot === "p1" ? gd.p2Ready : gd.p1Ready;

      if (myReady) {
        const w = mk("div","padding:20px;text-align:center;color:rgba(255,255,255,0.45);font-size:11px;line-height:1.7;");
        w.innerHTML = oppReady ? "⚓ Both ready — starting battle!" : "⚓ Ships locked in!<br><span style='font-size:9px;opacity:0.6;'>Waiting for opponent to finish placing…</span>";
        main.appendChild(w); return;
      }

      let selectedShip = null, horizontal = true;
      let currentGrid  = [...myGrid];
      const placedSet  = new Set(currentGrid.filter(Boolean));

      // status hint
      const hint = mk("div","font-size:10px;color:rgba(0,200,255,0.8);text-align:center;font-weight:bold;");
      hint.textContent = "Place your ships ⚓";
      main.appendChild(hint);

      // orientation button
      const orientBtn = mkBtn("↔ Horizontal","gc-btn gc-sm gc-act","align-self:flex-start;");
      orientBtn.onclick = () => { horizontal = !horizontal; orientBtn.textContent = horizontal ? "↔ Horizontal" : "↕ Vertical"; };
      main.appendChild(orientBtn);

      // ship list
      const shipList = mk("div","display:flex;flex-direction:column;gap:2px;width:100%;max-width:220px;");
      const shipEls  = {};
      for (const s of Battleship.SHIPS) {
        const done = placedSet.has(s.id);
        const item = mk("div"); item.className = "bs-ship-item" + (done ? " bs-placed" : "");
        const nm = mk("span","font-size:10px;color:#ccc;flex:1;min-width:70px;"); nm.textContent = s.name;
        const dots = mk("span","display:flex;gap:2px;");
        for (let i = 0; i < s.size; i++) {
          const d = mk("span","width:10px;height:10px;border-radius:2px;background:rgba(60,100,180,0.85);display:inline-block;");
          dots.appendChild(d);
        }
        item.append(nm, dots);
        if (!done) item.onclick = () => {
          selectedShip = s;
          Object.values(shipEls).forEach(e => e.classList.remove("bs-selected"));
          item.classList.add("bs-selected");
        };
        shipEls[s.id] = item;
        shipList.appendChild(item);
      }
      main.appendChild(shipList);

      // 10×10 placement grid
      const gridEl = mk("div","display:grid;grid-template-columns:repeat(10,1fr);gap:2px;width:100%;max-width:220px;");

      function rerender() {
        gridEl.innerHTML = "";
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 10; c++) {
            const i  = Battleship.idx(r, c);
            const cell = mk("div"); cell.className = "bs-cell";
            cell.style.minHeight = "18px";
            cell.classList.add(currentGrid[i] ? "ship" : "water");

            cell.onmouseenter = () => {
              if (!selectedShip || placedSet.has(selectedShip.id)) return;
              const ok = Battleship.canPlace(currentGrid, r, c, selectedShip.size, horizontal);
              for (let k = 0; k < selectedShip.size; k++) {
                const pr = horizontal ? r : r + k, pc = horizontal ? c + k : c;
                if (pr >= 0 && pr < 10 && pc >= 0 && pc < 10) {
                  const pi = Battleship.idx(pr, pc);
                  if (!currentGrid[pi]) gridEl.children[pi].className = "bs-cell " + (ok ? "preview" : "preview-bad");
                  gridEl.children[pi].style.minHeight = "18px";
                }
              }
            };
            cell.onmouseleave = () => rerender();

            cell.onclick = () => {
              if (!selectedShip || placedSet.has(selectedShip.id)) return;
              const ng = Battleship.placeShip(currentGrid, r, c, selectedShip.size, horizontal, selectedShip.id);
              if (!ng) return;
              currentGrid = ng;
              placedSet.add(selectedShip.id);
              shipEls[selectedShip.id].className = "bs-ship-item bs-placed";
              selectedShip = null;
              rerender();
              readyBtn.style.display = Battleship.SHIPS.every(s => placedSet.has(s.id)) ? "block" : "none";
            };
            gridEl.appendChild(cell);
          }
        }
      }
      rerender();
      main.appendChild(gridEl);

      const readyBtn = mkBtn("Ready! ⚓","gc-btn gc-act","width:100%;max-width:220px;margin-top:6px;" + (Battleship.SHIPS.every(s => placedSet.has(s.id)) ? "" : "display:none;"));
      readyBtn.onclick = async () => {
        readyBtn.disabled = true; readyBtn.textContent = "Locking in…";
        try {
          await db.runTransaction(async tx => {
            const snap = await tx.get(db.collection("gameRooms").doc(currentRoom.id));
            if (!snap.exists) return;
            const d = snap.data();
            const upd = { [`${mySlot}Grid`]: currentGrid, [`${mySlot}Ready`]: true };
            const oppR = mySlot === "p1" ? d.p2Ready : d.p1Ready;
            if (oppR) upd.status = "playing";
            tx.update(db.collection("gameRooms").doc(currentRoom.id), upd);
          });
        } catch(e) { console.error("bs ready:", e); readyBtn.disabled = false; readyBtn.textContent = "Ready! ⚓"; }
      };
      main.appendChild(readyBtn);
    }

    // ── Playing phase ────────────────────────────────────────────────────────
    function renderPlaying(gd) {
      main.innerHTML = "";
      const mySlot     = myColor;
      const pl         = gd.players || {};
      const isMyTurn   = !isSpectator && gd.status === "playing" && gd.currentPlayer === mySlot;
      const isFinished = gd.status === "finished";
      const myGrid     = (mySlot === "p1" ? gd.p1Grid  : gd.p2Grid)  || Battleship.initGrid();
      const myShots    = (mySlot === "p1" ? gd.p1Shots : gd.p2Shots) || Battleship.initGrid();
      const incoming   = (mySlot === "p1" ? gd.p2Shots : gd.p1Shots) || Battleship.initGrid();

      // status bar
      const stEl = mk("div","font-size:10px;text-align:center;font-weight:bold;min-height:16px;");
      if (isFinished) stEl.style.color = "#ffd";
      else if (isMyTurn) { stEl.style.color = "rgba(0,220,255,0.95)"; stEl.textContent = "Your turn — fire!"; }
      else { stEl.style.color = "rgba(255,255,255,0.38)"; stEl.textContent = isSpectator ? "" : "Opponent's turn…"; }
      main.appendChild(stEl);

      // Enemy grid
      const enemyLbl = mk("div","font-size:9px;color:rgba(255,80,80,0.7);letter-spacing:1px;text-transform:uppercase;text-align:center;");
      enemyLbl.textContent = "Enemy Waters";
      main.appendChild(enemyLbl);

      const enemyGrid = mk("div","display:grid;grid-template-columns:repeat(10,1fr);gap:2px;width:100%;max-width:220px;");
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const i  = Battleship.idx(r, c);
          const shot = myShots[i];
          const cell = mk("div"); cell.className = "bs-cell"; cell.style.minHeight = "18px";
          if (shot === "hit")  { cell.classList.add("hit");  cell.textContent = "💥"; }
          else if (shot === "miss") { cell.classList.add("miss"); cell.textContent = "·"; }
          else {
            cell.classList.add("water");
            if (isMyTurn && !isFinished) {
              cell.classList.add("target");
              cell.onclick = () => handleFire(r, c, i, gd);
            }
          }
          enemyGrid.appendChild(cell);
        }
      }
      main.appendChild(enemyGrid);

      // My fleet grid
      const myLbl = mk("div","font-size:9px;color:rgba(0,180,255,0.65);letter-spacing:1px;text-transform:uppercase;text-align:center;margin-top:4px;");
      myLbl.textContent = isSpectator ? (pl[mySlot] || "P1") + "'s Fleet" : "Your Fleet";
      main.appendChild(myLbl);

      const myGridEl = mk("div","display:grid;grid-template-columns:repeat(10,1fr);gap:2px;width:100%;max-width:220px;");
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const i = Battleship.idx(r, c);
          const cell = mk("div"); cell.className = "bs-cell"; cell.style.minHeight = "18px";
          const inc = incoming[i];
          if (inc === "hit")       { cell.classList.add("hit");  cell.textContent = "💥"; }
          else if (inc === "miss") { cell.classList.add("miss"); cell.textContent = "·"; }
          else if (myGrid[i] && !isSpectator) cell.classList.add("ship");
          else cell.classList.add("water");
          myGridEl.appendChild(cell);
        }
      }
      main.appendChild(myGridEl);

      if (isFinished && !gamesContent.querySelector(".bs-gameover-wrap"))
        showBsGameOver(gd, pl);
    }

    // ── Fire ─────────────────────────────────────────────────────────────────
    async function handleFire(r, c, i, gd) {
      if (!myColor || isSpectator) return;
      if (gd.status !== "playing" || gd.currentPlayer !== myColor) return;
      const mySlot  = myColor;
      const shots   = [...((mySlot === "p1" ? gd.p1Shots : gd.p2Shots) || Battleship.initGrid())];
      if (shots[i]) return;
      const oppGrid = (mySlot === "p1" ? gd.p2Grid : gd.p1Grid) || Battleship.initGrid();
      shots[i] = oppGrid[i] ? "hit" : "miss";
      const allGone = shots[i] === "hit" && Battleship.checkAllSunk(oppGrid, shots);
      const upd = {
        [`${mySlot}Shots`]: shots,
        currentPlayer: allGone ? mySlot : (mySlot === "p1" ? "p2" : "p1"),
      };
      if (allGone) { upd.status = "finished"; upd.result = mySlot; }
      try {
        await db.collection("gameRooms").doc(currentRoom.id).update(upd);
      } catch(e) { console.error("bs fire:", e); }
    }

    // ── Game over ─────────────────────────────────────────────────────────────
    function showBsGameOver(gd, pl) {
      const overlay = mk("div"); overlay.className = "bs-gameover-wrap";
      const box = mk("div"); box.className = "bs-gameover-box";
      const icon = mk("div","font-size:32px;margin-bottom:6px;");
      const hl   = mk("div","font-size:14px;font-weight:bold;color:#5af;margin-bottom:4px;");
      const sub  = mk("div","font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:12px;");
      const winner = gd.result, user = getUser();
      if (isSpectator) { icon.textContent = "🚢"; hl.textContent = (pl[winner]||winner) + " wins!"; }
      else if (pl[winner] === user) { icon.textContent = "🏆"; hl.textContent = "You win!"; }
      else { icon.textContent = "💀"; hl.textContent = "You lose!"; }
      sub.textContent = (pl[winner]||winner) + (gd.resultReason === "forfeit" ? " wins (forfeit)" : " sank all ships!");
      const closeBtn = mkBtn("Back to lobby","gc-btn gc-act","margin-top:4px;width:100%;");
      closeBtn.onclick = () => { overlay.remove(); leaveRoom(); };
      box.append(icon, hl, sub, closeBtn);
      overlay.appendChild(box);
      gamesContent.appendChild(overlay);
    }

    // ── Main update dispatcher ────────────────────────────────────────────────
    function updateUI(gd) {
      latestGd = gd;
      const pl = gd.players || {};
      if (gd.status === "waiting") {
        main.innerHTML = "";
        const w = mk("div","padding:20px;text-align:center;color:rgba(255,255,255,0.38);font-size:11px;");
        w.textContent = "Waiting for opponent…"; main.appendChild(w);
      } else if (gd.status === "placing") {
        if (!isSpectator) renderPlacing(gd);
        else {
          main.innerHTML = "";
          const w = mk("div","padding:20px;text-align:center;color:rgba(255,255,255,0.38);font-size:11px;line-height:1.7;");
          w.innerHTML = `${gd.p1Ready ? "✓" : "⏳"} ${pl.p1||"P1"}&nbsp;&nbsp;|&nbsp;&nbsp;${gd.p2Ready ? "✓" : "⏳"} ${pl.p2||"P2"}<br><span style='font-size:9px;opacity:0.5;'>Placing ships…</span>`;
          main.appendChild(w);
        }
      } else {
        renderPlaying(gd);
      }
    }

    updateUI(currentRoom);
    unsubRoom = db.collection("gameRooms").doc(currentRoom.id).onSnapshot(
      snap => { if (!snap.exists) { renderList(); return; } updateUI(snap.data()); },
      e => console.error("battleship sub:", e)
    );
  }
  window.addEventListener("beforeunload", () => {
    if (!currentRoom || !db) return;
    const commitUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents:commit?key=${FIREBASE_API_KEY}`;
    const docPath = `projects/${FIRESTORE_PROJECT}/databases/(default)/documents/gameRooms/${currentRoom.id}`;
    try {
      if (isSpectator) {
        fetch(
          `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/gameRooms/${currentRoom.id}?key=${FIREBASE_API_KEY}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fields: {
                spectatorCount: {
                  integerValue: String(
                    Math.max(0, (currentRoom.spectatorCount || 1) - 1),
                  ),
                },
              },
            }),
            keepalive: true,
          },
        );
      } else {
        fetch(commitUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            writes: [
              {
                transform: {
                  document: docPath,
                  fieldTransforms: [
                    {
                      fieldPath: "memberCount",
                      increment: { integerValue: "-1" },
                    },
                    { fieldPath: "emptyAt", setToServerValue: "REQUEST_TIME" },
                  ],
                },
              },
            ],
          }),
          keepalive: true,
        });
      }
    } catch (_) {}
  });

  initFirebase();
  console.log("CC Games tab loaded");
})();
