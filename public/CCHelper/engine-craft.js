(() => {
  const content     = window.__engineContent__;
  const contentWrap = window.__engineContentWrap__;

  const recipesContent = document.createElement("div");
  Object.assign(recipesContent.style, {
    overflow: "visible", boxSizing: "border-box",
    display: "none", flexDirection: "column", position: "relative"
  });
  contentWrap.appendChild(recipesContent);
  content["Craft"] = recipesContent;

  const state = { all: [], filtered: [], imgMap: {}, currentRecipe: null, amount: 1 };

  // ── SEARCH ROW (80% search + 20% amount) ─────────────────────────────────
  const searchRow = document.createElement("div");
  Object.assign(searchRow.style, {
    display:"flex", gap:"4px", marginBottom:"4px", flex:"0 0 auto"
  });

  const recipeSearch = document.createElement("input");
  recipeSearch.type = "text";
  recipeSearch.placeholder = "Search recipe...";
  Object.assign(recipeSearch.style, {
    width:"80%", height:"24px",
    background:"#111", color:"#fff", border:"1px solid #555",
    borderRadius:"6px", padding:"0 6px", fontSize:"12px",
    fontFamily:"monospace", boxSizing:"border-box"
  });

  const amountInput = document.createElement("input");
  amountInput.type = "text";
  amountInput.value = "1";
  amountInput.placeholder = "Qty";
  Object.assign(amountInput.style, {
    width:"20%", height:"24px",
    background:"#111", color:"#ffcc44", border:"1px solid #555",
    borderRadius:"6px", padding:"0 4px", fontSize:"12px",
    fontFamily:"monospace", boxSizing:"border-box", textAlign:"center"
  });

  searchRow.append(recipeSearch, amountInput);
  recipesContent.appendChild(searchRow);

  ["keydown","keyup","keypress","input","paste"].forEach(ev => {
    recipeSearch.addEventListener(ev, e => e.stopPropagation());
    amountInput.addEventListener(ev, e => e.stopPropagation());
  });

  // ── DROPDOWN ─────────────────────────────────────────────────────────────
  const dropdown = document.createElement("div");
  Object.assign(dropdown.style, {
    position:"absolute", top:"30px", left:"0", right:"0",
    background:"rgba(10,10,10,0.98)", border:"1px solid #555",
    borderRadius:"6px", maxHeight:"110px", overflowY:"auto",
    display:"none", zIndex:"10000", boxShadow:"0 4px 8px rgba(0,0,0,0.6)"
  });
  recipesContent.appendChild(dropdown);

  // ── RECIPE DISPLAY ────────────────────────────────────────────────────────
  const recipeDisplay = document.createElement("div");
  Object.assign(recipeDisplay.style, {
    overflowY:"visible", overflowX:"hidden",
    borderRadius:"6px", background:"rgba(0,0,0,0.35)", padding:"4px",
    fontFamily:"monospace"
  });
  recipesContent.appendChild(recipeDisplay);

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function parseNote(note) {
    if (!note) return null;
    const result = { raw: note, yield: null, time: null, energy: null };
    const yieldMatch = note.match(/^(\d+)-(\d+)$/);
    if (yieldMatch) {
      result.yield = { input: parseInt(yieldMatch[1]), output: parseInt(yieldMatch[2]) };
      return result;
    }
    const timeMatch = note.match(/(Cook|Process|Distill)\s+(\d+)s/i);
    if (timeMatch) result.time = { action: timeMatch[1], seconds: parseInt(timeMatch[2]) };
    const embeddedYield = note.match(/(\d+)-(\d+)/);
    if (embeddedYield && !yieldMatch)
      result.yield = { input: parseInt(embeddedYield[1]), output: parseInt(embeddedYield[2]) };
    const energyMatch = note.match(/(\d+)⚡/);
    if (energyMatch) result.energy = parseInt(energyMatch[1]);
    return result;
  }

  function buildNoteBadge(note) {
    if (!note) return null;
    const parsed = parseNote(note);
    const badges = [];
    if (parsed.time) badges.push({ text:`⏱ ${parsed.time.action} ${parsed.time.seconds}s`, color:"#ffaa44" });
    if (parsed.yield) badges.push({ text:`📦 ×${parsed.yield.input} → ×${parsed.yield.output}`, color:"#44ffaa" });
    if (parsed.energy) badges.push({ text:`⚡ ${parsed.energy}`, color:"#ffff44" });
    if (!parsed.time && !parsed.yield && !parsed.energy) badges.push({ text: note, color:"#aaa" });
    return badges;
  }

  function normKey(name) { return (name || "").trim().toLowerCase(); }
  function itemImg(name) { return state.imgMap[normKey(name)] || null; }

  function makeImg(name, size) {
    const img = document.createElement("img");
    img.style.cssText = [
      `width:${size}px`, `height:${size}px`, "image-rendering:pixelated",
      "background:rgba(0,0,0,0.5)", "border:1px solid rgba(255,255,255,0.2)",
      `border-radius:${size > 20 ? 4 : 2}px`, "flex-shrink:0"
    ].join(";");
    const url = itemImg(name);
    if (url) { img.src = url; } else { img.style.display = "none"; }
    img.onerror = () => { img.style.display = "none"; };
    return img;
  }

  function loadImageMap() {
    fetch("https://cubiccastles.com/recipe_html/recipes.html")
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        let count = 0;
        doc.querySelectorAll("td").forEach(td => {
          const img = td.querySelector("img");
          if (!img) return;
          let name = "";
          td.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) name += node.textContent; });
          name = name.trim();
          if (!name) return;
          let src = img.getAttribute("src") || "";
          if (!src) return;
          if (!src.startsWith("http")) {
            src = src.replace(/^\.\//, "").replace(/^\/+/, "");
            src = "https://cubiccastles.com/recipe_html/" + src;
          }
          const key = normKey(name);
          if (!state.imgMap[key]) { state.imgMap[key] = src; count++; }
        });
        console.log("✅ CC Recipes: mapped " + count + " item images");
        if (state.currentRecipe) renderRecipe(state.currentRecipe);
      })
      .catch(err => console.warn("CC Recipes: image load failed —", err.message));
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  RECIPE DATABASE — quantities updated from authoritative reference lists
  // ══════════════════════════════════════════════════════════════════════════
  const RECIPES = [
    // ── HAND ─────────────────────────────────────────────────────────────
    { r:"Mud",                  s:"Hand", i:[{n:"Water"},{n:"Dirt"}] },
    { r:"Soil",                 s:"Hand", i:[{n:"Dirt"},{n:"Tree Leaves"},{n:"Water"}] },
    { r:"Quicksand",            s:"Hand", i:[{n:"Sand",q:2},{n:"Mud"},{n:"Oil"},{n:"Water"}] },
    { r:"String",               s:"Hand", i:[{n:"Grass",q:2}] },
    { r:"String",               s:"Hand", i:[{n:"Tropical Grass",q:2}] },
    { r:"Rope",                 s:"Hand", i:[{n:"String",q:3}] },
    { r:"Stone Brick",          s:"Hand", i:[{n:"Stone",q:4}] },
    { r:"Stone Block",          s:"Hand", i:[{n:"Stone",q:3}] },
    { r:"Clay Brick",           s:"Hand", i:[{n:"Clay Lump",q:4}] },
    { r:"Clay Block",           s:"Hand", i:[{n:"Clay Lump",q:3}] },
    { r:"Sandstone",            s:"Hand", i:[{n:"Sand",q:3}] },
    { r:"Sandy Block",          s:"Hand", i:[{n:"Sand",q:3}] },
    { r:"Sandy Brick",          s:"Hand", i:[{n:"Sand",q:4}] },
    { r:"Iron Block",           s:"Hand", i:[{n:"Iron",q:3}] },
    { r:"Coal Block",           s:"Hand", i:[{n:"Coal",q:3}] },
    { r:"Gold Block",           s:"Hand", i:[{n:"Gold",q:3}] },
    { r:"Silver Block",         s:"Hand", i:[{n:"Silver",q:3}] },
    { r:"Grey Checkers",        s:"Hand", i:[{n:"Stone",q:2},{n:"Coal",q:2}] },
    { r:"Grey Checkers",        s:"Hand", i:[{n:"Stone",q:2},{n:"Coal Block"}] },
    { r:"Grey Checkers",        s:"Hand", i:[{n:"Stone Block"},{n:"Coal Block"}] },
    { r:"White Plaster",        s:"Hand", i:[{n:"Stone",q:2},{n:"Sand"}] },
    ...[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(n=>({ r:`Custom Block ${n}`, s:"Hand", i:[{n:"Stone"},{n:"Clay Lump"},{n:"Sand"},{n:"Coal"}] })),
    { r:"Recycled Plastic",     s:"Hand", i:[{n:"Plastic Wrap",q:4}] },
    { r:"Recycled Aluminum",    s:"Hand", i:[{n:"Old Can",q:4}] },
    { r:"Crushed Cans",         s:"Hand", i:[{n:"Old Can",q:4}] },
    { r:"Leather",              s:"Hand", i:[{n:"Old Boot",q:4}] },
    { r:"Fabulous Slug",        s:"Hand", i:[{n:"Sea Slug",q:4}] },
    { r:"Red Brick",            s:"Hand", i:[{n:"Red Dye"},{n:"Sand"},{n:"Stone"}] },
    { r:"Dark Brick",           s:"Hand", i:[{n:"Black Dye"},{n:"Sand"},{n:"Stone"}] },
    { r:"Blue Brick",           s:"Hand", i:[{n:"Blue Dye"},{n:"Sand"},{n:"Stone"}] },
    { r:"Cobblestone",          s:"Hand", i:[{n:"Stone",q:5},{n:"Mud"},{n:"Clay Lump"},{n:"Sand"}] },
    { r:"Wet Cement",           s:"Hand", i:[{n:"Sand"},{n:"Charcoal"},{n:"Lava"},{n:"Water"}] },
    { r:"Wet Paste",            s:"Hand", i:[{n:"Sand"},{n:"Charcoal"},{n:"Pink Coral"},{n:"Water"}] },
    { r:"White Stripe Road",    s:"Hand", i:[{n:"Wet Cement"},{n:"Sand"},{n:"Oil"},{n:"White Dye"}] },
    { r:"White Divider Road",   s:"Hand", i:[{n:"Wet Cement"},{n:"Sand"},{n:"Oil"},{n:"White Dye"}] },
    { r:"White Curve Road",     s:"Hand", i:[{n:"Wet Cement"},{n:"Sand"},{n:"Oil"},{n:"White Dye"}] },
    { r:"Yellow Stripe Road",   s:"Hand", i:[{n:"Wet Cement"},{n:"Sand"},{n:"Oil"},{n:"Yellow Dye"}] },
    { r:"Yellow Divider Road",  s:"Hand", i:[{n:"Wet Cement"},{n:"Sand"},{n:"Oil"},{n:"Yellow Dye"}] },
    { r:"Yellow Curve Road",    s:"Hand", i:[{n:"Wet Cement"},{n:"Sand"},{n:"Oil"},{n:"Yellow Dye"}] },
    { r:"Pedestrians Only",     s:"Hand", i:[{n:"Gizmo",q:3},{n:"Steel Block"},{n:"Blue Dye"}] },
    { r:"Gold Block",           s:"Hand", i:[{n:"Gold",q:3}] },
    { r:"Silver Block",         s:"Hand", i:[{n:"Silver",q:3}] },
    { r:"Spike Floor",          s:"Hand", i:[{n:"Metal Plate"},{n:"Thorns"}] },
    { r:"Spike Floor",          s:"Hand", i:[{n:"Metal Plate"},{n:"Tacks"}] },
    { r:"Nest",                 s:"Hand", i:[{n:"Wild Egg"},{n:"Sticks",q:2}] },
    { r:"Bouncy Block",         s:"Hand", i:[{n:"Rubber",q:4}] },
    { r:"Glue",                 s:"Hand", i:[{n:"Rubber",q:3}] },
    { r:"Desk Pot",             s:"Hand", i:[{n:"Clay Lump",q:2}] },
    { r:"Round Neck Pot",       s:"Hand", i:[{n:"Clay Lump",q:2}] },
    { r:"Round Pot",            s:"Hand", i:[{n:"Clay Lump",q:3}] },
    { r:"White Lattice",        s:"Hand", i:[{n:"Wood Lattice"},{n:"White Dye"}] },
    { r:"Crude Signpost",       s:"Hand", i:[{n:"Any Trunk"},{n:"String"},{n:"Charcoal"}] },
    { r:"Warning Sign",         s:"Hand", i:[{n:"Any Trunk"},{n:"Glue"},{n:"Charcoal"},{n:"Yellow Dye"}] },
    { r:"Stop Sign",            s:"Hand", i:[{n:"Any Trunk"},{n:"Glue"},{n:"Charcoal"},{n:"Red Dye"}] },
    { r:"Left Sign",            s:"Hand", i:[{n:"Any Trunk"},{n:"Glue"},{n:"Charcoal"},{n:"White Dye"}] },
    { r:"Right Sign",           s:"Hand", i:[{n:"Any Trunk"},{n:"Glue"},{n:"Charcoal"},{n:"White Dye"}] },
    { r:"Up Sign",              s:"Hand", i:[{n:"Any Trunk"},{n:"Glue"},{n:"Charcoal"},{n:"White Dye"}] },
    { r:"Down Sign",            s:"Hand", i:[{n:"Any Trunk"},{n:"Glue"},{n:"Charcoal"},{n:"White Dye"}] },
    { r:"Open Sign",            s:"Hand", i:[{n:"New Wood Planks"},{n:"Glue"},{n:"White Dye"},{n:"Red Dye"}] },
    { r:"Closed Sign",          s:"Hand", i:[{n:"New Wood Planks"},{n:"Glue"},{n:"White Dye"},{n:"Blue Dye"}] },
    { r:"Red Official Sign",    s:"Hand", i:[{n:"New Wood Planks"},{n:"Glue"},{n:"White Dye"},{n:"Red Dye"}] },
    { r:"Green Official Sign",  s:"Hand", i:[{n:"New Wood Planks"},{n:"Glue"},{n:"White Dye"},{n:"Green Dye"}] },
    { r:"Black Official Sign",  s:"Hand", i:[{n:"New Wood Planks"},{n:"Glue"},{n:"White Dye"},{n:"Black Dye"}] },
    { r:"Hint Sign",            s:"Hand", i:[{n:"New Wood Planks"},{n:"Glue"},{n:"White Dye"},{n:"Charcoal"}] },
    { r:"Varnish",              s:"Hand", i:[{n:"Solvent"},{n:"Pine Resin"}] },
    { r:"Fancy Wood",           s:"Hand", i:[{n:"New Wood Block"},{n:"Varnish"}] },
    { r:"Full Watering Can",    s:"Hand", i:[{n:"Watering Can",q:10},{n:"Water",q:10}], note:"10-10" },
    { r:"Full Deluxe Watering Can",s:"Hand",i:[{n:"Deluxe Watering Can",q:25},{n:"Water",q:25}], note:"25-25" },
    { r:"RoboZilla Head",       s:"Hand", i:[{n:"Robozilla Metal Plate"},{n:"Robozilla Ears"},{n:"Steel Block",q:2},{n:"Steel Gear",q:2}] },
    { r:"RoboZilla Head",       s:"Hand", i:[{n:"Robozilla Visor"},{n:"Robozilla Bun"},{n:"Steel Block",q:2},{n:"Steel Gear",q:2}] },
    { r:"Hunting Net",          s:"Hand", i:[{n:"Sticks",q:2},{n:"String",q:2}] },
    { r:"Green Deluxe Hunting Net",s:"Hand",i:[{n:"Hunting Net"},{n:"Turkey Berry",q:4}] },
    { r:"Hunting Bush",         s:"Hand", i:[{n:"Bush"},{n:"Turkey Berry"},{n:"Soil"}] },
    { r:"Slymegood Head",       s:"Hand", i:[{n:"Slyme Egg",q:2},{n:"Slyme Egg",q:2}] },
    { r:"Easter Pow Gift!",     s:"Hand", i:[{n:"Easter Egg",q:3},{n:"Easter Egg",q:3},{n:"Easter Egg",q:3}] },
    { r:"Life Force",           s:"Hand", i:[{n:"Crushed Artifact"},{n:"Cloudy Potion"},{n:"Empty Jar"}] },
    { r:"Basic Sentry",         s:"Hand", i:[{n:"Life Force"},{n:"Decorative Mask"}] },
    { r:"Personal Sentry",      s:"Hand", i:[{n:"Basic Sentry"},{n:"Diamond"}] },
    { r:"Friend Sentry",        s:"Hand", i:[{n:"Basic Sentry"},{n:"Ruby"}] },
    { r:"Password Sentry",      s:"Hand", i:[{n:"Basic Sentry"},{n:"Emerald"}] },
    { r:"Heal Bumper",          s:"Hand", i:[{n:"Basic Bumper"},{n:"Gizmo"},{n:"Heal Wand"}] },
    { r:"Healing Block",        s:"Hand", i:[{n:"Stainless Steel Block"},{n:"Gizmo"},{n:"Heal Wand"}] },
    { r:"Checkpoint Bumper",    s:"Hand", i:[{n:"Basic Bumper"},{n:"Life Block"}] },
    { r:"Checkpoint",           s:"Hand", i:[{n:"Stainless Steel Block"},{n:"Life Block"}] },
    { r:"Life Block",           s:"Hand", i:[{n:"Stainless Steel Block"},{n:"Healing Block"}] },
    { r:"Warp Anchor",          s:"Hand", i:[{n:"Basic Bumper"},{n:"Checkpoint"}] },
    { r:"Fiber Rope",           s:"Hand", i:[{n:"Fiber",q:6}] },
    { r:"Fuse",                 s:"Hand", i:[{n:"Fiber Rope"},{n:"Boom Powder"}] },
    { r:"Boom Powder",          s:"Hand", i:[{n:"Sulfur"},{n:"Charcoal"},{n:"Mineral Deposit"}] },
    { r:"Bomb",                 s:"Hand", i:[{n:"Refined Iron Ball"},{n:"Boom Powder"},{n:"Fuse"},{n:"Charcoal"}] },
    { r:"QBee Bomb",            s:"Hand", i:[{n:"Harm Wand"},{n:"Bomb"}] },
    { r:"Stone Hammer",         s:"Hand", i:[{n:"Stone"},{n:"Sticks"},{n:"String"}] },
    { r:"Mortar And Pestle",    s:"Hand", i:[{n:"Stone"},{n:"Clay Lump",q:2},{n:"Sticks"}] },
    { r:"Workbench",            s:"Hand", i:[{n:"Iron",q:2},{n:"Sticks",q:2},{n:"Any Trunk"},{n:"Stone Block",q:2}] },
    { r:"Expert Workbench",     s:"Hand", i:[{n:"Iron",q:2},{n:"Sticks",q:2},{n:"Any Trunk"},{n:"Stone Block",q:2}] },
    { r:"Tech Workbench",       s:"Hand", i:[{n:"Iron",q:2},{n:"Steel Gear",q:2},{n:"Any Trunk"},{n:"Spring",q:2}] },
    { r:"Wizard's Workbench",   s:"Hand", i:[{n:"Iron",q:2},{n:"Captured Fairy"},{n:"Any Trunk"},{n:"Ruby"}] },
    { r:"Sewing Kit",           s:"Hand", i:[{n:"Cloth"},{n:"Cotton"},{n:"Tacks"},{n:"String"}] },
    { r:"Persian Rug",          s:"Hand", i:[{n:"Cotton",q:3},{n:"Red Dye"},{n:"Blue Dye"}] },
    { r:"Cloth",                s:"Hand", i:[{n:"Cotton",q:3}] },
    { r:"Gizmo",                s:"Hand", i:[{n:"Gold"},{n:"Glass"},{n:"Sand"},{n:"Glue"}] },
    { r:"Magnet",               s:"Hand", i:[{n:"Gizmo",q:3},{n:"Iron"}] },
    { r:"Steel Hammer",         s:"Hand", i:[{n:"Glue"},{n:"Steel Block"},{n:"Sticks"}] },
    { r:"Steel Block",          s:"Hand", i:[{n:"Charcoal"},{n:"Refined Iron",q:2}] },
    { r:"Stainless Steel Block",s:"Hand", i:[{n:"Silver"},{n:"Refined Steel",q:2}] },
    { r:"Distiller",            s:"Hand", i:[{n:"Steel Cauldron"},{n:"Rubber Hose"},{n:"Pipe"},{n:"Red Brick",q:2}] },
    { r:"Candle",               s:"Hand", i:[{n:"Beeswax",q:2},{n:"String"}] },
    { r:"Torch",                s:"Hand", i:[{n:"Oil"},{n:"Cloth"},{n:"Sticks"}] },
    { r:"Purple Paper Lantern", s:"Hand", i:[{n:"Paper"},{n:"Purple Dye"},{n:"Glue"},{n:"Candle"}] },
    { r:"Red Paper Lantern",    s:"Hand", i:[{n:"Paper"},{n:"Red Dye"},{n:"Glue"},{n:"Candle"}] },
    { r:"Blue Paper Lantern",   s:"Hand", i:[{n:"Paper"},{n:"Blue Dye"},{n:"Glue"},{n:"Candle"}] },
    { r:"Green Paper Lantern",  s:"Hand", i:[{n:"Paper"},{n:"Green Dye"},{n:"Glue"},{n:"Candle"}] },
    { r:"Book",                 s:"Hand", i:[{n:"Paper",q:6},{n:"Charcoal"}] },
    { r:"Cloudy Potion",        s:"Hand", i:[{n:"Sunny Potion"},{n:"Spicy Potion"},{n:"Fiery Potion"}] },
    { r:"Magical Potion",       s:"Hand", i:[{n:"Cloudy Potion"},{n:"Ghost Gum",q:4},{n:"Purple Magic Gem"},{n:"Solvent"}] },
    { r:"Golden Wand",          s:"Hand", i:[{n:"Whittled Stick"},{n:"Varnish"},{n:"Gold"}] },
    { r:"Silvery Wand",         s:"Hand", i:[{n:"Whittled Stick"},{n:"Varnish"},{n:"Silver"}] },
    { r:"Harm Wand",            s:"Hand", i:[{n:"Golden Wand"},{n:"Magical Potion"},{n:"Bones"},{n:"Red Magic Gem"}], note:"1500⚡" },
    { r:"Knock Back Wand",      s:"Hand", i:[{n:"Silvery Wand"},{n:"Magical Potion"},{n:"Gold Magic Gem"},{n:"Blue Magic Gem"}], note:"1500⚡" },
    { r:"Red Fadey Foam",       s:"Hand", i:[{n:"Cloudy Potion"},{n:"Ghost Dust"},{n:"Red Dye"}], note:"5-5" },
    { r:"Blue Fadey Foam",      s:"Hand", i:[{n:"Cloudy Potion"},{n:"Ghost Dust"},{n:"Blue Dye"}], note:"5-5" },
    { r:"Green Fadey Foam",     s:"Hand", i:[{n:"Cloudy Potion"},{n:"Ghost Dust"},{n:"Green Dye"}], note:"5-5" },
    { r:"Phantom Foam",         s:"Hand", i:[{n:"Cloudy Potion"},{n:"Ghost Dust",q:6}] },
    { r:"Green Goop",           s:"Hand", i:[{n:"Bouncy Block"},{n:"Solvent",q:2},{n:"Green Dye",q:3}] },
    { r:"Snot",                 s:"Hand", i:[{n:"Bouncy Block"},{n:"Solvent",q:2},{n:"Yellow Dye",q:3},{n:"Green Dye"}] },
    // Fish Trophies
    ...["Gentlefish","Beakfish","Parrotfish","Qbeefish","Toothfish","Spudfish","Bigeye","Wailfish",
        "Elffish","Santafish","Angelfish","Circlefish","Crystalfish","Fancyfish","Firefish","Flatfish",
        "Frostfish","Goldenfish","Lazyfish","Magmafish","OneEyedfish","Robofish","Seaweedfish",
        "Silverfish","Slimefish","Spikyfish","Squarefish","ThreeEyedfish","Trianglefish","Unicornfish",
        "Yellow Boxfish","Arcticfish","Camerafish","Cowfish","Fewbeefish","Guardianfish","Icefish",
        "Mewbeefish","Pigfish","Piratefish","Rainbowfish","Senseifish","Snowfish","Stingfish",
        "Surferfish","Torpedofish","Big Whale","Rabbitfish","Eggfish","Bullyfish","Ancientfish",
        "Crazyfish","Corpsefish","Bonefish","Halloweenfish","Eelk","Headlessfish","Squid",
        "Eyeballfish","Heartfish","Luvfish"].map(f=>({
      r:f==="Luvfish"?"Luv Fish Trophy":`${f} Trophy`,
      s:"Hand", i:[{n:f},{n:"Fancy Wood"},{n:"Gold"}]
    })),
    { r:"Patrudge Fish Trophy",         s:"Hand",i:[{n:"Patridge Fish"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Turtle Dove Trophy",           s:"Hand",i:[{n:"Turtle Dove Fish"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"French Hen Seahorse Trophy",   s:"Hand",i:[{n:"French Hen Seahorse"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Calling Bird Fish Trophy",     s:"Hand",i:[{n:"Calling Bird Fish"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Five Ring Trophy",             s:"Hand",i:[{n:"Five Ring Fish"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Goose Fish Trophy",            s:"Hand",i:[{n:"Goose Fish"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Swan Eel Trophy",              s:"Hand",i:[{n:"Swan Eel"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Milk Jelly Fish Trophy",       s:"Hand",i:[{n:"Milk Jellyfish"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Dancing Lady Fish Trophy",     s:"Hand",i:[{n:"Dancing Lady Fish"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Leaping Lord Jellyfish Trophy",s:"Hand",i:[{n:"Leaping Lord Jellyfish"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Piper Fish Trophy",            s:"Hand",i:[{n:"Piper Fish"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Drum Crab Trophy",             s:"Hand",i:[{n:"Drum Crab"},{n:"Fancy Wood"},{n:"Gold"}] },
    { r:"Haunted Lamp I",   s:"Hand",i:[{n:"Full Plasm Trap"},{n:"Spirit Lamp I"}] },
    { r:"Haunted Lamp II",  s:"Hand",i:[{n:"Full Plasm Trap"},{n:"Spirit Lamp II"}] },
    { r:"Haunted Lamp III", s:"Hand",i:[{n:"Full Plasm Trap"},{n:"Spirit Lamp III"}] },

    // ── DYE MIXING ────────────────────────────────────────────────────────
    { r:"Orange Dye",          s:"Hand",i:[{n:"Red Dye"},{n:"Yellow Dye"}] },
    { r:"Green Dye",           s:"Hand",i:[{n:"Blue Dye"},{n:"Yellow Dye"}] },
    { r:"Purple Dye",          s:"Hand",i:[{n:"Red Dye"},{n:"Blue Dye"}] },
    { r:"Pink Dye",            s:"Hand",i:[{n:"White Dye"},{n:"Red Dye"}] },
    { r:"Black Dye",           s:"Hand",i:[{n:"Red Dye"},{n:"Blue Dye"},{n:"Yellow Dye"}] },
    { r:"Grey Tutu",           s:"Hand",i:[{n:"Black Dye"},{n:"White Dye"},{n:"Any Color Tutu"}] },
    { r:"Grey Shirt",          s:"Hand",i:[{n:"Black Dye"},{n:"White Dye"},{n:"Any Color Shirt"}] },
    { r:"Grey Pants",          s:"Hand",i:[{n:"Black Dye"},{n:"White Dye"},{n:"Any Color Pants"}] },
    { r:"Grey Cowl",           s:"Hand",i:[{n:"Black Dye"},{n:"White Dye"},{n:"Any Color Cowl"}] },
    { r:"Grey Robe",           s:"Hand",i:[{n:"Black Dye"},{n:"White Dye"},{n:"Any Color Robe"}] },
    { r:"Grey Flower Skirt",   s:"Hand",i:[{n:"Black Dye"},{n:"White Dye"},{n:"Any Color Flower Skirt"}] },
    { r:"Colored Checker",     s:"Hand",i:[{n:"Any Color Checker"},{n:"Any Color Dye"}] },
    { r:"Colored Half Checker",s:"Hand",i:[{n:"Any Color Half Checker"},{n:"Any Color Dye"}] },
    { r:"Colored Checker Stair",s:"Hand",i:[{n:"Any Color Checker Stair"},{n:"Any Color Dye"}] },
    { r:"Colored Plaster",     s:"Hand",i:[{n:"Any Color Plaster"},{n:"Any Color Dye"}] },
    { r:"Colored Half Plaster",s:"Hand",i:[{n:"Any Color Half Plaster"},{n:"Any Color Dye"}] },
    { r:"Colored Plaster Stair",s:"Hand",i:[{n:"Any Color Plaster Stair"},{n:"Any Color Dye"}] },
    { r:"Colored Glass",       s:"Hand",i:[{n:"Any Color Glass"},{n:"Any Color Dye"}] },
    { r:"Colored Pants",       s:"Hand",i:[{n:"Any Color Pants"},{n:"Any Color Dye"}] },
    { r:"Colored Shirt",       s:"Hand",i:[{n:"Any Color Shirt"},{n:"Any Color Dye"}] },
    { r:"Colored Tutu",        s:"Hand",i:[{n:"Any Color Tutu"},{n:"Any Color Dye"}] },
    { r:"Colored Cowl",        s:"Hand",i:[{n:"Any Color Cowl"},{n:"Any Color Dye"}] },
    { r:"Colored Robe",        s:"Hand",i:[{n:"Any Color Robe"},{n:"Any Color Dye"}] },
    { r:"Colored Flower Skirt",s:"Hand",i:[{n:"Any Color Flower Skirt"},{n:"Any Color Dye"}] },
    { r:"Red Sofa",            s:"Hand",i:[{n:"Blue Sofa"},{n:"Red Dye"}] },
    { r:"Blue Sofa",           s:"Hand",i:[{n:"Red Sofa"},{n:"Blue Dye"}] },
    { r:"Blue Baseball Cap",   s:"Hand",i:[{n:"Red Baseball Cap"},{n:"Blue Dye"}] },
    { r:"Red Baseball Cap",    s:"Hand",i:[{n:"Blue Baseball Cap"},{n:"Red Dye"}] },

    // ── ANY HAMMER ────────────────────────────────────────────────────────
    { r:"Metal Plate",         s:"Any Hammer",i:[{n:"Iron",q:3}] },
    { r:"Metal Plate",         s:"Any Hammer",i:[{n:"Iron Block"}], note:"2-2" },
    { r:"Saw",                 s:"Any Hammer",i:[{n:"Iron"},{n:"Palm Trunk"}] },
    { r:"Tacks",               s:"Any Hammer",i:[{n:"Iron"}], note:"5-10" },
    { r:"Pipe",                s:"Any Hammer",i:[{n:"Iron",q:2}] },
    { r:"Chisel",              s:"Any Hammer",i:[{n:"Iron",q:2}] },
    { r:"Wrench",              s:"Any Hammer",i:[{n:"Iron",q:2}] },
    { r:"Screwdriver",         s:"Any Hammer",i:[{n:"Iron"},{n:"Sticks"}] },
    { r:"Watering Can",        s:"Any Hammer",i:[{n:"Iron"},{n:"Yellow Dye"}] },
    { r:"Prison Bars",         s:"Any Hammer",i:[{n:"Refined Iron",q:4}] },
    { r:"Iron Stairs",         s:"Any Hammer",i:[{n:"Iron Block",q:2}] },
    { r:"Golden Stairs",       s:"Any Hammer",i:[{n:"Gold Block",q:2}] },
    { r:"Gold Brick",          s:"Any Hammer",i:[{n:"Gold Block",q:4}] },
    { r:"Gold Plate",          s:"Any Hammer",i:[{n:"Gold Block"}], note:"2-2" },
    { r:"Silver Stairs",       s:"Any Hammer",i:[{n:"Silver Block",q:2}] },
    { r:"Silver Plate",        s:"Any Hammer",i:[{n:"Silver Block"}], note:"2-2" },
    { r:"Forge",               s:"Any Hammer",i:[{n:"Metal Plate"},{n:"Iron"},{n:"Coal"}] },
    { r:"Iron Pole",           s:"Any Hammer",i:[{n:"Refined Iron",q:2}] },
    { r:"Street Light",        s:"Any Hammer",i:[{n:"Refined Iron",q:2},{n:"Candle"},{n:"Glass"}] },
    { r:"Fancy Table",         s:"Any Hammer",i:[{n:"Varnish"},{n:"Glue"},{n:"Tacks"},{n:"New Wood Planks",q:2}] },
    { r:"Fancy Chair",         s:"Any Hammer",i:[{n:"Varnish"},{n:"Glue"},{n:"Tacks"},{n:"New Wood Planks"}] },
    { r:"Fancy Cabinet",       s:"Any Hammer",i:[{n:"Varnish"},{n:"Iron"},{n:"Tacks"},{n:"New Wood Planks",q:2}] },
    { r:"Throne",              s:"Any Hammer",i:[{n:"Varnish"},{n:"Gold"},{n:"Cloth"},{n:"New Wood Planks",q:2}] },
    { r:"Park Bench",          s:"Any Hammer",i:[{n:"Varnish"},{n:"Iron Pole"},{n:"Tacks"},{n:"New Wood Planks"}] },
    { r:"Lil' Bed",            s:"Any Hammer",i:[{n:"Cloth",q:5},{n:"Varnish"},{n:"Tacks"},{n:"New Wood Planks"}] },
    { r:"Small Desk",          s:"Any Hammer",i:[{n:"Varnish"},{n:"Iron Pole"},{n:"Tacks"},{n:"New Wood Planks"}] },
    { r:"Shop Display",        s:"Any Hammer",i:[{n:"Cloth",q:5},{n:"Varnish"},{n:"Glue",q:4},{n:"New Wood Planks"}] },
    { r:"Persian Rug Stairs",  s:"Any Hammer",i:[{n:"Persian Rug Half Block"},{n:"Tacks",q:4},{n:"New Wood Planks"},{n:"Glue",q:2}] },
    { r:"Old Wood Block",      s:"Any Hammer",i:[{n:"Wood Planks",q:2},{n:"Tacks"}] },
    { r:"New Wood Block",      s:"Any Hammer",i:[{n:"New Wood Planks",q:2},{n:"Tacks"}] },
    { r:"Old Wood Table",      s:"Any Hammer",i:[{n:"Wood Planks",q:2},{n:"Sticks"},{n:"Tacks"}] },
    { r:"Old Wood Chair",      s:"Any Hammer",i:[{n:"Wood Planks"},{n:"Sticks"},{n:"Tacks"}] },
    { r:"New Wood Table",      s:"Any Hammer",i:[{n:"New Wood Planks",q:2},{n:"Sticks"},{n:"Tacks"}] },
    { r:"New Wood Chair",      s:"Any Hammer",i:[{n:"New Wood Planks"},{n:"Sticks"},{n:"Tacks"}] },
    { r:"Red Sofa",            s:"Any Hammer",i:[{n:"Wood Planks",q:3},{n:"Cotton",q:3},{n:"Red Dye"},{n:"Tacks"}] },
    { r:"Blue Sofa",           s:"Any Hammer",i:[{n:"Wood Planks",q:3},{n:"Cotton",q:3},{n:"Blue Dye"},{n:"Tacks"}] },
    { r:"Wood Ladder",         s:"Any Hammer",i:[{n:"Any Trunk"},{n:"Sticks",q:3},{n:"Tacks"}] },
    { r:"White Fence",         s:"Any Hammer",i:[{n:"Any Trunk"},{n:"Sticks",q:2},{n:"Tacks"},{n:"White Dye"}] },
    { r:"Cedar Fence",         s:"Any Hammer",i:[{n:"Any Trunk"},{n:"Sticks",q:2},{n:"Tacks"}] },
    { r:"Old Fence",           s:"Any Hammer",i:[{n:"Dead Tree"},{n:"Sticks",q:2},{n:"Tacks"}] },
    { r:"White Wood Picket Fence",s:"Any Hammer",i:[{n:"Any Trunk"},{n:"Sticks",q:4},{n:"Tacks",q:2},{n:"White Dye"}] },
    { r:"New Wood Picket Fence",s:"Any Hammer",i:[{n:"Any Trunk"},{n:"Sticks",q:4},{n:"Tacks",q:2}] },
    { r:"Old Wood Picket Fence",s:"Any Hammer",i:[{n:"Dead Tree"},{n:"Sticks",q:4},{n:"Tacks",q:2}] },
    { r:"Wood Stairs",         s:"Any Hammer",i:[{n:"Tacks"},{n:"Wood Planks",q:2}] },
    { r:"New Wood Stairs",     s:"Any Hammer",i:[{n:"Tacks"},{n:"New Wood Planks",q:2}] },
    { r:"Crate",               s:"Any Hammer",i:[{n:"Tacks"},{n:"New Wood Planks",q:6},{n:"Varnish"}] },
    { r:"Barrel",              s:"Any Hammer",i:[{n:"Tacks"},{n:"Glue",q:2},{n:"Iron",q:6},{n:"New Wood Planks",q:6}] },
    { r:"Old Wood Column",     s:"Any Hammer",i:[{n:"Tacks"},{n:"Wood Planks",q:4}] },
    { r:"New Wood Column",     s:"Any Hammer",i:[{n:"Tacks"},{n:"New Wood Planks",q:4}] },
    { r:"Old Wood Shelves",    s:"Any Hammer",i:[{n:"Tacks"},{n:"Wood Planks",q:3}] },
    { r:"New Wood Shelves",    s:"Any Hammer",i:[{n:"Tacks"},{n:"New Wood Planks",q:3}] },
    { r:"Night Table",         s:"Any Hammer",i:[{n:"Tacks"},{n:"Iron"},{n:"New Wood Planks",q:3},{n:"Black Dye"}] },
    { r:"3 Legged Stool",      s:"Any Hammer",i:[{n:"New Wood Planks",q:2},{n:"Glue"},{n:"Tacks"}] },
    { r:"Chest",               s:"Any Hammer",i:[{n:"Wood Planks",q:3},{n:"Iron"},{n:"Tacks"},{n:"Glue"}] },
    { r:"Old Cabinet",         s:"Any Hammer",i:[{n:"Tacks"},{n:"Wood Planks",q:2},{n:"Glue"}] },
    { r:"New Cabinet",         s:"Any Hammer",i:[{n:"Tacks"},{n:"New Wood Planks",q:2},{n:"Glue"}] },
    { r:"Farm Hive",           s:"Any Hammer",i:[{n:"Wood Planks",q:2},{n:"Tacks",q:2},{n:"Beeswax",q:6}] },

    // ── STEEL HAMMER ──────────────────────────────────────────────────────
    { r:"Steel Plate",         s:"Steel Hammer",i:[{n:"Steel Block"}] },
    { r:"Stainless Steel Plate",s:"Steel Hammer",i:[{n:"Stainless Steel Block"}] },
    { r:"Trash Can",           s:"Steel Hammer",i:[{n:"Stainless Steel Plate"}] },
    { r:"Steel Stairs",        s:"Steel Hammer",i:[{n:"Steel Block",q:2}] },
    { r:"Metal Ladder",        s:"Steel Hammer",i:[{n:"Steel Block",q:3}] },
    { r:"Stainless Steel Stairs",s:"Steel Hammer",i:[{n:"Stainless Steel Block",q:2}] },
    { r:"Steel Gear",          s:"Steel Hammer",i:[{n:"Steel Block"}] },
    { r:"Steel Rod",           s:"Steel Hammer",i:[{n:"Steel Block"}] },
    { r:"Spring",              s:"Steel Hammer",i:[{n:"Steel Rod"},{n:"Pipe"}] },
    { r:"Knife",               s:"Steel Hammer",i:[{n:"Glue"},{n:"Steel Block"},{n:"Sticks"}] },
    { r:"Steel Cauldron",      s:"Steel Hammer",i:[{n:"Steel Block"}] },
    { r:"Mirror",              s:"Steel Hammer",i:[{n:"Glue",q:2},{n:"Glass"},{n:"Steel Block"}] },

    // ── KNIFE ─────────────────────────────────────────────────────────────
    { r:"Rubber Hose",         s:"Knife",i:[{n:"Vulcanized Rubber",q:2},{n:"Pipe"}] },
    { r:"Rubber Band",         s:"Knife",i:[{n:"Vulcanized Rubber",q:2}] },
    { r:"Decorative Mask",     s:"Knife",i:[{n:"New Wood Planks"},{n:"Varnish"},{n:"Fiber"}] },
    { r:"Wood Lattice",        s:"Knife",i:[{n:"Sticks",q:6},{n:"Glue"},{n:"Varnish"},{n:"Tacks"}] },
    { r:"Whittled Stick",      s:"Knife",i:[{n:"Sticks"}] },
    { r:"Big Jack I",          s:"Knife",i:[{n:"Pumpkin"}] },
    { r:"Big Jack II",         s:"Knife",i:[{n:"Pumpkin"}] },

    // ── SEWING KIT ────────────────────────────────────────────────────────
    { r:"White Pants",         s:"Sewing Kit",i:[{n:"Cloth",q:2}] },
    { r:"White Shirt",         s:"Sewing Kit",i:[{n:"Cloth",q:2}] },
    { r:"Rope Ladder",         s:"Sewing Kit",i:[{n:"Rope",q:5},{n:"Glue"}] },
    { r:"Ribbon",              s:"Sewing Kit",i:[{n:"Cloth"},{n:"Red Dye"},{n:"Glue"}] },
    { r:"Egg Hat",             s:"Sewing Kit",i:[{n:"Cotton",q:2}] },
    { r:"Chick Hat",           s:"Sewing Kit",i:[{n:"Egg Hat",q:2}] },
    { r:"Chicken Hat",         s:"Sewing Kit",i:[{n:"Chick Hat",q:2}] },
    { r:"Mattress",            s:"Sewing Kit",i:[{n:"Spring",q:2},{n:"Cloth"},{n:"Cotton",q:2},{n:"New Wood Planks"}] },
    { r:"Double Mattress",     s:"Sewing Kit",i:[{n:"Spring",q:4},{n:"Cloth",q:2},{n:"Cotton",q:4},{n:"New Wood Planks",q:2}] },

    // ── SCREWDRIVER ───────────────────────────────────────────────────────
    { r:"Pulse Bomb",          s:"Screwdriver",i:[{n:"Porcelain"},{n:"Vulcanized Rubber"},{n:"Magnet"}], note:"3-5" },
    { r:"Mecho-Spikes Blue",   s:"Screwdriver",i:[{n:"Stainless Steel Plate"},{n:"Spike Floor"},{n:"Steel Gear",q:3},{n:"Rubber Band",q:2}] },
    { r:"Mecho-Spikes Yellow", s:"Screwdriver",i:[{n:"Stainless Steel Plate"},{n:"Spike Floor"},{n:"Steel Gear",q:3},{n:"Rubber Band",q:2}] },
    { r:"Horizontal AcceloRing",s:"Screwdriver",i:[{n:"Stainless Steel Plate"},{n:"Pipe",q:4},{n:"Magnet",q:4},{n:"Rubber Hose"}] },
    { r:"Vertical AcceloRing", s:"Screwdriver",i:[{n:"Stainless Steel Plate"},{n:"Pipe",q:4},{n:"Magnet",q:4},{n:"Rubber Hose"}] },
    { r:"Extractor",           s:"Screwdriver",i:[{n:"Stainless Steel Plate",q:2},{n:"Pipe"},{n:"Steel Gear",q:4},{n:"Rubber Hose"}] },
    { r:"Wind Machine",        s:"Screwdriver",i:[{n:"Horizontal AcceloRing",q:2},{n:"Stainless Steel Plate",q:2},{n:"Pipe"},{n:"Cloud"}] },
    { r:"Laser Cutter",        s:"Screwdriver",i:[{n:"Diamond"},{n:"Pipe"},{n:"Magnet",q:2},{n:"Gizmo",q:6}] },
    { r:"Cash Register",       s:"Screwdriver",i:[{n:"White Dye"},{n:"Gizmo",q:4},{n:"Stainless Steel Plate",q:2},{n:"Spring",q:6}] },
    { r:"Rehydrator",          s:"Screwdriver",i:[{n:"Stainless Steel Plate",q:2},{n:"Pipe",q:4},{n:"Rubber Hose",q:4},{n:"Water",q:4}] },
    { r:"Cut-O-Matik 5000!",   s:"Screwdriver",i:[{n:"Stainless Steel Plate",q:6},{n:"Steel Gear",q:6},{n:"Spring",q:6},{n:"Gizmo",q:6}] },
    { r:"Phone",               s:"Screwdriver",i:[{n:"Magnet",q:2},{n:"Gizmo",q:4},{n:"Stainless Steel Plate"},{n:"Spring",q:3}] },
    { r:"Radio",               s:"Screwdriver",i:[{n:"Glass"},{n:"Gizmo",q:4},{n:"Stainless Steel Plate"},{n:"Spring",q:3}] },
    { r:"A Note",  s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Porcelain",q:3}] },
    { r:"A# Note", s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Coal",q:3}] },
    { r:"B Note",  s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Porcelain",q:3}] },
    { r:"C Note",  s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Porcelain",q:3}] },
    { r:"C# Note", s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Coal",q:3}] },
    { r:"D Note",  s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Porcelain",q:3}] },
    { r:"D# Note", s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Coal",q:2}] },
    { r:"E Note",  s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Porcelain",q:3}] },
    { r:"F Note",  s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Porcelain",q:3}] },
    { r:"F# Note", s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Coal",q:3}] },
    { r:"G Note",  s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Porcelain",q:3}] },
    { r:"G# Note", s:"Screwdriver",i:[{n:"Spring"},{n:"String"},{n:"Sticks"},{n:"Coal",q:3}] },
    { r:"Basic Bumper",s:"Screwdriver",i:[{n:"Gizmo",q:3},{n:"Spring",q:6},{n:"Rubber",q:6},{n:"Porcelain"}] },
    { r:"Dice",    s:"Screwdriver",i:[{n:"Basic Bumper"},{n:"Porcelain",q:3},{n:"Coal",q:3},{n:"Glue"}] },
    { r:"House Lamp",  s:"Screwdriver",i:[{n:"Porcelain"},{n:"Blue Dye"},{n:"Cloth"},{n:"Gizmo",q:2}] },
    { r:"Office Lamp", s:"Screwdriver",i:[{n:"Porcelain"},{n:"Black Dye"},{n:"Spring"},{n:"Gizmo",q:2}] },

    // ── LASER CUTTER ──────────────────────────────────────────────────────
    { r:"Half Diamond",  s:"Laser Cutter",i:[{n:"Diamond"}], note:"2-2" },
    { r:"Diamond Stairs",s:"Laser Cutter",i:[{n:"Diamond",q:2}] },
    { r:"Half Ruby",     s:"Laser Cutter",i:[{n:"Ruby"}], note:"2-2" },
    { r:"Ruby Stairs",   s:"Laser Cutter",i:[{n:"Ruby",q:2}] },
    { r:"Half Emerald",  s:"Laser Cutter",i:[{n:"Emerald"}], note:"2-2" },
    { r:"Emerald Stairs",s:"Laser Cutter",i:[{n:"Emerald",q:2}] },

    // ── CHISEL ────────────────────────────────────────────────────────────
    { r:"Black Marble Half Block",s:"Chisel",i:[{n:"Black Marble"}], note:"2-2" },
    { r:"White Marble Half Block",s:"Chisel",i:[{n:"White Marble"}], note:"2-2" },
    { r:"Blue Marble Half Block", s:"Chisel",i:[{n:"Blue Marble"}], note:"2-2" },
    { r:"Black Marble Stairs",    s:"Chisel",i:[{n:"Black Marble",q:2}] },
    { r:"White Marble Stairs",    s:"Chisel",i:[{n:"White Marble",q:2}] },
    { r:"Blue Marble Stairs",     s:"Chisel",i:[{n:"Blue Marble",q:2}] },
    { r:"Black Marble Column",    s:"Chisel",i:[{n:"Black Marble",q:2}] },
    { r:"White Marble Column",    s:"Chisel",i:[{n:"White Marble",q:2}] },
    { r:"Blue Marble Column",     s:"Chisel",i:[{n:"Blue Marble",q:2}] },
    { r:"Mosaic Half Block",      s:"Chisel",i:[{n:"Mosaic Floor"}], note:"2-2" },
    { r:"Mosaic Stairs",          s:"Chisel",i:[{n:"Mosaic Floor",q:2},{n:"Glue"}] },
    { r:"Terracotta Half Block",  s:"Chisel",i:[{n:"Terracotta Tiles"}], note:"2-2" },
    { r:"Terracotta Stairs",      s:"Chisel",i:[{n:"Terracotta Tiles",q:2},{n:"Glue"}] },
    { r:"Stone Column",    s:"Chisel",i:[{n:"Stone Block",q:2}] },
    { r:"Stone Fence",     s:"Chisel",i:[{n:"Stone Block",q:2}] },
    { r:"Fancy Road",      s:"Chisel",i:[{n:"Stone Block",q:2}] },
    { r:"Stone Cross",     s:"Chisel",i:[{n:"Stone Block"}] },
    { r:"Finial Stone",    s:"Chisel",i:[{n:"Stone Block"}] },
    { r:"Finial Sandstone",s:"Chisel",i:[{n:"Sandy Block"}] },
    { r:"Sandstone Block Column",s:"Chisel",i:[{n:"Sandy Brick",q:2}] },
    { r:"Sandstone Column",      s:"Chisel",i:[{n:"Sandy Block",q:2}] },
    { r:"Stone Brick Cap", s:"Chisel",i:[{n:"Stone Brick"},{n:"Stone"}] },
    { r:"Stone Stairs",    s:"Chisel",i:[{n:"Stone Block",q:2}] },
    { r:"Red Brick Stairs",s:"Chisel",i:[{n:"Red Brick",q:2}] },
    { r:"Colored Checker Stair",s:"Chisel",i:[{n:"Any Color Checker",q:2}] },
    { r:"Colored Plaster Stair",s:"Chisel",i:[{n:"Any Color Plaster",q:2}] },
    { r:"Sandy Brick Stairs",   s:"Chisel",i:[{n:"Sandy Brick",q:2}] },
    { r:"Sandy Block Stairs",   s:"Chisel",i:[{n:"Sandy Block",q:2}] },
    { r:"Clay Brick Cap",  s:"Chisel",i:[{n:"Clay Brick"},{n:"Clay Lump"}] },
    { r:"Terracotta Tiles",s:"Chisel",i:[{n:"Clay Lump",q:3},{n:"Iron"}] },
    { r:"Stone Half Block",s:"Chisel",i:[{n:"Stone Block"}], note:"2-2" },
    { r:"Colored Half Checker",s:"Chisel",i:[{n:"Any Color Checker"}], note:"2-2" },
    { r:"Colored Half Plaster",s:"Chisel",i:[{n:"Any Color Plaster"}], note:"2-2" },
    { r:"Half Clay",       s:"Chisel",i:[{n:"Clay Block"}], note:"2-2" },
    { r:"Half Mesa",       s:"Chisel",i:[{n:"Mesa"}], note:"2-2" },
    { r:"Half Coral",      s:"Chisel",i:[{n:"Pink Coral"}], note:"2-2" },
    { r:"Half Dirt",       s:"Chisel",i:[{n:"Dirt"}], note:"2-2" },
    { r:"Half Sand Block", s:"Chisel",i:[{n:"Sand"}], note:"2-2" },
    { r:"Half Sandy Block",s:"Chisel",i:[{n:"Sandy Block"}], note:"2-2" },
    { r:"Half Sandstone",  s:"Chisel",i:[{n:"Sandstone"}], note:"2-2" },
    { r:"Half Sandy Brick",s:"Chisel",i:[{n:"Sandy Brick"}], note:"2-2" },
    { r:"Half Mountain Block",s:"Chisel",i:[{n:"Mountain"}], note:"2-2" },
    { r:"Mosaic Floor",    s:"Chisel",i:[{n:"Red Glass",q:2},{n:"Blue Glass",q:2},{n:"Glue",q:4},{n:"Stone Block"}] },

    // ── SAW ───────────────────────────────────────────────────────────────
    { r:"Persian Rug Half Block",s:"Saw",i:[{n:"Persian Rug"}], note:"2-2" },
    { r:"Shop Sign",       s:"Saw",i:[{n:"Varnish"},{n:"New Wood Planks"},{n:"Yellow Dye"},{n:"Black Dye"}] },
    { r:"Drinks Sign",     s:"Saw",i:[{n:"Varnish"},{n:"New Wood Planks"},{n:"White Dye"},{n:"Black Dye"}] },
    { r:"Chest Sign",      s:"Saw",i:[{n:"Varnish"},{n:"New Wood Planks"},{n:"Orange Dye"},{n:"Black Dye"}] },
    { r:"Home Sign",       s:"Saw",i:[{n:"Varnish"},{n:"New Wood Planks"},{n:"Green Dye"},{n:"Black Dye"}] },
    { r:"Sticks",          s:"Saw",i:[{n:"Any Tree Top"}], note:"2-4" },
    { r:"Bark Block",      s:"Saw",i:[{n:"Tree Trunk",q:6},{n:"Glue"}] },
    { r:"Bark Block",      s:"Saw",i:[{n:"Pine Trunk",q:6},{n:"Glue"}] },
    { r:"Wood Planks",     s:"Saw",i:[{n:"Any Trunk"}] },
    { r:"New Wood Planks", s:"Saw",i:[{n:"Any Trunk"}] },
    { r:"Wood Post",       s:"Saw",i:[{n:"Any Trunk"}] },
    { r:"Half Grass",          s:"Saw",i:[{n:"Grass"}], note:"2-2" },
    { r:"Half Mountain Grass", s:"Saw",i:[{n:"Mountain Grass"}], note:"2-2" },
    { r:"Half Snow Block",     s:"Saw",i:[{n:"Snow"}], note:"2-2" },
    { r:"Half Tropical Grass", s:"Saw",i:[{n:"Tropical Grass"}], note:"2-2" },

    // ── WRENCH ────────────────────────────────────────────────────────────
    { r:"Sink",   s:"Wrench",i:[{n:"Porcelain",q:2},{n:"Pipe"}] },
    { r:"Toilet", s:"Wrench",i:[{n:"Porcelain",q:4},{n:"Pipe"},{n:"Water"},{n:"Rubber"}] },
    { r:"Fridge", s:"Wrench",i:[{n:"Ice"},{n:"Pipe"},{n:"Metal Plate",q:3},{n:"Rubber"}] },
    { r:"Stove",  s:"Wrench",i:[{n:"Coal"},{n:"Pipe"},{n:"Metal Plate",q:2}] },

    // ── MORTAR AND PESTLE ─────────────────────────────────────────────────
    { r:"Red Dye",    s:"Mortar And Pestle",i:[{n:"Red Flower"}], note:"15-25" },
    { r:"Blue Dye",   s:"Mortar And Pestle",i:[{n:"Blue Flower"}], note:"15-25" },
    { r:"Yellow Dye", s:"Mortar And Pestle",i:[{n:"Yellow Flower"}], note:"15-25" },
    { r:"Orange Dye", s:"Mortar And Pestle",i:[{n:"Red Flower"},{n:"Yellow Flower"}], note:"15-25" },
    { r:"Green Dye",  s:"Mortar And Pestle",i:[{n:"Blue Flower"},{n:"Yellow Flower"}], note:"15-25" },
    { r:"Purple Dye", s:"Mortar And Pestle",i:[{n:"Red Flower"},{n:"Blue Flower"}], note:"15-25" },
    { r:"Pink Dye",   s:"Mortar And Pestle",i:[{n:"White Flower"},{n:"Red Flower"}], note:"15-25" },
    { r:"Pink Dye",   s:"Mortar And Pestle",i:[{n:"Pink Flower"}], note:"15-25" },
    { r:"White Dye",  s:"Mortar And Pestle",i:[{n:"White Flower"}], note:"15-25" },
    { r:"Black Dye",  s:"Mortar And Pestle",i:[{n:"Red Flower"},{n:"Blue Flower"},{n:"Yellow Flower"}], note:"15-25" },
    { r:"Black Dye",  s:"Mortar And Pestle",i:[{n:"Coal"},{n:"Oil"}], note:"15-25" },
    { r:"Red Dye",    s:"Mortar And Pestle",i:[{n:"Yumberries"}], note:"10-15" },
    { r:"Yellow Dye", s:"Mortar And Pestle",i:[{n:"Sunberries"}], note:"10-15" },
    { r:"Green Dye",  s:"Mortar And Pestle",i:[{n:"Chiliberries"}], note:"10-15" },
    { r:"Blue Dye",   s:"Mortar And Pestle",i:[{n:"Frostberries"}], note:"10-15" },
    { r:"Orange Dye", s:"Mortar And Pestle",i:[{n:"Yumberries"},{n:"Sunberries"}], note:"10-15" },
    { r:"Green Dye",  s:"Mortar And Pestle",i:[{n:"Frostberries"},{n:"Sunberries"}], note:"10-15" },
    { r:"Purple Dye", s:"Mortar And Pestle",i:[{n:"Frostberries"},{n:"Yumberries"}], note:"10-15" },

    // ── COOKING ───────────────────────────────────────────────────────────
    { r:"Mud Cake",          s:"Cooking",i:[{n:"Farm Egg",q:2},{n:"Sugar"},{n:"Flour"},{n:"Mud"}] },
    { r:"Corn Bread",        s:"Cooking",i:[{n:"Flour"},{n:"Corn"},{n:"Sugar"},{n:"Farm Egg",q:2}] },
    { r:"Sunny Side Up Eggs",s:"Cooking",i:[{n:"Farm Egg",q:2}] },
    { r:"Veggie Omelette",   s:"Cooking",i:[{n:"Farm Egg",q:3},{n:"Eggplant"},{n:"Tomato"},{n:"Potato"}] },
    { r:"Scrambled Eggs",    s:"Cooking",i:[{n:"Farm Egg",q:3},{n:"Full Milk Jug"},{n:"Cooking Oil"}] },
    { r:"Fries",             s:"Cooking",i:[{n:"Potato",q:3},{n:"Tomato"},{n:"Sugar"},{n:"Cooking Oil"}] },
    { r:"Yumberry Cake",     s:"Cooking",i:[{n:"Flour"},{n:"Honey",q:2},{n:"Full Milk Jug"},{n:"Yumberries"}] },
    { r:"Chiliberry Cake",   s:"Cooking",i:[{n:"Flour"},{n:"Sugar",q:2},{n:"Full Milk Jug"},{n:"Chiliberries"}] },
    { r:"Mashed Potatoes",   s:"Cooking",i:[{n:"Potato",q:6},{n:"Full Milk Jug",q:2}] },
    { r:"Frostberry Pie",    s:"Cooking",i:[{n:"Frostberries",q:3},{n:"Honey",q:2},{n:"Full Milk Jug"},{n:"Flour"}] },
    { r:"Carrot Cake",       s:"Cooking",i:[{n:"Carrot",q:4},{n:"Flour"},{n:"Ice"},{n:"Sugar"}] },
    { r:"Carrot Soup",       s:"Cooking",i:[{n:"Carrot",q:3},{n:"Water"},{n:"Fern"},{n:"Farm Egg"}] },
    { r:"BBQ Drumstick",     s:"Cooking",i:[{n:"Raw Drumstick"},{n:"Chiliberries"},{n:"Tomato"},{n:"Flour"}] },
    { r:"BBQ Wing",          s:"Cooking",i:[{n:"Raw Wing"},{n:"Chiliberries"},{n:"Tomato"},{n:"Cooking Oil"}] },
    { r:"Pumpkin Puree",     s:"Cooking",i:[{n:"Pumpkin Skin"},{n:"Flour"},{n:"Tomato"},{n:"Water"}] },
    { r:"Roast Pumpkin",     s:"Cooking",i:[{n:"Pumpkin Slice"},{n:"Sticks"},{n:"Cooking Oil"},{n:"Tomato"}] },
    { r:"Ultimate Candy 2",  s:"Cooking",i:[{n:"Ghostly Wafer"},{n:"Pandan Munch-kin"},{n:"Eyebreaker"},{n:"TongueAndSweet"}] },

    // ── CUT-O-MATIK ───────────────────────────────────────────────────────
    { r:"Sculpty Stone",    s:"Cut-O-Matik 5000!",i:[{n:"Stone Block",q:5}], note:"5-5" },
    { r:"Sculpty Dirt",     s:"Cut-O-Matik 5000!",i:[{n:"Dirt",q:5}], note:"5-5" },
    { r:"Sculpty Grass",    s:"Cut-O-Matik 5000!",i:[{n:"Grass",q:5}], note:"5-5" },
    { r:"Sculpty New Wood", s:"Cut-O-Matik 5000!",i:[{n:"New Wood Block",q:5}], note:"5-5" },
    { r:"Sculpty Old Wood", s:"Cut-O-Matik 5000!",i:[{n:"Old Wood Block",q:5}], note:"5-5" },
    { r:"Sculpty Coal",     s:"Cut-O-Matik 5000!",i:[{n:"Coal Block",q:5}], note:"5-5" },
    { r:"Sculpty Bark",     s:"Cut-O-Matik 5000!",i:[{n:"Bark Block",q:5}], note:"5-5" },
    { r:"Sculpty Iron",     s:"Cut-O-Matik 5000!",i:[{n:"Iron Block",q:5}], note:"5-5" },
    { r:"Sculpty Clay",     s:"Cut-O-Matik 5000!",i:[{n:"Clay Block",q:5}], note:"5-5" },
    { r:"Sculpty Sand",     s:"Cut-O-Matik 5000!",i:[{n:"Sand",q:5}], note:"5-5" },
    { r:"White Pixel",      s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5}], note:"5-5" },
    { r:"Grey Pixel",       s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Black Dye"}], note:"5-5" },
    { r:"Light Grey Pixel", s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Black Dye"},{n:"White Dye"}], note:"5-5" },
    { r:"Indigo Pixel",     s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Blue Dye"}], note:"5-5" },
    { r:"Deep Green Pixel", s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Green Dye"}], note:"5-5" },
    { r:"Burnt Umber Pixel",s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Red Dye"},{n:"Black Dye"}], note:"5-5" },
    { r:"Dark Purple Pixel",s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Purple Dye"}], note:"5-5" },
    { r:"Light Blue Pixel", s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Blue Dye"},{n:"White Dye"}], note:"5-5" },
    { r:"Light Green Pixel",s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Green Dye"},{n:"White Dye"}], note:"5-5" },
    { r:"Tan Pixel",        s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Red Dye"},{n:"White Dye"}], note:"5-5" },
    { r:"Red Pixel",        s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Red Dye"}], note:"5-5" },
    { r:"Cyan Pixel",       s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Green Dye"},{n:"Blue Dye"}], note:"5-5" },
    { r:"Yellow Pixel",     s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Yellow Dye"}], note:"5-5" },
    { r:"Orange Pixel",     s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Yellow Dye"},{n:"Red Dye"}], note:"5-5" },
    { r:"Pink Pixel",       s:"Cut-O-Matik 5000!",i:[{n:"White Plaster",q:5},{n:"Pink Dye"}], note:"5-5" },

    // ── FORGE ─────────────────────────────────────────────────────────────
    { r:"Glass",            s:"Forge",i:[{n:"Sand"}], note:"Cook 3s" },
    { r:"Empty Jar",        s:"Forge",i:[{n:"Glass",q:2}], note:"Cook 30s" },
    { r:"Water",            s:"Forge",i:[{n:"Snow"}], note:"Cook 1s" },
    { r:"Water",            s:"Forge",i:[{n:"Ice"}], note:"Cook 1s" },
    { r:"Porcelain",        s:"Forge",i:[{n:"Clay Lump"}], note:"Cook 3s" },
    { r:"Lava",             s:"Forge",i:[{n:"Stone Block"}], note:"Cook 20s" },
    { r:"Cloud",            s:"Forge",i:[{n:"Water"}], note:"Cook 2s" },
    { r:"Charcoal",         s:"Forge",i:[{n:"Any Trunk"}], note:"Cook 5s" },
    { r:"Refined Iron",     s:"Forge",i:[{n:"Iron"}], note:"Cook 5s" },
    { r:"Refined Iron Ball",s:"Forge",i:[{n:"Refined Iron"}], note:"Cook 5s" },
    { r:"Refined Steel",    s:"Forge",i:[{n:"Steel Block"}], note:"Cook 8s" },
    { r:"Vulcanized Rubber",s:"Forge",i:[{n:"Rubber"}], note:"Cook 3s" },
    { r:"Gold Magic Gem",   s:"Forge",i:[{n:"Gold Magic Dust",q:4}], note:"Cook 60s" },
    { r:"Blue Magic Gem",   s:"Forge",i:[{n:"Blue Magic Dust",q:4}], note:"Cook 60s" },
    { r:"Purple Magic Gem", s:"Forge",i:[{n:"Purple Magic Dust",q:4}], note:"Cook 60s" },
    { r:"Red Magic Gem",    s:"Forge",i:[{n:"Red Magic Dust",q:4}], note:"Cook 60s" },
    { r:"Ghost Dust",       s:"Forge",i:[{n:"Ghost Gum",q:5}], note:"Cook 60s" },

    // ── EXTRACTOR ─────────────────────────────────────────────────────────
    { r:"Pine Resin",       s:"Extractor",i:[{n:"Pine Trunk"}], note:"Process 3s" },
    { r:"Clay Lump",        s:"Extractor",i:[{n:"Mud"}], note:"Process 3s" },
    { r:"Paper",            s:"Extractor",i:[{n:"Tree Trunk"}], note:"Process 20s" },
    { r:"Ghost Gum",        s:"Extractor",i:[{n:"Dead Tree"}], note:"Process 30s" },
    { r:"Flour",            s:"Extractor",i:[{n:"Wheat Bundle"}], note:"Process 10s" },
    { r:"Sugar",            s:"Extractor",i:[{n:"Sugarcane"}], note:"Process 15s" },
    { r:"Cooking Oil",      s:"Extractor",i:[{n:"Corn"}], note:"Process 15s" },
    { r:"Fiber",            s:"Extractor",i:[{n:"Thorny Vines"}], note:"Process 10s" },
    { r:"Crushed Artifact", s:"Extractor",i:[{n:"Any Artifact"}], note:"Process 25s · 10-10" },
    { r:"Copy Canvas",      s:"Extractor",i:[{n:"Master Canvas"}], note:"Process 10s" },

    // ── DISTILLER ─────────────────────────────────────────────────────────
    { r:"Solvent",       s:"Distiller",i:[{n:"Yumberries"}], note:"Distill 10s" },
    { r:"Sunny Potion",  s:"Distiller",i:[{n:"Sunberries"}], note:"Distill 20s" },
    { r:"Spicy Potion",  s:"Distiller",i:[{n:"Chiliberries"}], note:"Distill 20s" },
    { r:"Fiery Potion",  s:"Distiller",i:[{n:"Red Flower",q:3}], note:"Distill 15s" },
  ];

  // ── BUILD LIST ────────────────────────────────────────────────────────────
  function buildList() {
    const seen = new Set();
    for (const recipe of RECIPES) {
      const key = recipe.r + "|" + recipe.s + "|" + recipe.i.map(x=>x.n).join(",");
      if (seen.has(key)) continue;
      seen.add(key);
      state.all.push(recipe);
    }
    state.all.sort((a,b) => a.r.localeCompare(b.r));
    state.filtered = state.all;
    console.log("✅ CC Recipes: " + state.all.length + " recipes loaded");
    showPlaceholder();
  }

  // ── DISPLAY ───────────────────────────────────────────────────────────────
  function showPlaceholder() {
    recipeDisplay.innerHTML =
      '<div style="padding:10px;color:#888;font-size:11px;text-align:center;">Search for any item to see its recipe<br><span style="color:#555;font-size:10px;">Tip: input number next to the search bar to scale ingredients</span></div>';
  }

  function renderDropdown(list) {
    dropdown.innerHTML = "";
    if (!list.length) { dropdown.style.display="none"; return; }
    list.slice(0,10).forEach(rec => {
      const row = document.createElement("div");
      Object.assign(row.style, {
        padding:"4px 6px", cursor:"pointer", fontSize:"11px",
        borderBottom:"1px solid rgba(255,255,255,0.08)",
        display:"flex", alignItems:"center", gap:"6px"
      });
      row.append(makeImg(rec.r, 16));
      const tx = document.createElement("span");
      tx.textContent = rec.r + (rec.note ? " (" + rec.note + ")" : "");
      tx.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;";
      row.appendChild(tx);
      const stTx = document.createElement("span");
      stTx.textContent = rec.s;
      stTx.style.cssText = "font-size:9px;color:#88aaff;flex-shrink:0;";
      row.appendChild(stTx);
      row.onmouseenter = () => row.style.background = "rgba(255,255,255,0.1)";
      row.onmouseleave = () => row.style.background = "";
      row.onclick = () => {
        renderRecipe(rec);
        recipeSearch.value = rec.r;
        dropdown.style.display = "none";
      };
      dropdown.appendChild(row);
    });
    dropdown.style.display = "block";
  }

  function getAmount() {
    const v = parseInt(amountInput.value);
    return (!isNaN(v) && v >= 1) ? v : 1;
  }

  function renderRecipe(rec) {
    state.currentRecipe = rec;
    recipeDisplay.innerHTML = "";
    const amount = getAmount();
    const wrap = document.createElement("div");
    wrap.style.padding = "6px";

    const parsed = parseNote(rec.note);
    const badges = buildNoteBadge(rec.note);

    // Header
    const hdr = document.createElement("div");
    hdr.style.cssText = "text-align:center;margin-bottom:6px;";
    const ttlText = amount > 1 ? `${rec.r} ×${amount}` : rec.r;
    const ttl = document.createElement("div");
    ttl.innerHTML = `<span style="font-size:12px;font-weight:bold;color:#00ff88;">${ttlText}</span>`;
    const bigImg = makeImg(rec.r, 32);
    bigImg.style.border = "2px solid rgba(255,255,255,0.2)";
    bigImg.style.marginTop = "3px";
    hdr.append(ttl, bigImg);
    wrap.appendChild(hdr);

    // Amount banner
    if (amount > 1) {
      const amtBanner = document.createElement("div");
      amtBanner.style.cssText = "text-align:center;margin-bottom:4px;font-size:10px;color:#ffcc44;background:rgba(255,200,0,0.1);border-radius:4px;padding:2px 6px;border:1px solid rgba(255,200,0,0.3);";
      amtBanner.textContent = `Crafting ×${amount} — ingredients scaled`;
      wrap.appendChild(amtBanner);
    }

    // Note badges
    if (badges && badges.length) {
      const badgeRow = document.createElement("div");
      badgeRow.style.cssText = "display:flex;flex-wrap:wrap;gap:3px;margin-bottom:5px;justify-content:center;";
      badges.forEach(b => {
        const badge = document.createElement("span");
        badge.textContent = b.text;
        badge.style.cssText = `font-size:10px;color:${b.color};background:rgba(255,255,255,0.08);border-radius:4px;padding:2px 6px;border:1px solid rgba(255,255,255,0.12);`;
        badgeRow.appendChild(badge);
      });
      wrap.appendChild(badgeRow);
    }

    // Station
    const stRow = document.createElement("div");
    stRow.style.cssText = "background:rgba(0,0,0,0.3);border-radius:4px;padding:3px 6px;margin-bottom:4px;display:flex;align-items:center;gap:6px;";
    const stLbl = document.createElement("span");
    stLbl.style.cssText = "font-size:10px;color:#88aaff;";
    stLbl.textContent = "Station: ";
    const stImg = makeImg(rec.s, 14);
    const stTx = document.createElement("span");
    stTx.style.cssText = "font-size:11px;padding:1px 4px;background:rgba(100,100,255,0.2);border-radius:3px;";
    stTx.textContent = rec.s;
    stRow.append(stLbl, stImg, stTx);
    wrap.appendChild(stRow);

    // Ingredients
    const ingBox = document.createElement("div");
    ingBox.style.cssText = "background:rgba(0,0,0,0.3);border-radius:4px;padding:4px 6px;";
    const ingLbl = document.createElement("div");
    ingLbl.style.cssText = "font-size:10px;color:#88aaff;margin-bottom:2px;";
    ingLbl.textContent = amount > 1 ? `Ingredients (×${amount} total):` : "Ingredients:";
    ingBox.appendChild(ingLbl);

    rec.i.forEach(ing => {
      const baseQty = ing.q || 1;
      const scaledQty = baseQty * amount;
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:4px;padding:2px 4px;background:rgba(0,80,0,0.25);border-radius:3px;margin-bottom:2px;border-left:2px solid #00ff88;";

      const qtyBadge = document.createElement("span");
      const showScaled = amount > 1 && baseQty > 1;
      qtyBadge.textContent = "×" + scaledQty;
      if (amount > 1 && baseQty > 1) {
        qtyBadge.title = `${baseQty} × ${amount}`;
      }
      qtyBadge.style.cssText = [
        "font-size:11px", "font-weight:bold",
        "min-width:26px", "text-align:center", "flex-shrink:0",
        scaledQty > 1 ? "color:#ffcc44" : "color:#aaa"
      ].join(";");

      // Show breakdown if scaled
      const tx = document.createElement("span");
      tx.style.cssText = "font-size:10px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
      if (amount > 1 && baseQty > 1) {
        tx.innerHTML = `${ing.n} <span style="color:#666;font-size:9px;">(${baseQty}×${amount})</span>`;
      } else {
        tx.textContent = ing.n;
      }

      row.append(qtyBadge, makeImg(ing.n, 16), tx);
      ingBox.appendChild(row);
    });

    // Output
    if (parsed && parsed.yield) {
      const scaledOut = parsed.yield.output * amount;
      const outRow = document.createElement("div");
      outRow.style.cssText = "margin-top:4px;padding:3px 6px;background:rgba(0,60,30,0.5);border-radius:3px;border-left:2px solid #00ff88;display:flex;align-items:center;gap:6px;";
      const outLbl = document.createElement("span");
      outLbl.style.cssText = "font-size:10px;color:#aaa;";
      outLbl.textContent = "Yields:";
      const outVal = document.createElement("span");
      outVal.style.cssText = "font-size:11px;color:#00ff88;font-weight:bold;";
      outVal.textContent = "×" + scaledOut + " " + rec.r;
      const outImg = makeImg(rec.r, 14);
      outRow.append(outLbl, outImg, outVal);
      ingBox.appendChild(outRow);
    }

    wrap.appendChild(ingBox);
    recipeDisplay.appendChild(wrap);
  }

  // ── PARSE SEARCH — supports "sandstone 10" style ──────────────────────────
  function parseSearch(raw) {
    const trimmed = raw.trim();
    const match = trimmed.match(/^(.+?)\s+(\d+)$/);
    if (match) {
      const num = parseInt(match[2]);
      if (num >= 1 && num <= 9999) {
        return { query: match[1].trim(), amount: num };
      }
    }
    return { query: trimmed, amount: null };
  }

  // ── EVENTS ────────────────────────────────────────────────────────────────
  recipeSearch.addEventListener("input", () => {
    const raw = recipeSearch.value;
    if (!raw.trim()) { dropdown.style.display="none"; showPlaceholder(); return; }
    const { query, amount } = parseSearch(raw);
    if (amount !== null) {
      amountInput.value = amount;
      state.amount = amount;
    }
    state.filtered = state.all.filter(r => r.r.toLowerCase().includes(query.toLowerCase()));
    renderDropdown(state.filtered);
    // Auto-render if currently showing a recipe so scaling updates live
    if (state.currentRecipe) renderRecipe(state.currentRecipe);
  });

  recipeSearch.addEventListener("keydown", e => {
    if (e.key === "Enter" && state.filtered.length) {
      const rec = state.filtered[0];
      const { query } = parseSearch(recipeSearch.value);
      renderRecipe(rec);
      recipeSearch.value = rec.r + (getAmount() > 1 ? " " + getAmount() : "");
      dropdown.style.display = "none";
    }
    if (e.key === "Escape") dropdown.style.display = "none";
  });

  let amountDebounce = null;
  amountInput.addEventListener("input", () => {
    clearTimeout(amountDebounce);
    amountDebounce = setTimeout(() => {
      state.amount = getAmount();
      if (state.currentRecipe) renderRecipe(state.currentRecipe);
    }, 150);
  });

  amountInput.addEventListener("change", () => {
    clearTimeout(amountDebounce);
    state.amount = getAmount();
    if (state.currentRecipe) renderRecipe(state.currentRecipe);
  });

  document.addEventListener("mousedown", e => {
    if (!recipesContent.contains(e.target)) dropdown.style.display = "none";
  });

  // ── BOOT ──────────────────────────────────────────────────────────────────
  buildList();
  loadImageMap();
})();