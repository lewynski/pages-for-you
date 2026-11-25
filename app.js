// ============================================================
// PINK.OS // PAGES FOR YOU — Main Application & Puzzle Engine
// ============================================================

(() => {
  const CFG = window.PAGES_CONFIG;

  // Decode hidden secret payload only at runtime
  function getSecret() {
    try {
      return JSON.parse(atob(CFG._secretPayload));
    } catch {
      return { passcode: "", badge: "SECRET UNLOCKED ✨", heading: "Hey you," };
    }
  }

  // Global App State
  const state = {
    zIndex: 30,
    windows: new Map(), // appId -> { el, minimized, title }
    cluesFound: {
      quotes: false,
      pets: false,
      diary: false,
      melody: false
    },
    vaultUnlocked: false,
    quotePulls: 0,
    quoteIndex: 0,
    diaryPage: 0,
    uvLightOn: false,
    melodyTarget: ["C", "E", "G", "B"],
    melodyStep: 0,
    stickyIndex: 0,
    plantLevel: 1,
    petsManager: null
  };

  // DOM References
  const windowsLayer = document.getElementById("windows-layer");
  const taskbarWindows = document.getElementById("taskbar-windows");
  const toastContainer = document.getElementById("toast-container");
  const startBtn = document.getElementById("start-btn");
  const startMenu = document.getElementById("start-menu");

  // ============================================================
  // 1. Boot Screen Animation
  // ============================================================
  function initBootScreen() {
    const bootScreen = document.getElementById("boot-screen");
    const bar = document.getElementById("boot-progress-bar");
    const status = document.getElementById("boot-status");
    const enterBtn = document.getElementById("boot-enter-btn");

    const steps = [
      { pct: 25, text: "Sprinkling pixel sakura petals..." },
      { pct: 55, text: "Waking up Mochi, Boba & Pudding..." },
      { pct: 85, text: "Hiding 4 secret clues in the workspace..." },
      { pct: 100, text: "Ready! Welcome to PINK.OS ♥" }
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < steps.length) {
        bar.style.width = `${steps[idx].pct}%`;
        status.textContent = steps[idx].text;
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 320);

    const enterWorkspace = () => {
      clearInterval(interval);
      bar.style.width = "100%";
      if (window.pixelAudio) window.pixelAudio.openWindow();
      bootScreen.classList.add("fade-out");
      setTimeout(() => bootScreen.remove(), 500);
    };

    enterBtn.addEventListener("click", enterWorkspace);
  }

  // ============================================================
  // 2. Animated Pixel Sakura & Stars Background Canvas
  // ============================================================
  function initBackgroundCanvas() {
    const canvas = document.getElementById("bg-canvas");
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const petals = Array.from({ length: 28 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 4 + Math.floor(Math.random() * 4) * 2,
      vx: 0.35 + Math.random() * 0.5,
      vy: 0.45 + Math.random() * 0.65,
      color: Math.random() > 0.35 ? "#ff9ec9" : "#ffffff"
    }));

    const stars = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      phase: Math.random() * Math.PI * 2
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Twinkling pixel stars
      stars.forEach((s) => {
        s.phase += 0.03;
        const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
        const px = Math.round(s.x);
        const py = Math.round(s.y);
        ctx.fillRect(px, py - 3, 2, 8);
        ctx.fillRect(px - 3, py, 8, 2);
      });

      // Falling pixel sakura petals
      petals.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > canvas.height + 12) {
          p.y = -12;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 12) {
          p.x = -12;
        }
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size - 2);
        ctx.fillStyle = "rgba(255, 79, 154, 0.35)";
        ctx.fillRect(Math.round(p.x) + 2, Math.round(p.y) + 2, 2, 2);
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  // ============================================================
  // 3. Toast Notifications & Clue System
  // ============================================================
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "pixel-toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 320);
    }, 3400);
  }

  function unlockClue(clueKey) {
    if (state.cluesFound[clueKey]) return;
    state.cluesFound[clueKey] = true;

    const clue = CFG.clues[clueKey];
    if (window.pixelAudio) window.pixelAudio.clueFound();
    showToast(`★ Clue Unlocked! ${clue.title}: Letter [${clue.letter}]`);

    updateClueUI();

    const total = Object.values(state.cluesFound).filter(Boolean).length;
    if (total === 4) {
      setTimeout(() => {
        showToast(`♥ All 4 clues found! Open "Secret Vault 🔒" to unlock the surprise!`);
      }, 1500);
    }
  }

  function updateClueUI() {
    const foundCount = Object.values(state.cluesFound).filter(Boolean).length;
    const countEl = document.getElementById("widget-clue-count");
    if (countEl) countEl.textContent = `${foundCount}/4`;

    Object.values(CFG.clues).forEach((clue) => {
      const slotEl = document.querySelector(`#widget-seal-slots .seal-slot[data-slot="${clue.slot}"]`);
      if (slotEl) {
        if (state.cluesFound[clue.id]) {
          slotEl.textContent = clue.letter;
          slotEl.classList.add("found");
          slotEl.title = `${clue.title}: ${clue.letter}`;
        } else {
          slotEl.textContent = "?";
          slotEl.classList.remove("found");
        }
      }
    });

    // Refresh Clue Log window if currently open
    if (state.windows.has("clues")) {
      renderCluesContent(state.windows.get("clues").el.querySelector(".window-content"));
    }
    // Refresh Vault window hint if currently open
    if (state.windows.has("vault")) {
      updateVaultAutofillVisibility();
    }
  }

  // ============================================================
  // 4. Desktop Widgets (Sticky Note & Sakura Plant)
  // ============================================================
  function initDesktopWidgets() {
    const stickyEl = document.getElementById("sticky-note");
    const stickyBody = document.getElementById("sticky-body");
    const stickyNotes = [
      "Welcome to this cozy pink pixel workspace! Explore the apps, pet the little friends below, and collect 4 secret clues~",
      "Secret tip #1: Try pulling 3 capsules in Quote Jar, and don't forget to switch on the Pink UV Lamp inside Secret Diary!",
      "Secret tip #2: Mochi & Boba love treats! Click them or drop a strawberry from the taskbar to see what they're hiding 🐾",
      "P.S. Every pixel in this little world was built just to make you smile ♥"
    ];

    const flipSticky = () => {
      if (window.pixelAudio) window.pixelAudio.click();
      state.stickyIndex = (state.stickyIndex + 1) % stickyNotes.length;
      stickyBody.textContent = stickyNotes[state.stickyIndex];
    };
    stickyEl.addEventListener("click", flipSticky);
    stickyEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        flipSticky();
      }
    });

    // Pixel Plant Widget
    const plantArt = document.getElementById("pixel-plant-art");
    const plantQuote = document.getElementById("plant-quote");
    const plantStage = document.getElementById("plant-stage-label");
    const waterBtn = document.getElementById("water-plant-btn");

    const plantStages = [
      {
        label: "Lv.1",
        quote: "Water me for a sweet secret!",
        svg: `<svg viewBox="0 0 16 16" width="52" height="52" shape-rendering="crispEdges">
          <rect x="5" y="10" width="6" height="5" fill="#d97aa6"/>
          <rect x="4" y="9" width="8" height="2" fill="#6b2649"/>
          <rect x="5" y="10" width="6" height="1" fill="#ff99c4"/>
          <rect x="7" y="6" width="2" height="4" fill="#4aa96c"/>
          <rect x="5" y="6" width="2" height="2" fill="#6fd08c"/>
          <rect x="9" y="5" width="2" height="2" fill="#6fd08c"/>
        </svg>`
      },
      {
        label: "Lv.2",
        quote: "Secret: You're someone's favorite person to think about ♥",
        svg: `<svg viewBox="0 0 16 16" width="52" height="52" shape-rendering="crispEdges">
          <rect x="5" y="10" width="6" height="5" fill="#d97aa6"/>
          <rect x="4" y="9" width="8" height="2" fill="#6b2649"/>
          <rect x="7" y="4" width="2" height="6" fill="#4aa96c"/>
          <rect x="4" y="5" width="3" height="2" fill="#6fd08c"/>
          <rect x="9" y="4" width="3" height="2" fill="#6fd08c"/>
          <rect x="7" y="2" width="2" height="2" fill="#ff7eb6"/>
        </svg>`
      },
      {
        label: "MAX ✿",
        quote: "Full Bloom! Just like how my day blooms whenever I happen to see you ✿",
        svg: `<svg viewBox="0 0 16 16" width="52" height="52" shape-rendering="crispEdges">
          <rect x="5" y="10" width="6" height="5" fill="#d97aa6"/>
          <rect x="4" y="9" width="8" height="2" fill="#6b2649"/>
          <rect x="7" y="5" width="2" height="5" fill="#4aa96c"/>
          <rect x="4" y="6" width="3" height="2" fill="#6fd08c"/>
          <rect x="9" y="6" width="3" height="2" fill="#6fd08c"/>
          <rect x="5" y="2" width="6" height="4" fill="#ff85b8"/>
          <rect x="6" y="1" width="4" height="6" fill="#ffb8d9"/>
          <rect x="7" y="3" width="2" height="2" fill="#fff2c2"/>
        </svg>`
      }
    ];

    const renderPlant = () => {
      const stage = plantStages[Math.min(state.plantLevel - 1, plantStages.length - 1)];
      plantArt.innerHTML = stage.svg;
      plantStage.textContent = stage.label;
      plantQuote.textContent = stage.quote;
    };
    renderPlant();

    waterBtn.addEventListener("click", () => {
      if (window.pixelAudio) window.pixelAudio.petChirp();
      state.plantLevel = state.plantLevel < 3 ? state.plantLevel + 1 : 3;
      renderPlant();
      showToast("✿ Your Sakura Sprout sparkled with a secret quote!");
    });
  }

  // ============================================================
  // 5. Window Manager (Open, Focus, Drag, Minimize, Close)
  // ============================================================
  const APP_META = {
    quotes: { title: "🎀 Quote_Jar.exe", width: 460, x: 145, y: 36 },
    pets: { title: "🐾 Pet_Corner.exe", width: 490, x: 185, y: 64 },
    diary: { title: "📖 Secret_Diary.txt", width: 480, x: 220, y: 48 },
    melody: { title: "🎵 Melody_Box.app", width: 500, x: 165, y: 84 },
    clues: { title: "🔎 Clue_Log.log", width: 460, x: 240, y: 58 },
    vault: { title: "🔒 Secret_Vault.exe", width: 440, x: 260, y: 74 }
  };

  function openApp(appId) {
    closeStartMenu();

    if (state.windows.has(appId)) {
      const win = state.windows.get(appId);
      win.minimized = false;
      win.el.classList.remove("minimized");
      focusWindow(appId);
      renderTaskbar();
      return;
    }

    const meta = APP_META[appId];
    if (!meta) return;

    if (window.pixelAudio) window.pixelAudio.openWindow();

    const winEl = document.createElement("section");
    winEl.className = "os-window pixel-box";
    winEl.dataset.appId = appId;
    winEl.style.width = `${meta.width}px`;

    // Clamp initial position nicely inside viewport
    const maxLeft = Math.max(12, window.innerWidth - meta.width - 20);
    const maxTop = Math.max(12, window.innerHeight - 420);
    const offset = (state.windows.size % 5) * 18;
    winEl.style.left = `${Math.min(meta.x + offset, maxLeft)}px`;
    winEl.style.top = `${Math.min(meta.y + offset, maxTop)}px`;

    winEl.innerHTML = `
      <header class="window-titlebar">
        <span class="window-title">${meta.title}</span>
        <div class="window-controls">
          <button class="win-ctrl-btn win-min" type="button" title="Minimize">_</button>
          <button class="win-ctrl-btn win-close" type="button" title="Close">✕</button>
        </div>
      </header>
      <div class="window-content"></div>
    `;

    const contentEl = winEl.querySelector(".window-content");
    populateAppContent(appId, contentEl);

    // Focus on click
    winEl.addEventListener("mousedown", () => focusWindow(appId));

    // Controls
    winEl.querySelector(".win-min").addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.pixelAudio) window.pixelAudio.click();
      const rec = state.windows.get(appId);
      if (rec) {
        rec.minimized = true;
        winEl.classList.add("minimized");
        renderTaskbar();
      }
    });

    winEl.querySelector(".win-close").addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.pixelAudio) window.pixelAudio.closeWindow();
      winEl.remove();
      state.windows.delete(appId);
      renderTaskbar();
    });

    // Make draggable via titlebar
    makeDraggable(winEl, winEl.querySelector(".window-titlebar"));

    windowsLayer.appendChild(winEl);
    state.windows.set(appId, { el: winEl, minimized: false, title: meta.title });
    focusWindow(appId);
    renderTaskbar();
  }

  function focusWindow(appId) {
    state.zIndex++;
    const rec = state.windows.get(appId);
    if (rec) {
      rec.el.style.zIndex = state.zIndex;
    }
    renderTaskbar(appId);
  }

  function makeDraggable(winEl, handleEl) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    handleEl.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".win-ctrl-btn")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseFloat(winEl.style.left) || 0;
      origTop = parseFloat(winEl.style.top) || 0;
      handleEl.setPointerCapture(e.pointerId);
    });

    handleEl.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const nextLeft = Math.max(0, Math.min(window.innerWidth - 120, origLeft + dx));
      const nextTop = Math.max(0, Math.min(window.innerHeight - 100, origTop + dy));
      winEl.style.left = `${nextLeft}px`;
      winEl.style.top = `${nextTop}px`;
    });

    handleEl.addEventListener("pointerup", () => {
      dragging = false;
    });
  }

  function renderTaskbar(activeAppId = null) {
    taskbarWindows.innerHTML = "";
    state.windows.forEach((win, appId) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "taskbar-win-btn";
      if (!win.minimized && appId === activeAppId) {
        btn.classList.add("active");
      }
      btn.textContent = win.title;
      btn.addEventListener("click", () => {
        if (win.minimized) {
          win.minimized = false;
          win.el.classList.remove("minimized");
          focusWindow(appId);
        } else {
          focusWindow(appId);
        }
      });
      taskbarWindows.appendChild(btn);
    });
  }

  // ============================================================
  // 6. Individual App Renderers
  // ============================================================
  function populateAppContent(appId, container) {
    switch (appId) {
      case "quotes":
        renderQuotesApp(container);
        break;
      case "pets":
        renderPetsApp(container);
        break;
      case "diary":
        renderDiaryApp(container);
        break;
      case "melody":
        renderMelodyApp(container);
        break;
      case "clues":
        renderCluesContent(container);
        break;
      case "vault":
        renderVaultApp(container);
        break;
    }
  }

  // --- APP 1: Quote Jar (Clue #1: Z) ---
  function renderQuotesApp(container) {
    container.innerHTML = `
      <div class="gacha-stage">
        <div id="gacha-capsule" class="gacha-capsule">♥</div>
        <div id="quote-card" class="quote-card">
          <span>Pull a pink capsule to reveal a secret quote ✨</span>
        </div>
        <button id="pull-quote-btn" class="pixel-btn pixel-btn-primary" type="button">
          🎀 Pull Secret Quote
        </button>
        <div class="gacha-meta">
          <span id="gacha-pull-count">Pulls: ${state.quotePulls}</span>
          <span id="gacha-clue-hint">${state.cluesFound.quotes ? "★ Golden Seal [Z] Found!" : "✨ Golden capsule on pull #3"}</span>
        </div>
      </div>
    `;

    const capsule = container.querySelector("#gacha-capsule");
    const quoteCard = container.querySelector("#quote-card");
    const pullBtn = container.querySelector("#pull-quote-btn");
    const pullCount = container.querySelector("#gacha-pull-count");
    const clueHint = container.querySelector("#gacha-clue-hint");

    pullBtn.addEventListener("click", () => {
      if (window.pixelAudio) window.pixelAudio.gachaPop();
      state.quotePulls++;
      pullCount.textContent = `Pulls: ${state.quotePulls}`;

      capsule.classList.remove("shake");
      void capsule.offsetWidth;
      capsule.classList.add("shake");

      // On 3rd pull, drop the Golden Clue Capsule!
      if (state.quotePulls === 3 || (!state.cluesFound.quotes && state.quotePulls > 3)) {
        capsule.classList.add("golden");
        capsule.textContent = "★";
        const clue = CFG.clues.quotes;
        quoteCard.innerHTML = `
          <div style="font-family:var(--font-ui);font-size:10px;color:var(--accent);margin-bottom:6px;">
            ★ GOLDEN SECRET CAPSULE (CLUE #1) ★
          </div>
          <div>
            <span class="clue-highlight-letter">${clue.letter}</span>${clue.quote.slice(1)}
          </div>
        `;
        clueHint.textContent = "★ Golden Seal [Z] Found!";
        unlockClue("quotes");
      } else {
        capsule.classList.remove("golden");
        capsule.textContent = "♥";
        const q = CFG.secretQuotes[state.quoteIndex % CFG.secretQuotes.length];
        state.quoteIndex++;
        quoteCard.innerHTML = `<span>“${q}”</span>`;
      }
    });
  }

  // --- APP 2: Pet Corner (Clue #2: H) ---
  function renderPetsApp(container) {
    const renderCards = () => {
      if (!state.petsManager) return "";
      return state.petsManager.pets
        .map((pet) => {
          const filled = "♥".repeat(pet.hearts);
          const empty = "♡".repeat(5 - pet.hearts);
          return `
            <div class="pet-profile-card">
              <div style="display:flex;justify-content:center;">${window.PET_SPRITES[pet.id]}</div>
              <div class="pet-profile-name">${pet.name}</div>
              <div class="pet-profile-role">${pet.role}</div>
              <div class="pet-hearts-bar">${filled}${empty}</div>
              <button class="pixel-btn pixel-btn-xs pet-direct-btn" data-pet="${pet.id}" type="button" style="margin-top:8px;">
                ♥ Pet
              </button>
            </div>
          `;
        })
        .join("");
    };

    container.innerHTML = `
      <p style="margin-bottom:10px;">
        Your pixel companions roam along the bottom of the workspace! Pet them or drop treats — when any pet reaches <strong>3 ♥ hearts</strong>, they'll share a secret clue!
      </p>
      <div id="pet-cards-container" class="pet-cards-grid">${renderCards()}</div>
      <div class="treats-tray">
        <span style="font-family:var(--font-ui);font-size:10px;width:100%;text-align:center;">Drop a treat on the desktop:</span>
        <button class="pixel-btn pixel-btn-sm treat-drop-btn" data-emoji="🍓" type="button">🍓 Strawberry</button>
        <button class="pixel-btn pixel-btn-sm treat-drop-btn" data-emoji="🍰" type="button">🍰 Shortcake</button>
        <button class="pixel-btn pixel-btn-sm treat-drop-btn" data-emoji="🧋" type="button">🧋 Pink Boba</button>
        <button class="pixel-btn pixel-btn-sm treat-drop-btn" data-emoji="⭐" type="button">⭐ Star Candy</button>
      </div>
    `;

    const bindPetButtons = () => {
      container.querySelectorAll(".pet-direct-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.petsManager.petAnimal(btn.dataset.pet);
          refreshPetCards();
        });
      });
    };

    const refreshPetCards = () => {
      const grid = container.querySelector("#pet-cards-container");
      if (grid) {
        grid.innerHTML = renderCards();
        bindPetButtons();
      }
    };

    bindPetButtons();

    container.querySelectorAll(".treat-drop-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.petsManager.dropTreat(btn.dataset.emoji);
        showToast(`Dropped ${btn.dataset.emoji} for your desktop pets!`);
      });
    });

    // Store refresher so desktop clicks also update Pet Corner
    container._refreshPets = refreshPetCards;
  }

  // --- APP 3: Secret Diary with Pink UV Lamp (Clue #3: I) ---
  function renderDiaryApp(container) {
    const pages = [
      {
        date: "PAGE 01 // NOTES ABOUT SOMEONE SPECIAL",
        text: "I tried writing down all the reasons why seeing you around campus always brightens my day, but I ran out of pixels. Wait... there seems to be invisible ink written below this line. Try turning on the Pink UV Lamp!",
        secret: true
      },
      {
        date: "PAGE 02 // TINY CONFESSIONS",
        text: "Sometimes I act totally chill when walking past, even though I immediately lose eye contact the second you look back. Also, yes — I definitely spent way too much time picking the exact shade of pink for this workspace.",
        secret: false
      },
      {
        date: "PAGE 03 // WISHLIST",
        text: "1. Make you smile today. 2. See if you find all 4 clues. 3. Hope you like the surprise waiting inside the Secret Vault 🔒.",
        secret: false
      }
    ];

    const renderPage = () => {
      const p = pages[state.diaryPage];
      const clue = CFG.clues.diary;
      container.innerHTML = `
        <div class="diary-toolbar">
          <div style="display:flex;gap:6px;">
            <button id="diary-prev" class="pixel-btn pixel-btn-xs" type="button">◀ Prev</button>
            <button id="diary-next" class="pixel-btn pixel-btn-xs" type="button">Next ▶</button>
          </div>
          <button id="uv-toggle-btn" class="pixel-btn pixel-btn-sm ${state.uvLightOn ? "pixel-btn-primary" : ""}" type="button">
            🔦 Pink UV Lamp: ${state.uvLightOn ? "ON" : "OFF"}
          </button>
        </div>
        <div class="diary-page ${state.uvLightOn ? "uv-mode" : ""}">
          <div class="diary-date">${p.date}</div>
          <p>${p.text}</p>
          ${
            p.secret
              ? `<div class="invisible-ink">
                   <div style="font-family:var(--font-ui);font-size:10px;margin-bottom:4px;">★ INVISIBLE INK REVEALED (CLUE #3) ★</div>
                   <span class="clue-highlight-letter">${clue.letter}</span>${clue.quote.slice(1)}
                 </div>`
              : `<div class="invisible-ink">✨ Hidden UV doodle: ♥ Mochi + Boba + Pudding ♥</div>`
          }
        </div>
      `;

      container.querySelector("#diary-prev").addEventListener("click", () => {
        if (window.pixelAudio) window.pixelAudio.click();
        state.diaryPage = (state.diaryPage + pages.length - 1) % pages.length;
        renderPage();
      });

      container.querySelector("#diary-next").addEventListener("click", () => {
        if (window.pixelAudio) window.pixelAudio.click();
        state.diaryPage = (state.diaryPage + 1) % pages.length;
        renderPage();
      });

      container.querySelector("#uv-toggle-btn").addEventListener("click", () => {
        if (window.pixelAudio) window.pixelAudio.click();
        state.uvLightOn = !state.uvLightOn;
        renderPage();
        if (state.uvLightOn && state.diaryPage === 0) {
          unlockClue("diary");
        }
      });
    };

    renderPage();
  }

  // --- APP 4: Melody Box Piano Puzzle (Clue #4: A) ---
  function renderMelodyApp(container) {
    const keys = [
      { note: "C", freq: 523.25 },
      { note: "D", freq: 587.33 },
      { note: "E", freq: 659.25 },
      { note: "F", freq: 698.46 },
      { note: "G", freq: 783.99 },
      { note: "A", freq: 880.0 },
      { note: "B", freq: 987.77 }
    ];

    const renderMelodyUI = () => {
      const target = state.melodyTarget;
      const nextNote = state.melodyStep < target.length ? target[state.melodyStep] : null;
      const clue = CFG.clues.melody;

      container.innerHTML = `
        <div class="melody-guide">
          <div>
            <div style="font-family:var(--font-ui);font-size:10px;color:var(--accent);">SAKURA MELODY PUZZLE</div>
            <div style="font-size:18px;">Play the 4 glowing notes in order!</div>
          </div>
          <div class="melody-sequence">
            ${target
              .map((n, i) => {
                const cls = i < state.melodyStep ? "done" : i === state.melodyStep ? "next" : "";
                return `<div class="melody-dot ${cls}">${n}</div>`;
              })
              .join("")}
          </div>
        </div>

        <div class="piano-keys">
          ${keys
            .map(
              (k) => `
              <button class="piano-key ${nextNote === k.note ? "hint-glow" : ""}" data-note="${k.note}" data-freq="${k.freq}" type="button">
                <span>${k.note}</span>
              </button>
            `
            )
            .join("")}
        </div>

        <div id="melody-result" style="text-align:center;min-height:42px;">
          ${
            state.cluesFound.melody
              ? `<div style="background:var(--gold-soft);border:2px solid var(--accent);padding:8px;">
                   <span class="clue-highlight-letter">${clue.letter}</span>${clue.quote.slice(1)}
                 </div>`
              : `<span style="color:var(--text-muted);">Tip: Follow the glowing pink key (${nextNote || "Done!"}) ♪</span>`
          }
        </div>
      `;

      container.querySelectorAll(".piano-key").forEach((btn) => {
        btn.addEventListener("click", () => {
          const note = btn.dataset.note;
          const freq = parseFloat(btn.dataset.freq);
          if (window.pixelAudio) window.pixelAudio.note(freq);

          if (state.melodyStep < target.length) {
            if (note === target[state.melodyStep]) {
              state.melodyStep++;
              if (state.melodyStep === target.length) {
                unlockClue("melody");
              }
            } else {
              state.melodyStep = note === target[0] ? 1 : 0;
            }
            renderMelodyUI();
          }
        });
      });
    };

    renderMelodyUI();
  }

  // --- APP 5: Clue Log ---
  function renderCluesContent(container) {
    if (!container) return;
    const cluesArr = Object.values(CFG.clues);
    const foundCount = cluesArr.filter((c) => state.cluesFound[c.id]).length;

    container.innerHTML = `
      <p style="margin-bottom:12px;">
        Collected <strong>${foundCount} / 4</strong> secret seals. Put the 4 letters together inside <strong>Secret Vault 🔒</strong>!
      </p>
      <div class="clue-list">
        ${cluesArr
          .map((c) => {
            const isFound = state.cluesFound[c.id];
            return `
              <div class="clue-item ${isFound ? "found" : ""}">
                <div class="clue-badge-letter">${isFound ? c.letter : "?"}</div>
                <div>
                  <div class="clue-item-title">CLUE #${c.slot} — ${c.title} (${c.source})</div>
                  <div class="clue-item-desc">
                    ${isFound ? `“${c.quote}”` : `<em>Hint:</em> ${c.hint}`}
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  // --- APP 6: Secret Vault 🔒 ---
  function renderVaultApp(container) {
    const allFound = Object.values(state.cluesFound).every(Boolean);

    container.innerHTML = `
      <div class="vault-box">
        <div id="vault-lock-icon" class="vault-lock-icon">${state.vaultUnlocked ? "💌" : "🔒"}</div>
        <h3 class="vault-title">SECRET VAULT // LOCKED</h3>
        <p class="vault-subtitle">
          Enter the 4-letter secret code hidden across the workspace clues to open the surprise!
        </p>

        <div class="vault-code-inputs" id="vault-code-inputs">
          <input class="vault-char-input" type="text" maxlength="1" aria-label="Letter 1" data-idx="0" />
          <input class="vault-char-input" type="text" maxlength="1" aria-label="Letter 2" data-idx="1" />
          <input class="vault-char-input" type="text" maxlength="1" aria-label="Letter 3" data-idx="2" />
          <input class="vault-char-input" type="text" maxlength="1" aria-label="Letter 4" data-idx="3" />
        </div>

        <div id="vault-feedback" class="vault-feedback"></div>

        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <button id="vault-unlock-btn" class="pixel-btn pixel-btn-primary" type="button">
            ♥ UNLOCK SECRET ♥
          </button>
          <button id="vault-autofill-btn" class="pixel-btn ${allFound ? "" : "hidden"}" type="button">
            ★ Fill Clues
          </button>
        </div>

        ${
          state.vaultUnlocked
            ? `<div style="margin-top:12px;">
                 <button id="vault-reopen-btn" class="pixel-btn pixel-btn-sm" type="button">💌 Re-open Secret Message</button>
               </div>`
            : ""
        }
      </div>
    `;

    const inputs = Array.from(container.querySelectorAll(".vault-char-input"));
    const feedback = container.querySelector("#vault-feedback");
    const lockIcon = container.querySelector("#vault-lock-icon");
    const secret = getSecret();

    inputs.forEach((inp, i) => {
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
        if (inp.value && i < inputs.length - 1) {
          inputs[i + 1].focus();
        }
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !inp.value && i > 0) {
          inputs[i - 1].focus();
        }
        if (e.key === "Enter") {
          attemptUnlock();
        }
      });
    });

    const autofillBtn = container.querySelector("#vault-autofill-btn");
    autofillBtn.addEventListener("click", () => {
      if (window.pixelAudio) window.pixelAudio.click();
      const letters = secret.passcode.split("");
      inputs.forEach((inp, i) => {
        inp.value = letters[i] || "";
      });
      feedback.textContent = "All 4 clue letters filled! Press UNLOCK ♥";
    });

    const attemptUnlock = () => {
      const code = inputs.map((inp) => inp.value.toUpperCase()).join("");
      if (code === secret.passcode.toUpperCase()) {
        state.vaultUnlocked = true;
        if (window.pixelAudio) window.pixelAudio.unlockFanfare();
        feedback.textContent = "★ ACCESS GRANTED! Opening your secret page...";
        lockIcon.textContent = "💌";

        // Update desktop icon
        const vaultIcon = document.getElementById("vault-desktop-icon");
        if (vaultIcon) {
          vaultIcon.classList.add("unlocked");
          vaultIcon.querySelector(".icon-label").textContent = "Secret Vault 💌";
        }

        setTimeout(() => openConfessionSanctuary(), 550);
      } else {
        if (window.pixelAudio) window.pixelAudio.errorBuzz();
        lockIcon.classList.remove("shake");
        void lockIcon.offsetWidth;
        lockIcon.classList.add("shake");
        feedback.textContent = "Hmm, not quite! Check Quote Jar, Pets, Diary & Melody Box for the 4 letters ♥";
      }
    };

    container.querySelector("#vault-unlock-btn").addEventListener("click", attemptUnlock);

    const reopenBtn = container.querySelector("#vault-reopen-btn");
    if (reopenBtn) {
      reopenBtn.addEventListener("click", () => openConfessionSanctuary());
    }

    setTimeout(() => inputs[0].focus(), 50);
  }

  function updateVaultAutofillVisibility() {
    const win = state.windows.get("vault");
    if (!win) return;
    const btn = win.el.querySelector("#vault-autofill-btn");
    if (btn && Object.values(state.cluesFound).every(Boolean)) {
      btn.classList.remove("hidden");
    }
  }

  // ============================================================
  // 7. Secret Confession Sanctuary & Celebration Fireworks
  // ============================================================
  let celebrationAnimId = null;
  let celebrationParticles = [];

  function openConfessionSanctuary() {
    const overlay = document.getElementById("confession-overlay");
    const envelopeScene = document.getElementById("envelope-scene");
    const letterScene = document.getElementById("letter-scene");
    const secret = getSecret();

    // Populate secret confession ONLY once unlocked
    document.getElementById("sanctuary-badge").textContent = secret.badge;
    document.getElementById("letter-heading").textContent = secret.heading;
    document.getElementById("embedded-msg-title").textContent = CFG.confession.embeddedTitle;
    document.getElementById("confession-bottom-quote").textContent = CFG.confession.bottomQuote;
    document.getElementById("letter-signoff").textContent = CFG.confession.signoff;
    document.getElementById("letter-signature").textContent = CFG.confession.signature;

    const bodyEl = document.getElementById("letter-body");
    bodyEl.innerHTML = CFG.confession.embeddedParagraphs.map((p) => `<p>${p}</p>`).join("");

    envelopeScene.classList.remove("hidden");
    letterScene.classList.add("hidden");
    overlay.classList.remove("hidden");

    startCelebrationCanvas();
    spawnFireworkBurst(window.innerWidth / 2, window.innerHeight / 2, 42);
  }

  function startCelebrationCanvas() {
    const canvas = document.getElementById("celebration-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (celebrationAnimId) cancelAnimationFrame(celebrationAnimId);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      celebrationParticles = celebrationParticles.filter((p) => p.life > 0);
      celebrationParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life--;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      });
      ctx.globalAlpha = 1;
      celebrationAnimId = requestAnimationFrame(loop);
    };
    loop();
  }

  function spawnFireworkBurst(cx, cy, count = 36) {
    const palette = ["#ff4f9a", "#ff99c4", "#fff2c2", "#ffffff", "#ffbe3b", "#ff7ab8"];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const speed = 1.6 + Math.random() * 4.5;
      celebrationParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 4 + Math.floor(Math.random() * 3) * 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 65 + Math.floor(Math.random() * 40),
        maxLife: 105
      });
    }
  }

  function initConfessionEvents() {
    const envelope = document.getElementById("pixel-envelope");
    const envelopeScene = document.getElementById("envelope-scene");
    const letterScene = document.getElementById("letter-scene");
    const overlay = document.getElementById("confession-overlay");
    const closeBtn = document.getElementById("close-confession-btn");
    const sendHeartBtn = document.getElementById("send-heart-btn");
    const replayConfettiBtn = document.getElementById("replay-confetti-btn");
    const responseMsg = document.getElementById("heart-response-msg");

    const openLetter = () => {
      if (window.pixelAudio) window.pixelAudio.unlockFanfare();
      envelopeScene.classList.add("hidden");
      letterScene.classList.remove("hidden");
      spawnFireworkBurst(window.innerWidth * 0.3, window.innerHeight * 0.35, 34);
      spawnFireworkBurst(window.innerWidth * 0.7, window.innerHeight * 0.35, 34);
    };

    envelope.addEventListener("click", openLetter);
    envelope.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLetter();
      }
    });

    sendHeartBtn.addEventListener("click", () => {
      if (window.pixelAudio) window.pixelAudio.clueFound();
      spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.4, 55);
      spawnFireworkBurst(window.innerWidth * 0.25, window.innerHeight * 0.5, 30);
      spawnFireworkBurst(window.innerWidth * 0.75, window.innerHeight * 0.5, 30);
      responseMsg.textContent = "♥ Heart received! You just made my entire week! ♥";
      responseMsg.classList.remove("hidden");
    });

    replayConfettiBtn.addEventListener("click", () => {
      if (window.pixelAudio) window.pixelAudio.gachaPop();
      spawnFireworkBurst(
        window.innerWidth * (0.25 + Math.random() * 0.5),
        window.innerHeight * (0.25 + Math.random() * 0.35),
        44
      );
    });

    closeBtn.addEventListener("click", () => {
      if (window.pixelAudio) window.pixelAudio.closeWindow();
      overlay.classList.add("hidden");
      if (celebrationAnimId) cancelAnimationFrame(celebrationAnimId);
    });
  }

  // ============================================================
  // 8. Start Menu, Taskbar Controls & Clock
  // ============================================================
  function closeStartMenu() {
    startMenu.classList.add("hidden");
    startBtn.setAttribute("aria-expanded", "false");
  }

  function initTaskbarAndMenu() {
    startBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.pixelAudio) window.pixelAudio.click();
      const willOpen = startMenu.classList.contains("hidden");
      startMenu.classList.toggle("hidden", !willOpen);
      startBtn.setAttribute("aria-expanded", String(willOpen));
    });

    document.addEventListener("click", (e) => {
      if (!startMenu.contains(e.target) && e.target !== startBtn) {
        closeStartMenu();
      }
    });

    // Desktop icons, Start menu items, and widget buttons with data-app
    document.querySelectorAll("[data-app]").forEach((el) => {
      el.addEventListener("click", () => openApp(el.dataset.app));
    });

    // Theme switcher
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.pixelAudio) window.pixelAudio.click();
        document.body.classList.remove("theme-sakura", "theme-milk", "theme-night");
        document.body.classList.add(btn.dataset.theme);
        document.querySelectorAll(".theme-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Quick Treat button
    document.getElementById("quick-treat-btn").addEventListener("click", () => {
      if (state.petsManager) {
        const treats = ["🍓", "🍰", "🧋", "⭐"];
        const emoji = treats[Math.floor(Math.random() * treats.length)];
        state.petsManager.dropTreat(emoji);
        showToast(`Dropped a ${emoji} treat for your pixel pets!`);
      }
    });

    // BGM toggle
    const bgmBtn = document.getElementById("bgm-toggle-btn");
    bgmBtn.addEventListener("click", () => {
      const playing = window.pixelAudio.toggleBgm();
      bgmBtn.textContent = playing ? "♪ BGM: ON" : "♪ BGM: OFF";
    });

    // SFX toggle
    const sfxBtn = document.getElementById("sfx-toggle-btn");
    sfxBtn.addEventListener("click", () => {
      const enabled = window.pixelAudio.toggleMute();
      sfxBtn.textContent = enabled ? "🔊 SFX" : "🔇 MUTED";
      if (!enabled) bgmBtn.textContent = "♪ BGM: OFF";
    });

    // Live clock
    const clockEl = document.getElementById("taskbar-clock");
    const updateClock = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };
    updateClock();
    setInterval(updateClock, 15000);
  }

  // ============================================================
  // 9. Initialize Everything!
  // ============================================================
  function init() {
    initBootScreen();
    initBackgroundCanvas();
    initDesktopWidgets();
    initTaskbarAndMenu();
    initConfessionEvents();

    // Initialize Interactive Pixel Pets
    const petsLayer = document.getElementById("pets-layer");
    state.petsManager = new window.PixelPetsManager(petsLayer, (pet) => {
      // Update Pet Corner window if open
      if (state.windows.has("pets")) {
        const content = state.windows.get("pets").el.querySelector(".window-content");
        if (content && content._refreshPets) content._refreshPets();
      }
      // Unlock Clue #2 when any pet reaches 3+ hearts!
      if (pet.hearts >= 3) {
        unlockClue("pets");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
