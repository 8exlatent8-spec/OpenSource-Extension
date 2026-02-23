  // ==================== INJECT ENGINE MODULES ====================
  (() => {
    const files = [
      "engine-core.js",
      "engine-chat.js",
      "engine-games.js",
      "engine-timer.js",
      "engine-prices.js",
      "engine-craft.js"
    ];

    function injectNext(index) {
      if (index >= files.length) {
        // ✅ All modules loaded — now initialize the UI
        if (window.__openTab__) {
          window.__openTab__('Chat');
        }
        return;
      }

      const s = document.createElement("script");
      s.src = chrome.runtime.getURL(files[index]);
      s.onload = () => {
        s.remove();
        injectNext(index + 1);
      };
      s.onerror = () => {
        console.warn(`⚠️ Failed to load: ${files[index]}`);
        s.remove();
        injectNext(index + 1); // keep going even if one fails
      };
      document.documentElement.appendChild(s);
    }

    injectNext(0);
  })();

