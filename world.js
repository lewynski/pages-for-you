// ============================================================
// The Huge Pixel World: 6 zones, procedural pixel-art map,
// drag / WASD camera, teleport map, and app icon placement.
// ============================================================
(() => {
  const W = 3000, H = 1500;

  const ZONES = {
    plaza:  { label: "Pixel Plaza",    icon: "🏠", x: 0,    y: 0 },
    garden: { label: "Sakura Garden",  icon: "🌸", x: 1000, y: 0 },
    cove:   { label: "Candle Cove",    icon: "🕯️", x: 2000, y: 0 },
    arcade: { label: "Heart Arcade",   icon: "🎮", x: 0,    y: 750 },
    cafe:   { label: "Boba Café",      icon: "🧋", x: 1000, y: 750 },
    sky:    { label: "Star Deck",      icon: "⭐", x: 2000, y: 750 }
  };

  // Core apps (existing) + mini games (new). x,y are world coordinates.
  const OBJECTS = [
    { id: "quotes", x: 90,  y: 110, label: "Quote Jar",    art: "icon-quotes" },
    { id: "pets",   x: 240, y: 110, label: "Pet Corner",   art: "icon-pets" },
    { id: "diary",  x: 390, y: 110, label: "Secret Diary", art: "icon-diary" },
    { id: "melody", x: 90,  y: 270, label: "Melody Box",   art: "icon-melody" },
    { id: "clues",  x: 240, y: 270, label: "Clue Log",     art: "icon-clues" },
    { id: "vault",  x: 700, y: 150, label: "Secret Vault 🔒", art: "icon-vault", secret: true },

    { id: "petals",   x: 1120, y: 140, label: "Love Petals",   emoji: "🌼", title: "🌼 Love_Petals.exe",    w: 440 },
    { id: "fountain", x: 1500, y: 240, label: "Wishing Fountain", emoji: "⛲", title: "⛲ Wishing_Fountain.exe", w: 460 },
    { id: "heartrain",x: 1800, y: 140, label: "Heart Rain",    emoji: "💗", title: "💗 Heart_Rain.exe",     w: 470 },

    { id: "candle", x: 2150, y: 170, label: "Candle Flames", emoji: "🕯️", title: "🕯️ Candle_Flames.exe",  w: 540 },
    { id: "tarot",  x: 2480, y: 260, label: "Love Tarot",    emoji: "🔮", title: "🔮 Love_Tarot.exe",     w: 520 },

    { id: "memory", x: 130, y: 880,  label: "Memory Match",  emoji: "🃏", title: "🃏 Memory_Match.exe",   w: 460 },
    { id: "calc",   x: 360, y: 990,  label: "Love Calculator", emoji: "🧮", title: "🧮 Love_Calculator.exe", w: 440 },
    { id: "quiz",   x: 620, y: 880,  label: "Love Quiz",     emoji: "📝", title: "📝 Love_Quiz.exe",      w: 480 },

    { id: "cookie", x: 1150, y: 900, label: "Fortune Cookie", emoji: "🥠", title: "🥠 Fortune_Cookie.exe", w: 440 },
    { id: "potion", x: 1480, y: 1010, label: "Love Potion",   emoji: "🧪", title: "🧪 Love_Potion.exe",    w: 480 },

    { id: "stars",  x: 2200, y: 900, label: "Constellation", emoji: "✨", title: "✨ Constellation.exe",  w: 470 },
    { id: "ball",   x: 2560, y: 1010, label: "Magic 8-Ball",  emoji: "🎱", title: "🎱 Magic_8_Ball.exe",   w: 440 }
  ];

  window.GAME_META = {};
  OBJECTS.filter((o) => o.emoji).forEach((o, i) => {
    window.GAME_META[o.id] = { title: o.title, width: o.w, x: 170 + (i % 4) * 22, y: 34 + (i % 4) * 18 };
  });
  window.WORLD_OBJECTS = OBJECTS;

  const desktop = document.getElementById("desktop");
  const viewport = document.getElementById("world-viewport");
  const world = document.getElementById("world");

  // ----------------------------------------------------------
  // Procedural pixel-art world drawing
  // ----------------------------------------------------------
  function drawWorld() {
    const canvas = document.getElementById("world-canvas");
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext("2d");
    g.imageSmoothingEnabled = false;

    let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, w | 0, h | 0); };

    const blocked = [];
    OBJECTS.forEach((o) => blocked.push([o.x - 50, o.y - 40, 200, 200]));
    [0, 1000, 2000].forEach((zx) => blocked.push([zx, 530, 1000, 210]));
    const paths = [
      [500, 350, 2000, 64], [500, 1100, 2000, 64],
      [468, 375, 64, 750], [1468, 375, 64, 750], [2468, 375, 64, 750]
    ];
    paths.forEach((p) => blocked.push([p[0] - 20, p[1] - 20, p[2] + 40, p[3] + 40]));
    const free = (x, y, w, h) => !blocked.some((b) => x < b[0] + b[2] && x + w > b[0] && y < b[1] + b[3] && y + h > b[1]);

    // Base pink grass
    for (let ty = 0; ty < H / 16; ty++) {
      for (let tx = 0; tx < W / 16; tx++) {
        R(tx * 16, ty * 16, 16, 16, (tx + ty) % 2 ? "#ffd9ea" : "#ffd0e4");
      }
    }
    for (let i = 0; i < 700; i++) {
      const x = rnd() * W, y = rnd() * H;
      R(x, y, 4, 4, rnd() > 0.5 ? "#ffe9f3" : "#ffb8d6");
    }

    const inner = (z) => [z.x + 24, z.y + 24, 952, 702];
    const frame = (x, y, w, h) => {
      R(x - 8, y - 8, w + 16, 8, "#6b2649"); R(x - 8, y + h, w + 16, 8, "#6b2649");
      R(x - 8, y, 8, h, "#6b2649"); R(x + w, y, 8, h, "#6b2649");
      R(x, y, w, 4, "rgba(255,255,255,.55)");
      R(x, y + h - 6, w, 6, "rgba(107,38,73,.18)");
    };

    // Decor helpers
    const tree = (cx, base) => {
      R(cx - 34, base - 4, 68, 8, "rgba(107,38,73,.2)");
      R(cx - 6, base - 52, 12, 52, "#7a4a3a");
      R(cx - 40, base - 112, 80, 50, "#ff9ec9");
      R(cx - 54, base - 98, 108, 30, "#ff9ec9");
      R(cx - 28, base - 126, 56, 20, "#ffb8d9");
      for (let i = 0; i < 14; i++) R(cx - 50 + rnd() * 98, base - 118 + rnd() * 54, 6, 6, rnd() > 0.5 ? "#ffffff" : "#ff6ea8");
    };
    const flower = (x, y) => {
      const col = ["#ff4f9a", "#ffffff", "#ffbe3b", "#b58cff"][(rnd() * 4) | 0];
      R(x + 2, y + 6, 2, 6, "#4aa96c");
      R(x, y + 2, 6, 2, col); R(x + 2, y, 2, 6, col); R(x + 2, y + 2, 2, 2, "#fff2a8");
    };
    const glow = (x, y, r, rgba) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, rgba); gr.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const candle = (x, y) => {
      glow(x + 4, y - 6, 34, "rgba(255,210,130,.45)");
      R(x, y, 8, 18, "#fff5f9"); R(x, y, 8, 3, "#ffc4df"); R(x + 3, y - 8, 3, 8, "#ffbe3b"); R(x + 3, y - 10, 3, 3, "#fff2a8");
      R(x - 2, y + 18, 12, 3, "#6b2649");
    };
    const scatter = (zone, count, w, h, fn) => {
      const [ix, iy, iw, ih] = inner(zone);
      let tries = 0, placed = 0;
      while (placed < count && tries < count * 40) {
        tries++;
        const x = ix + 30 + rnd() * (iw - 60 - w), y = iy + 30 + rnd() * (ih - 60 - h);
        if (!free(x, y, w, h)) continue;
        blocked.push([x - 10, y - 10, w + 20, h + 20]);
        fn(x, y); placed++;
      }
    };

    // ---------- Plaza: cobblestone ----------
    {
      const z = ZONES.plaza; const [x, y, w, h] = inner(z);
      for (let ty = 0; ty < h; ty += 32) for (let tx = 0; tx < w; tx += 32) {
        R(x + tx, y + ty, 32, 32, ((tx + ty) / 32) % 2 ? "#fff0f6" : "#ffe6f0");
        R(x + tx, y + ty, 32, 2, "#ffc4df"); R(x + tx, y + ty, 2, 32, "#ffc4df");
      }
      frame(x, y, w, h);
      // welcome rug under core apps
      R(x + 40, y + 70, 420, 260, "#ffd1e6"); R(x + 48, y + 78, 404, 244, "#ffe4f0");
      R(x + 48, y + 78, 404, 6, "#ff85b8"); R(x + 48, y + 316, 404, 6, "#ff85b8");
      // vault building
      R(640, 90, 180, 150, "#6b2649"); R(646, 96, 168, 138, "#ffd1e6"); R(646, 96, 168, 22, "#ff4f9a");
      R(716, 168, 28, 66, "#6b2649"); R(722, 174, 16, 60, "#ffbe3b");
      scatter(z, 22, 6, 12, flower);
    }
    // ---------- Garden: grass + blossoms ----------
    {
      const z = ZONES.garden; const [x, y, w, h] = inner(z);
      for (let ty = 0; ty < h; ty += 16) for (let tx = 0; tx < w; tx += 16) {
        R(x + tx, y + ty, 16, 16, ((tx + ty) / 16) % 2 ? "#e3f7d4" : "#d9f0c8");
      }
      frame(x, y, w, h);
      for (let i = 0; i < 90; i++) R(x + rnd() * w, y + rnd() * h, 4, 6, "#bfe3a8");
      // fountain plaza
      R(1400, 160, 280, 190, "#fff0f6"); R(1400, 160, 280, 6, "#ffc4df"); R(1400, 344, 280, 6, "#ffc4df");
      scatter(z, 44, 8, 14, flower);
      scatter(z, 9, 110, 130, (px, py) => tree(px + 55, py + 125));
    }
    // ---------- Cove: candle-lit night ----------
    {
      const z = ZONES.cove; const [x, y, w, h] = inner(z);
      for (let ty = 0; ty < h; ty += 32) for (let tx = 0; tx < w; tx += 32) {
        R(x + tx, y + ty, 32, 32, ((tx + ty) / 32) % 2 ? "#7a3a63" : "#6e3358");
      }
      frame(x, y, w, h);
      R(2120, 110, 700, 260, "#c24b86"); R(2132, 122, 676, 236, "#e0709f");
      for (let i = 0; i < 676; i += 24) { R(2132 + i, 122, 12, 8, "#ffd1e6"); R(2132 + i, 350, 12, 8, "#ffd1e6"); }
      scatter(z, 16, 12, 24, candle);
    }
    // ---------- Arcade: neon checker ----------
    {
      const z = ZONES.arcade; const [x, y, w, h] = inner(z);
      for (let ty = 0; ty < h; ty += 32) for (let tx = 0; tx < w; tx += 32) {
        R(x + tx, y + ty, 32, 32, ((tx + ty) / 32) % 2 ? "#ffffff" : "#ffc4df");
      }
      frame(x, y, w, h);
      R(x, y, w, 12, "#ff4f9a"); R(x, y + 12, w, 4, "#b58cff");
      const cols = ["#6ecbff", "#ffbe3b", "#ff4f9a", "#b58cff", "#4aa96c", "#ff7a3b"];
      for (let i = 0; i < 7; i++) {
        const cx = x + 40 + i * 132, cy = y + 30;
        R(cx, cy, 64, 84, "#3b1c4d"); R(cx + 6, cy + 8, 52, 34, cols[i % 6]); R(cx + 10, cy + 12, 12, 6, "rgba(255,255,255,.7)");
        R(cx + 8, cy + 54, 14, 8, "#ff4f9a"); R(cx + 38, cy + 56, 8, 8, "#ffbe3b");
      }
    }
    // ---------- Cafe: wood floor ----------
    {
      const z = ZONES.cafe; const [x, y, w, h] = inner(z);
      for (let ty = 0; ty < h; ty += 16) {
        for (let tx = 0; tx < w; tx += 96) R(x + tx + ((ty / 16) % 2) * 48, y + ty, 96, 16, ((tx / 96 + ty / 16) % 2) ? "#f3c6a8" : "#ecb999");
        R(x, y + ty, w, 2, "rgba(107,38,73,.14)");
      }
      frame(x, y, w, h);
      R(x, y, w, 56, "#8a4b2e"); R(x, y + 40, w, 16, "#6b2649");
      for (let i = 0; i < 8; i++) { R(x + 30 + i * 112, y + 12, 28, 24, "#fff5f9"); R(x + 36 + i * 112, y + 18, 16, 12, "#ff85b8"); }
      R(1180, 1070, 520, 6, "rgba(255,79,154,.0)");
      scatter(z, 8, 56, 40, (px, py) => {
        R(px - 4, py + 30, 64, 8, "rgba(107,38,73,.2)");
        R(px + 4, py, 48, 30, "#ff99c4"); R(px + 8, py + 4, 40, 6, "#ffd1e6"); R(px + 22, py + 30, 12, 10, "#6b2649");
        R(px + 20, py + 10, 14, 10, "#fff5f9"); R(px + 22, py + 12, 10, 4, "#8a4b2e");
      });
    }
    // ---------- Star Deck: night sky ----------
    {
      const z = ZONES.sky; const [x, y, w, h] = inner(z);
      for (let ty = 0; ty < h; ty += 32) for (let tx = 0; tx < w; tx += 32) {
        R(x + tx, y + ty, 32, 32, ((tx + ty) / 32) % 2 ? "#2d1440" : "#33173f");
      }
      frame(x, y, w, h);
      for (let i = 0; i < 160; i++) R(x + rnd() * w, y + rnd() * h, 3, 3, rnd() > 0.5 ? "#ffffff" : "#ffd1e6");
      g.fillStyle = "#fff2c2"; g.beginPath(); g.arc(2840, 840, 46, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#33173f"; g.beginPath(); g.arc(2860, 828, 40, 0, Math.PI * 2); g.fill();
      // telescope
      R(2700, 1250, 8, 70, "#ff99c4"); R(2760, 1250, 8, 70, "#ff99c4"); R(2680, 1210, 120, 24, "#ff4f9a"); R(2790, 1200, 30, 14, "#ffd1e6");
    }

    // ---------- Paths between zones ----------
    paths.forEach(([px, py, pw, ph]) => {
      R(px - 6, py - 6, pw + 12, ph + 12, "#6b2649");
      for (let ty = 0; ty < ph; ty += 16) for (let tx = 0; tx < pw; tx += 16) {
        R(px + tx, py + ty, 16, 16, ((tx + ty) / 16) % 2 ? "#fff5f9" : "#ffeaf3");
      }
    });
    // Lamp posts along paths
    [[560, 330], [900, 330], [1900, 330], [2300, 330], [560, 1180], [900, 1180], [1900, 1180], [2300, 1180]].forEach(([lx, ly]) => {
      glow(lx + 4, ly - 30, 46, "rgba(255,230,160,.4)");
      R(lx, ly - 30, 8, 40, "#6b2649"); R(lx - 6, ly - 44, 20, 16, "#ffe49a"); R(lx - 6, ly - 46, 20, 4, "#6b2649");
    });
  }

  // ----------------------------------------------------------
  // DOM objects: app icons, zone signs, ambient creatures
  // ----------------------------------------------------------
  function buildObjects() {
    OBJECTS.forEach((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "desktop-icon world-obj" + (o.secret ? " desktop-icon-secret" : "");
      if (o.secret) b.id = "vault-desktop-icon";
      b.dataset.app = o.id;
      b.style.left = o.x + "px";
      b.style.top = o.y + "px";
      b.innerHTML = `<span class="icon-art ${o.art || "icon-emoji"}" aria-hidden="true">${o.emoji || ""}</span><span class="icon-label">${o.label}</span>`;
      world.appendChild(b);
    });

    Object.values(ZONES).forEach((z) => {
      const s = document.createElement("div");
      s.className = "zone-sign";
      s.style.left = z.x + 50 + "px";
      s.style.top = z.y + 38 + "px";
      s.textContent = `${z.icon} ${z.label}`;
      world.appendChild(s);
    });

    for (let i = 0; i < 6; i++) {
      const c = document.createElement("div");
      c.className = "cloud";
      c.style.top = 40 + ((i * 263) % 1300) + "px";
      c.style.animationDuration = 90 + i * 17 + "s";
      c.style.animationDelay = -i * 23 + "s";
      world.appendChild(c);
    }
    for (let i = 0; i < 9; i++) {
      const b = document.createElement("div");
      b.className = "butterfly";
      b.textContent = "🦋";
      b.style.left = 1080 + i * 100 + "px";
      b.style.top = 380 + (i % 3) * 40 + "px";
      b.style.animationDelay = -i * 1.3 + "s";
      b.style.animationDuration = 7 + (i % 4) * 2 + "s";
      world.appendChild(b);
    }
    for (let i = 0; i < 26; i++) {
      const f = document.createElement("div");
      f.className = "firefly";
      f.style.left = 2060 + ((i * 97) % 880) + "px";
      f.style.top = 70 + ((i * 53) % 640) + "px";
      f.style.animationDelay = -(i % 7) * 0.7 + "s";
      world.appendChild(f);
    }
    for (let i = 0; i < 4; i++) {
      const f = document.createElement("div");
      f.className = "shooting-star";
      f.style.left = 2100 + i * 220 + "px";
      f.style.top = 790 + i * 40 + "px";
      f.style.animationDelay = -i * 2.5 + "s";
      world.appendChild(f);
    }

    // Move pets into the world so they roam the big plaza row
    const pets = document.getElementById("pets-layer");
    if (pets) world.appendChild(pets);
  }

  // ----------------------------------------------------------
  // Camera: drag, keys, teleport
  // ----------------------------------------------------------
  const cam = { x: 0, y: 0 };
  window.WORLD = { cam, W, H, ZONES };
  let mapButtons = {};

  function clamp() {
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    cam.x = Math.max(0, Math.min(W - vw, cam.x));
    cam.y = Math.max(0, Math.min(H - vh, cam.y));
  }
  function apply() {
    clamp();
    world.style.transform = `translate(${-cam.x}px, ${-cam.y}px)`;
    const cx = cam.x + viewport.clientWidth / 2, cy = cam.y + viewport.clientHeight / 2;
    let cur = null;
    Object.entries(ZONES).forEach(([k, z]) => {
      if (cx >= z.x && cx < z.x + 1000 && cy >= z.y && cy < z.y + 750) cur = k;
    });
    Object.entries(mapButtons).forEach(([k, b]) => b.classList.toggle("active", k === cur));
  }
  function goTo(key) {
    const z = ZONES[key];
    world.classList.remove("dragging");
    cam.x = z.x; cam.y = z.y;
    apply();
    if (window.pixelAudio) window.pixelAudio.openWindow();
  }
  window.WORLD.goTo = goTo;

  function initCamera() {
    let drag = null;
    viewport.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".world-obj, .pixel-pet")) return;
      drag = { sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y };
      world.classList.add("dragging");
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener("pointermove", (e) => {
      if (!drag) return;
      cam.x = drag.cx - (e.clientX - drag.sx);
      cam.y = drag.cy - (e.clientY - drag.sy);
      apply();
    });
    const end = () => { drag = null; world.classList.remove("dragging"); };
    viewport.addEventListener("pointerup", end);
    viewport.addEventListener("pointercancel", end);

    document.addEventListener("keydown", (e) => {
      if (document.activeElement && document.activeElement !== document.body) return;
      const step = 120;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") cam.x -= step;
      else if (k === "arrowright" || k === "d") cam.x += step;
      else if (k === "arrowup" || k === "w") cam.y -= step;
      else if (k === "arrowdown" || k === "s") cam.y += step;
      else return;
      e.preventDefault();
      apply();
    });
    window.addEventListener("resize", apply);
  }

  function buildMapPanel() {
    const panel = document.createElement("div");
    panel.className = "world-map";
    panel.innerHTML = `<div class="world-map-title">🗺️ WORLD MAP</div><div class="world-map-grid"></div>
      <div class="world-map-hint">drag the world · WASD / arrows</div>
      <button class="pixel-btn pixel-btn-xs" id="toggle-widgets" type="button">🗔 Widgets</button>`;
    const grid = panel.querySelector(".world-map-grid");
    Object.entries(ZONES).forEach(([k, z]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pixel-btn pixel-btn-xs map-btn";
      b.title = z.label;
      b.innerHTML = `${z.icon}<span>${z.label.split(" ")[1] || z.label}</span>`;
      b.addEventListener("click", () => goTo(k));
      mapButtons[k] = b;
      grid.appendChild(b);
    });
    desktop.appendChild(panel);
    panel.querySelector("#toggle-widgets").addEventListener("click", () => {
      document.querySelector(".desktop-widgets").classList.toggle("hidden");
    });
  }

  function buildStartMenuGames() {
    const menu = document.getElementById("start-menu");
    const themeSection = menu.querySelectorAll(".start-menu-section")[1];
    const sec = document.createElement("div");
    sec.className = "start-menu-section";
    sec.innerHTML = `<div class="start-menu-label">Love Mini Games</div>` +
      OBJECTS.filter((o) => o.emoji).map((o) => `<button class="start-item" data-app="${o.id}" type="button">${o.emoji} ${o.label}</button>`).join("");
    menu.insertBefore(sec, themeSection);
  }

  const bgc = document.getElementById("bg-canvas");
  if (bgc) viewport.appendChild(bgc);
  drawWorld();
  buildObjects();
  buildMapPanel();
  buildStartMenuGames();
  initCamera();
  apply();
})();
