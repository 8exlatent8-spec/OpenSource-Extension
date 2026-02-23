(() => {
  const content = window.__engineContent__;
  const contentWrap = window.__engineContentWrap__;

  const pricesContent = document.createElement("div");
  Object.assign(pricesContent.style, {
    height: "145px",
    minHeight: "0",
    overflow: "hidden",
    boxSizing: "border-box",
    display: "none",          // hidden by default; shown as "flex" by tab switcher
    flexDirection: "column",
    padding: "4px 4px 0 4px"
  });

  contentWrap.appendChild(pricesContent);
  content["Prices"] = pricesContent;

  // ── Override: whenever this tab becomes visible, ensure display is "flex" ──
  // This patches whatever the engine's tab-switcher does (it may set "block").
  const observer = new MutationObserver(() => {
    if (pricesContent.style.display !== "none" &&
        pricesContent.style.display !== "flex") {
      pricesContent.style.display = "flex";
    }
  });
  observer.observe(pricesContent, { attributes: true, attributeFilter: ["style"] });

  const pricesState = { all: [], filtered: [], iconMap: {} };

  // ── Search bar ──────────────────────────────────────────────────────────────
  const priceSearch = document.createElement("input");
  priceSearch.type = "text";
  priceSearch.placeholder = "Search item...";
  Object.assign(priceSearch.style, {
    width: "100%",
    height: "24px",
    marginBottom: "5px",
    background: "#111",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "6px",
    padding: "0 6px",
    fontSize: "12px",
    fontFamily: "monospace",
    boxSizing: "border-box",
    flex: "0 0 24px"          // fixed height, never shrinks
  });
  ["keydown","keyup","keypress","input","paste"].forEach(ev =>
    priceSearch.addEventListener(ev, e => e.stopPropagation())
  );
  pricesContent.appendChild(priceSearch);

  // ── Scrollbar styles ────────────────────────────────────────────────────────
  const scrollStyle = document.createElement("style");
  scrollStyle.textContent = `
    #cc-price-list {
      /* Firefox */
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.22) rgba(255,255,255,0.04);
    }
    #cc-price-list::-webkit-scrollbar {
      width: 5px;
    }
    #cc-price-list::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.04);
      border-radius: 10px;
    }
    #cc-price-list::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.22);
      border-radius: 10px;
    }
    #cc-price-list::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.42);
    }
  `;
  document.head.appendChild(scrollStyle);

  // ── List container ──────────────────────────────────────────────────────────
  // Key fix: flex: "1 1 0px" + overflow-y: scroll + explicit min-height: 0
  // Without min-height:0, a flex child won't shrink below its content height.
  const priceList = document.createElement("div");
  priceList.id = "cc-price-list";
  Object.assign(priceList.style, {
    flex: "1 1 0px",
    minHeight: "0",           // ← THE critical fix for flex + overflow-y scroll
    overflowY: "scroll",      // always show scrollbar track (avoids layout jump)
    overflowX: "hidden",
    borderRadius: "6px",
    background: "rgba(0,0,0,0.35)",
    padding: "2px 2px 2px 4px",
    fontFamily: "monospace"
  });
  pricesContent.appendChild(priceList);

  // ── Render ──────────────────────────────────────────────────────────────────
  function renderPrices() {
    priceList.innerHTML = "";

    if (!pricesState.filtered.length) {
      const empty = document.createElement("div");
      Object.assign(empty.style, {
        padding: "18px 0",
        textAlign: "center",
        fontSize: "11px",
        color: "rgba(255,255,255,0.3)",
        fontFamily: "monospace"
      });
      empty.textContent = pricesState.all.length ? "No results." : "Loading…";
      priceList.appendChild(empty);
      return;
    }

    pricesState.filtered.forEach(item => {
      const row = document.createElement("div");
      Object.assign(row.style, {
        display: "grid",
        gridTemplateColumns: "20px 1fr auto",
        gap: "6px",
        padding: "3px 6px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        fontSize: "12px",
        alignItems: "center",
        whiteSpace: "nowrap",
        cursor: "default",
        transition: "background 0.1s"
      });

      // Icon cell
      const iconCell = document.createElement("div");
      iconCell.style.cssText = "width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;";
      const imgUrl = findIcon(item.name);
      if (imgUrl) {
        const img = document.createElement("img");
        img.src = imgUrl;
        img.style.cssText = "width:20px;height:20px;object-fit:contain;image-rendering:pixelated;";
        img.onerror = () => { iconCell.textContent = ""; };
        iconCell.appendChild(img);
      }

      const name = document.createElement("span");
      name.textContent = item.name;
      name.style.overflow = "hidden";
      name.style.textOverflow = "ellipsis";
      name.style.color = "rgba(220,220,220,0.92)";

      const price = document.createElement("span");
      price.textContent = `${item.min}-${item.max}c`;
      price.style.color = "rgba(180,220,140,0.85)";
      price.style.fontSize = "11px";

      row.append(iconCell, name, price);
      row.onmouseenter = () => row.style.background = "rgba(255,255,255,0.06)";
      row.onmouseleave = () => row.style.background = "";
      priceList.appendChild(row);
    });
  }

  // ── Icon lookup (fuzzy name matching) ───────────────────────────────────────
  function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function findIcon(itemName) {
    const map = pricesState.iconMap;
    if (!map) return null;
    const key = normalize(itemName);
    if (map[key]) return map[key];
    for (const [k, v] of Object.entries(map)) {
      if (k.includes(key) || key.includes(k)) return v;
    }
    return null;
  }

  // ── Scrape recipes.html to build name→icon map ──────────────────────────────
  async function loadIconMap() {
    try {
      const res = await fetch("https://cubiccastles.com/recipe_html/recipes.html", { cache: "force-cache" });
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const map = {};
      doc.querySelectorAll("td").forEach(td => {
        const img = td.querySelector("img");
        if (!img) return;
        const src = img.getAttribute("src") || "";
        if (!src.includes("ItemIcons_Wear__Tile")) return;
        const rawName = td.textContent.trim();
        if (!rawName) return;
        const fullUrl = new URL(src, "https://cubiccastles.com/recipe_html/").href;
        map[normalize(rawName)] = fullUrl;
      });

      pricesState.iconMap = map;
      console.log(`[Prices] Loaded ${Object.keys(map).length} wear icons`);
    } catch (e) {
      console.warn("[Prices] Could not load icon map:", e);
      pricesState.iconMap = {};
    }
  }

  // ── Load prices ─────────────────────────────────────────────────────────────
  async function loadPrices() {
    priceList.textContent = "Loading…";
    priceList.style.color = "rgba(255,255,255,0.3)";
    priceList.style.fontSize = "11px";
    priceList.style.textAlign = "center";
    priceList.style.paddingTop = "18px";

    const [_, priceText] = await Promise.allSettled([
      loadIconMap(),
      fetch("https://ccprices.github.io/prices.txt?ts=" + Date.now(), { cache: "no-store" })
        .then(r => r.text())
    ]);

    // Reset loading styles
    priceList.textContent = "";
    priceList.style.color = "";
    priceList.style.fontSize = "";
    priceList.style.textAlign = "";
    priceList.style.paddingTop = "";

    if (priceText.status === "rejected") {
      priceList.textContent = "❌ Failed to load prices";
      return;
    }

    pricesState.all = priceText.value
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        const match = line.match(/^(.+?):\s*([\d.]+)c\s*-\s*([\d.]+)c/i);
        if (!match) return null;
        return { name: match[1], min: parseFloat(match[2]), max: parseFloat(match[3]) };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

    pricesState.filtered = pricesState.all;
    renderPrices();
  }

  // ── Search ──────────────────────────────────────────────────────────────────
  priceSearch.addEventListener("input", () => {
    const q = priceSearch.value.toLowerCase().trim();
    pricesState.filtered = q
      ? pricesState.all.filter(i => i.name.toLowerCase().includes(q))
      : pricesState.all;
    renderPrices();
  });

  loadPrices();
})();