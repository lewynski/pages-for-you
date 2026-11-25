// ============================================================
// Love Mini Games (11 of them!)
// Each renderer receives the window content element.
// ============================================================
(() => {
  const G = (window.GAMES = {});
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
  const toast = (m) => window.PinkOS && window.PinkOS.toast(m);
  const sfx = (n, ...a) => window.pixelAudio && window.pixelAudio[n] && window.pixelAudio[n](...a);

  window.LOVE = {
    points: 0,
    add(n) {
      this.points += n;
      const el = document.getElementById("love-points");
      if (el) { el.textContent = `♥ ${this.points}`; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
      toast(`+${n} Love Points ♥`);
    }
  };

  // ---------------------------------------------------------
  // 1. CANDLE FLAMES — light, blow, and read the result
  // ---------------------------------------------------------
  G.candle = (c) => {
    const wishes = ["A shy smile", "A lucky hello", "A sweet moment", "A brave heart", "Sparkling fate"];
    let st, tries, done;

    const reset = () => {
      st = wishes.map(() => ({ lit: false, out: false, th: 18 + Math.random() * 66 }));
      tries = 3; done = false;
      render("");
    };

    const finalMessage = () => {
      const granted = st.filter((k) => k.out).length;
      const lines = st.map((k, i) => (k.out ? `✓ ${wishes[i]} — wish granted` : `✦ ${wishes[i]} — still burning, keep hoping`)).join("<br>");
      const summary = [
        "The flames refused to go out. Your wishes are glowing too strongly to blow away — the universe is saving them for something bigger. 🔥",
        "Just one flame surrendered. A single wish is on its way. Be patient, good things grow slowly. 🌱",
        "A couple of wishes slipped away on the wind. The rest are still warm — keep hoping. ✨",
        "Three wishes granted! Fate is clearly leaning your way. 💗",
        "Four wishes granted! The flames practically bowed to you. 🌟",
        "ALL FIVE wishes granted in a single breath. The universe heard you loud and clear. ♥"
      ][granted];
      LOVE.add(3 + granted * 3);
      sfx(granted >= 3 ? "unlockFanfare" : "clueFound");
      return `<strong>Result: ${granted}/5 wishes granted</strong><br>${summary}<br><br><small>${lines}</small>`;
    };

    function render(msg) {
      const allLit = st.every((k) => k.lit || k.out);
      const anyBurning = st.some((k) => k.lit && !k.out);
      const canBlow = !done && allLit && anyBurning && tries > 0;
      c.innerHTML = `
        <p class="g-intro">Light all 5 wish candles by clicking them, then hold the button to blow. Each flame has its own stubbornness. Blow wisely!</p>
        <div class="candle-row" id="candle-row">
          ${st.map((k, i) => `
            <button class="candle ${k.lit ? "lit" : ""} ${k.out ? "out" : ""}" data-i="${i}" type="button" aria-label="${wishes[i]}">
              <span class="flame"></span><span class="wick"></span><span class="wax"></span>
              <span class="candle-label">${wishes[i]}</span>
            </button>`).join("")}
        </div>
        <div class="breath-track"><div class="breath-bar" id="breath"></div></div>
        <div class="g-actions">
          <button id="blow" class="pixel-btn pixel-btn-primary" type="button" ${canBlow ? "" : "disabled"}>🌬️ Hold to Blow (${tries} ${tries === 1 ? "try" : "tries"})</button>
          <button id="relight" class="pixel-btn" type="button">↻ New Candles</button>
        </div>
        <div class="g-result">${msg || (allLit ? "All lit! Hold the blow button — the longer you hold, the stronger the breath." : "Click a candle to light it ✨")}</div>`;

      c.querySelectorAll(".candle").forEach((el) => el.addEventListener("click", () => {
        const k = st[+el.dataset.i];
        if (k.lit || k.out || done) return;
        k.lit = true; sfx("note", 523.25 + el.dataset.i * 80); render();
      }));
      c.querySelector("#relight").addEventListener("click", () => { sfx("click"); reset(); });

      const blow = c.querySelector("#blow");
      const bar = c.querySelector("#breath");
      const row = c.querySelector("#candle-row");
      let level = 0, timer = null;
      const release = () => {
        if (!timer) return;
        clearInterval(timer); timer = null;
        window.removeEventListener("pointerup", release);
        row.classList.remove("blowing");
        const b = level;
        tries--;
        st.forEach((k) => { if (k.lit && !k.out && b >= k.th) k.out = true; });
        const burning = st.filter((k) => k.lit && !k.out).length;
        if (burning === 0 || tries === 0) { done = true; render(finalMessage()); }
        else render(`💨 Breath power ${Math.round(b)}%. ${burning} flame${burning > 1 ? "s" : ""} still dancing — blow harder!`);
      };
      blow.addEventListener("pointerdown", (e) => {
        if (blow.disabled || timer) return;
        e.preventDefault();
        row.classList.add("blowing"); level = 0;
        timer = setInterval(() => { level = Math.min(100, level + 4); bar.style.width = level + "%"; }, 45);
        window.addEventListener("pointerup", release);
      });
    }
    reset();
  };

  // ---------------------------------------------------------
  // 2. LOVE PETALS — loves me / loves me not
  // ---------------------------------------------------------
  G.petals = (c) => {
    const start = () => {
      const n = pick([7, 9, 11, 13]);
      let plucked = 0;
      c.innerHTML = `
        <p class="g-intro">Pluck the petals one by one and let the daisy decide...</p>
        <div class="daisy" id="daisy">
          ${Array.from({ length: n }, (_, i) => `<button class="petal" data-i="${i}" type="button" style="--a:${(360 / n) * i}deg" aria-label="petal"></button>`).join("")}
          <div class="daisy-core"></div>
        </div>
        <div class="daisy-say" id="say">Click a petal ✿</div>
        <div class="g-result" id="petal-result"></div>
        <div class="g-actions"><button id="newflower" class="pixel-btn" type="button">🌼 New Flower</button></div>`;
      const say = c.querySelector("#say");
      c.querySelectorAll(".petal").forEach((p) => p.addEventListener("click", () => {
        if (p.classList.contains("gone")) return;
        p.classList.add("gone"); plucked++;
        const yes = plucked % 2 === 1;
        say.textContent = yes ? "Loves me ♥" : "Loves me not…";
        say.className = "daisy-say " + (yes ? "yes" : "no");
        sfx(yes ? "petChirp" : "click");
        if (plucked === n) {
          c.querySelector("#petal-result").innerHTML = "<strong>The last petal says: LOVES ME ♥</strong><br>The daisy never lies. Pretty sure.";
          LOVE.add(8); sfx("unlockFanfare");
        }
      }));
      c.querySelector("#newflower").addEventListener("click", () => { sfx("click"); start(); });
    };
    start();
  };

  // ---------------------------------------------------------
  // 3. WISHING FOUNTAIN
  // ---------------------------------------------------------
  G.fountain = (c) => {
    const wishes = {
      Love: ["Someone out there is thinking of you right now. Smile, they're closer than you know.", "A quiet crush is the loudest kind. Your heart is already on its way.", "The water ripples toward you: a sweet surprise is coming."],
      Luck: ["Four-leaf clovers are growing in your direction today.", "A lucky coincidence is warming up. Say yes to the small things.", "Today you'll be in the right place at the right time."],
      Courage: ["Courage isn't loud. It's one small hello. You've got this.", "The brave thing and the scary thing are the same thing. Do it anyway.", "Your heart is stronger than the nerves. Go on."],
      Joy: ["A tiny joy is hiding in your afternoon. Go find it.", "Laughter is on the way, probably the uncontrollable kind.", "You are going to smile at your phone for no reason today."],
      Dreams: ["The dream you whispered is already growing roots.", "Keep going. The version of you from next year is proud already.", "Stars rearrange themselves for people who keep hoping."]
    };
    let cat = "Love", tosses = 0;
    c.innerHTML = `
      <p class="g-intro">Pick a wish, toss a coin, and listen to what the water whispers.</p>
      <div class="chips" id="chips">${Object.keys(wishes).map((k) => `<button class="pixel-btn pixel-btn-xs chip ${k === cat ? "active" : ""}" data-c="${k}" type="button">${k}</button>`).join("")}</div>
      <div class="fountain-stage"><div class="coin" id="coin">🪙</div><div class="water-basin"><div class="ripple"></div></div></div>
      <div class="g-actions"><button id="toss" class="pixel-btn pixel-btn-primary" type="button">🪙 Toss Coin</button></div>
      <div class="g-result" id="fres">The fountain is listening...</div>`;
    const coin = c.querySelector("#coin");
    c.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
      cat = b.dataset.c; sfx("click");
      c.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === b));
    }));
    c.querySelector("#toss").addEventListener("click", () => {
      coin.classList.remove("toss"); void coin.offsetWidth; coin.classList.add("toss");
      sfx("feedTreat"); tosses++;
      setTimeout(() => {
        c.querySelector(".ripple").classList.remove("go"); void c.querySelector(".ripple").offsetWidth; c.querySelector(".ripple").classList.add("go");
        c.querySelector("#fres").innerHTML = `<strong>Wish #${tosses} · ${cat}</strong><br>“${pick(wishes[cat])}”`;
        sfx("petChirp");
        if (tosses === 1 || tosses % 3 === 0) LOVE.add(3);
      }, 800);
    });
  };

  // ---------------------------------------------------------
  // 4. HEART RAIN — catch falling hearts
  // ---------------------------------------------------------
  G.heartrain = (c) => {
    c.innerHTML = `
      <div class="hr-top"><span id="hr-score">Score: 0</span><span id="hr-time">Time: 30</span></div>
      <canvas id="hr-canvas" width="420" height="340"></canvas>
      <div class="g-actions"><button id="hr-start" class="pixel-btn pixel-btn-primary" type="button">▶ Start</button></div>
      <div class="g-result" id="hr-result">Steer the basket with your mouse or finger. 💗 +1 · ✨ +3 · 💔 −2</div>`;
    const cv = c.querySelector("#hr-canvas"), ctx = cv.getContext("2d");
    let bx = 210, items = [], running = false, score = 0, endAt = 0, lastSpawn = 0;
    const move = (e) => { const r = cv.getBoundingClientRect(); bx = Math.max(36, Math.min(384, (e.clientX - r.left) * (cv.width / r.width))); };
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerdown", move);
    cv.style.touchAction = "none";

    const draw = () => {
      const gr = ctx.createLinearGradient(0, 0, 0, 340); gr.addColorStop(0, "#ffe4f0"); gr.addColorStop(1, "#ffb8d9");
      ctx.fillStyle = gr; ctx.fillRect(0, 0, 420, 340);
      ctx.font = "24px serif"; ctx.textAlign = "center";
      items.forEach((it) => ctx.fillText(it.e, it.x, it.y));
      ctx.fillStyle = "#6b2649"; ctx.fillRect(bx - 38, 300, 76, 8); ctx.fillRect(bx - 34, 308, 68, 18);
      ctx.fillStyle = "#ff85b8"; ctx.fillRect(bx - 32, 302, 64, 4); ctx.fillStyle = "#ffc4df"; ctx.fillRect(bx - 30, 310, 60, 14);
    };
    draw();

    const loop = (now) => {
      if (!running || !c.isConnected) { running = false; return; }
      const left = Math.max(0, Math.ceil((endAt - now) / 1000));
      c.querySelector("#hr-time").textContent = `Time: ${left}`;
      if (now - lastSpawn > 430) {
        lastSpawn = now;
        const r = Math.random();
        items.push({ x: 24 + Math.random() * 372, y: -10, v: 1.6 + Math.random() * 2, e: r < 0.68 ? "💗" : r < 0.82 ? "✨" : "💔" });
      }
      items.forEach((it) => (it.y += it.v));
      items = items.filter((it) => {
        if (it.y >= 296 && it.y <= 330 && Math.abs(it.x - bx) < 40) {
          if (it.e === "💗") { score += 1; sfx("petChirp"); }
          else if (it.e === "✨") { score += 3; sfx("clueFound"); }
          else { score = Math.max(0, score - 2); sfx("errorBuzz"); }
          c.querySelector("#hr-score").textContent = `Score: ${score}`;
          return false;
        }
        return it.y < 350;
      });
      draw();
      if (now >= endAt) {
        running = false;
        const t = score >= 30 ? ["💘 Heart Magnet!", "Hearts literally fly into your basket. Irresistible."] : score >= 18 ? ["💖 Cupid's Apprentice", "Great aim! You'd make the arrows jealous."] : score >= 8 ? ["💗 Sweet Beginner", "A good start. Love takes practice."] : ["🌱 Shy Heart", "Even shy hearts get there. Try again!"];
        c.querySelector("#hr-result").innerHTML = `<strong>${t[0]}</strong> — Final score ${score}<br>${t[1]}`;
        LOVE.add(Math.max(2, Math.round(score / 3)));
        c.querySelector("#hr-start").disabled = false;
        return;
      }
      requestAnimationFrame(loop);
    };
    c.querySelector("#hr-start").addEventListener("click", (e) => {
      e.target.disabled = true; score = 0; items = []; running = true;
      endAt = performance.now() + 30000; lastSpawn = 0;
      c.querySelector("#hr-score").textContent = "Score: 0";
      c.querySelector("#hr-result").textContent = "Go go go!";
      requestAnimationFrame(loop);
    });
  };

  // ---------------------------------------------------------
  // 5. MEMORY MATCH
  // ---------------------------------------------------------
  G.memory = (c) => {
    const start = () => {
      const faces = ["💗", "💌", "🌹", "🧸", "🍓", "🎀"];
      const deck = shuffle([...faces, ...faces]);
      let open = [], moves = 0, matched = 0, lock = false;
      c.innerHTML = `
        <div class="hr-top"><span id="mm-moves">Moves: 0</span><span>Pairs: <span id="mm-pairs">0</span>/6</span></div>
        <div class="mm-grid">${deck.map((f, i) => `<button class="mm-card" data-i="${i}" type="button"><span class="mm-front">?</span><span class="mm-back">${f}</span></button>`).join("")}</div>
        <div class="g-result" id="mm-result">Find all the matching pairs.</div>
        <div class="g-actions"><button id="mm-reset" class="pixel-btn" type="button">↻ Shuffle</button></div>`;
      c.querySelectorAll(".mm-card").forEach((card) => card.addEventListener("click", () => {
        if (lock || card.classList.contains("flip") || card.classList.contains("done")) return;
        card.classList.add("flip"); sfx("click"); open.push(card);
        if (open.length === 2) {
          moves++; c.querySelector("#mm-moves").textContent = `Moves: ${moves}`;
          const [a, b] = open;
          if (deck[+a.dataset.i] === deck[+b.dataset.i]) {
            a.classList.add("done"); b.classList.add("done"); open = []; matched++; sfx("petChirp");
            c.querySelector("#mm-pairs").textContent = matched;
            if (matched === 6) {
              const t = moves <= 8 ? "Perfect memory! You remember everything. Even the little things. ♥" : moves <= 12 ? "Sharp hearts! Great job." : "Cute effort! Every pair counts.";
              c.querySelector("#mm-result").innerHTML = `<strong>Cleared in ${moves} moves!</strong><br>${t}`;
              LOVE.add(moves <= 8 ? 10 : moves <= 12 ? 7 : 4); sfx("unlockFanfare");
            }
          } else {
            lock = true;
            setTimeout(() => { a.classList.remove("flip"); b.classList.remove("flip"); open = []; lock = false; }, 750);
          }
        }
      }));
      c.querySelector("#mm-reset").addEventListener("click", start);
    };
    start();
  };

  // ---------------------------------------------------------
  // 6. LOVE CALCULATOR (type any two names!)
  // ---------------------------------------------------------
  G.calc = (c) => {
    c.innerHTML = `
      <p class="g-intro">Type any two names and let the very scientific pixel computer decide. (Totally official.)</p>
      <div class="calc-inputs">
        <input id="n1" class="pixel-input" maxlength="16" placeholder="Name #1" autocomplete="off" />
        <span class="calc-heart">♥</span>
        <input id="n2" class="pixel-input" maxlength="16" placeholder="Name #2" autocomplete="off" />
      </div>
      <div class="love-meter"><div class="love-meter-fill" id="lm"></div><span id="lp">0%</span></div>
      <div class="g-actions"><button id="calc-go" class="pixel-btn pixel-btn-primary" type="button">♥ Calculate</button></div>
      <div class="g-result" id="calc-res">Waiting for two names...</div>`;
    c.querySelector("#calc-go").addEventListener("click", () => {
      const a = c.querySelector("#n1").value.trim().toLowerCase(), b = c.querySelector("#n2").value.trim().toLowerCase();
      if (!a || !b) { sfx("errorBuzz"); c.querySelector("#calc-res").textContent = "Please enter both names ♥"; return; }
      const s = [a, b].sort().join("|");
      let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 9973;
      const score = 87 + (h % 14);
      let cur = 0; const fill = c.querySelector("#lm"), lp = c.querySelector("#lp");
      const t = setInterval(() => {
        cur += 3; if (cur >= score) cur = score;
        fill.style.width = cur + "%"; lp.textContent = cur + "%"; sfx("note", 400 + cur * 4);
        if (cur === score) {
          clearInterval(t);
          const msg = score >= 97 ? "Written in the stars. Scientists are crying." : score >= 92 ? "Strong chemistry. The pixels are blushing." : "A sweet spark. Definitely worth exploring.";
          c.querySelector("#calc-res").innerHTML = `<strong>${score}% compatible</strong><br>${msg}`;
          LOVE.add(5); sfx("clueFound");
        }
      }, 60);
    });
  };

  // ---------------------------------------------------------
  // 7. LOVE LANGUAGE QUIZ
  // ---------------------------------------------------------
  G.quiz = (c) => {
    const qs = [
      { q: "Your perfect date is...", a: [["Deep talks under the stars", "W"], ["Cooking something together", "A"], ["Trading tiny surprise gifts", "G"], ["A quiet walk, just us", "T"]] },
      { q: "What makes you feel most appreciated?", a: [["A sincere 'I'm proud of you'", "W"], ["Someone helping without being asked", "A"], ["A hug that lasts a bit longer", "P"], ["Undivided attention", "T"]] },
      { q: "Pick a sweet surprise:", a: [["A handwritten note", "W"], ["A little souvenir", "G"], ["Holding hands", "P"], ["Dropping everything to see you", "T"]] },
      { q: "When you miss someone you...", a: [["Send a long message", "W"], ["Do something thoughtful for them", "A"], ["Pick out a gift for them", "G"], ["Wish for a cozy cuddle", "P"]] },
      { q: "Your love is best shown through...", a: [["Words that stay in the heart", "W"], ["Showing up and helping", "A"], ["Thoughtful little treasures", "G"], ["Time & closeness", "T"]] }
    ];
    const res = {
      W: ["Words of Affirmation 💌", "Sweet words melt you faster than anything. A heartfelt message could make your whole week."],
      A: ["Acts of Service 🤝", "Love, to you, is shown. Thoughtful actions speak louder than any words."],
      G: ["Receiving Gifts 🎁", "It's never about the price. A tiny, thoughtful surprise means the world to you."],
      T: ["Quality Time ⏳", "Undivided attention is your love language. Being truly present is everything."],
      P: ["Physical Touch 🤗", "Warm hugs and held hands make you feel at home."]
    };
    let i = 0, score = {};
    const render = () => {
      if (i >= qs.length) {
        const top = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
        c.innerHTML = `<div class="g-result"><strong>You are: ${res[top][0]}</strong><br>${res[top][1]}</div>
          <div class="g-actions"><button id="qz-again" class="pixel-btn" type="button">↻ Retake</button></div>`;
        c.querySelector("#qz-again").addEventListener("click", () => { i = 0; score = {}; render(); });
        LOVE.add(6); sfx("unlockFanfare"); return;
      }
      const q = qs[i];
      c.innerHTML = `<div class="hr-top"><span>Question ${i + 1}/${qs.length}</span></div>
        <p class="g-question">${q.q}</p>
        <div class="quiz-opts">${q.a.map((o, k) => `<button class="pixel-btn quiz-opt" data-k="${k}" type="button">${o[0]}</button>`).join("")}</div>`;
      c.querySelectorAll(".quiz-opt").forEach((b) => b.addEventListener("click", () => {
        const t = q.a[+b.dataset.k][1]; score[t] = (score[t] || 0) + 1; i++; sfx("click"); render();
      }));
    };
    render();
  };

  // ---------------------------------------------------------
  // 8. FORTUNE COOKIE
  // ---------------------------------------------------------
  G.cookie = (c) => {
    const f = [
      "Someone smiles a little wider every time your name comes up.",
      "A message you've been waiting for is closer than you think.",
      "Your kindness is quietly noticed. By more than one person.",
      "Be brave this week. A small hello can change a lot.",
      "You will soon be the reason someone's day gets better.",
      "A secret admirer? The cookie doesn't say. But the cookie definitely thinks so.",
      "Good things come to those who stay sweet.",
      "The next time you laugh, someone is going to fall for it.",
      "Your heart knows the way. Trust the pull.",
      "A pleasant surprise is hiding in an ordinary day.",
      "Someone is practising what to say to you in the mirror.",
      "You are more unforgettable than you realise."
    ];
    const colors = ["Blush Pink", "Strawberry Red", "Sunset Peach", "Lavender", "Cotton Candy"];
    const set = () => {
      c.innerHTML = `<p class="g-intro">Tap the cookie to crack it open.</p>
        <button class="cookie" id="cookie" type="button" aria-label="Fortune cookie">🥠</button>
        <div class="g-result" id="fortune">Tap to crack ✨</div>`;
      const ck = c.querySelector("#cookie"); let open = false;
      ck.addEventListener("click", () => {
        if (open) { set(); return; }
        open = true; ck.classList.add("crack"); sfx("gachaPop");
        setTimeout(() => {
          c.querySelector("#fortune").innerHTML = `<div class="fortune-paper">“${pick(f)}”<br><small>Lucky numbers: ${[1, 2, 3].map(() => 1 + Math.floor(Math.random() * 60)).join(" · ")}<br>Lucky color: ${pick(colors)}</small></div><small>(tap the cookie for another)</small>`;
          LOVE.add(2);
        }, 450);
      });
    };
    set();
  };

  // ---------------------------------------------------------
  // 9. LOVE POTION MIXER
  // ---------------------------------------------------------
  G.potion = (c) => {
    const ing = [["🌹", "Rose Petal"], ["🍓", "Strawberry"], ["✨", "Stardust"], ["🍯", "Honey"], ["🌙", "Moon Dew"], ["🍂", "Cinnamon"]];
    const pots = [
      ["Elixir of Butterflies", "Makes your stomach flutter whenever a certain someone is near."],
      ["Brave Heart Brew", "One sip and you can finally say hello without panicking."],
      ["Sugar Crush Syrup", "So sweet it makes ordinary Tuesdays feel like holidays."],
      ["Moonlit Daydream Tonic", "Guarantees at least 3 accidental daydreams per day."],
      ["Blush Berry Fizz", "Warning: causes uncontrollable smiling and pink cheeks."],
      ["Starlight Serenity", "Calms the nerves and makes you glow in a crowded hallway."],
      ["Golden Honey Charm", "Adds a little extra warmth to every conversation."],
      ["Midnight Rose Potion", "Dreamy, mysterious and quietly irresistible."]
    ];
    let sel = [];
    const render = (res) => {
      c.innerHTML = `<p class="g-intro">Choose exactly 3 ingredients and brew your own love potion.</p>
        <div class="ing-grid">${ing.map((x, i) => `<button class="pixel-btn ing ${sel.includes(i) ? "active" : ""}" data-i="${i}" type="button"><span class="ing-e">${x[0]}</span>${x[1]}</button>`).join("")}</div>
        <div class="cauldron ${res === "brewing" ? "bubbling" : ""}">🫕</div>
        <div class="g-actions"><button id="brew" class="pixel-btn pixel-btn-primary" type="button" ${sel.length === 3 ? "" : "disabled"}>🧪 Brew (${sel.length}/3)</button></div>
        <div class="g-result" id="pres">${res && res !== "brewing" ? res : "Pick 3 ingredients..."}</div>`;
      c.querySelectorAll(".ing").forEach((b) => b.addEventListener("click", () => {
        const i = +b.dataset.i; sfx("click");
        if (sel.includes(i)) sel = sel.filter((x) => x !== i); else if (sel.length < 3) sel.push(i);
        render();
      }));
      c.querySelector("#brew").addEventListener("click", () => {
        render("brewing"); sfx("gachaPop");
        const key = [...sel].sort().reduce((a, v, k) => a * 3 + v + k, 1) % pots.length;
        setTimeout(() => {
          const p = pots[key];
          sel = [];
          render(`<strong>🧪 ${p[0]}</strong><br>${p[1]}`);
          LOVE.add(5); sfx("clueFound");
        }, 1400);
      });
    };
    render();
  };

  // ---------------------------------------------------------
  // 10. CONSTELLATION — connect the stars into a heart
  // ---------------------------------------------------------
  G.stars = (c) => {
    c.innerHTML = `<p class="g-intro">Connect the glowing stars in order to reveal a hidden constellation.</p>
      <canvas id="st-canvas" width="420" height="320"></canvas>
      <div class="g-result" id="st-res">Tap the pulsing star ✨</div>
      <div class="g-actions"><button id="st-reset" class="pixel-btn" type="button">↻ Reset</button></div>`;
    const cv = c.querySelector("#st-canvas"), ctx = cv.getContext("2d");
    const pts = Array.from({ length: 10 }, (_, k) => {
      const t = Math.PI - (2 * Math.PI * k) / 10;
      const x = 16 * Math.sin(t) ** 3, y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      return [210 + x * 9, 150 - y * 9];
    });
    const bg = Array.from({ length: 50 }, () => [Math.random() * 420, Math.random() * 320, Math.random() * Math.PI * 2]);
    let next = 0, done = false, ph = 0, started = false;
    const draw = () => {
      if (started && !c.isConnected) return;
      started = true;
      ph += 0.08;
      ctx.fillStyle = "#2a1236"; ctx.fillRect(0, 0, 420, 320);
      bg.forEach(([x, y, p]) => { ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.4 * Math.abs(Math.sin(ph + p))})`; ctx.fillRect(x, y, 2, 2); });
      ctx.strokeStyle = done ? "#ff99c4" : "#ffd1e6"; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i < next; i++) { const [x, y] = pts[i]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      if (done) ctx.closePath();
      ctx.stroke();
      if (done) { ctx.fillStyle = "rgba(255,79,154,.28)"; ctx.fill(); }
      pts.forEach(([x, y], i) => {
        const lit = i < next, pulse = i === next && !done;
        ctx.fillStyle = lit ? "#fff2a8" : "#b58cff";
        const r = pulse ? 8 + 3 * Math.sin(ph * 2) : lit ? 7 : 5;
        ctx.fillRect(x - r / 2, y - r / 2, r, r);
        if (pulse) { ctx.strokeStyle = "#ff99c4"; ctx.strokeRect(x - 12, y - 12, 24, 24); }
      });
      requestAnimationFrame(draw);
    };
    setTimeout(draw, 50);
    cv.addEventListener("click", (e) => {
      if (done) return;
      const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) * (420 / r.width), my = (e.clientY - r.top) * (320 / r.height);
      const hit = pts.findIndex(([x, y]) => Math.hypot(x - mx, y - my) < 18);
      if (hit === next) {
        next++; sfx("note", 440 + next * 60);
        if (next === pts.length) {
          done = true; sfx("unlockFanfare");
          c.querySelector("#st-res").innerHTML = "<strong>A heart appears in the sky!</strong><br>Astronomers name it <em>“The Quiet Admirer.”</em> It only shines for people who keep looking up. ♥";
          LOVE.add(8);
        }
      } else if (hit >= 0) sfx("errorBuzz");
    });
    c.querySelector("#st-reset").addEventListener("click", () => { next = 0; done = false; c.querySelector("#st-res").textContent = "Tap the pulsing star ✨"; });
  };

  // ---------------------------------------------------------
  // 11. MAGIC 8-BALL (love edition)  +  12. LOVE TAROT
  // ---------------------------------------------------------
  G.ball = (c) => {
    const ans = [
      "Signs point to yes 💗", "It is written in the stars ✨", "Ask again after a smile 😊", "Definitely, say hi first!",
      "The pixels say: go for it", "Yes, but bring snacks 🍓", "Outlook: very sweet", "Without a doubt (and a blush)",
      "Not yet. Good things are brewing ⏳", "Trust your heart, it knows", "Absolutely, be brave 🌸", "Very likely, keep hoping",
      "The stars are still deciding ⭐", "A tiny nudge from fate says yes", "Cannot predict... too cute to compute"
    ];
    c.innerHTML = `<p class="g-intro">Think of a question about love, then shake the ball.</p>
      <input id="bq" class="pixel-input" maxlength="60" placeholder="Ask the ball anything..." autocomplete="off" />
      <button class="ball" id="ball" type="button" aria-label="Magic 8 ball"><span class="ball-window" id="bw">8</span></button>
      <div class="g-result" id="bres">Click the ball to shake it 🎱</div>`;
    const b = c.querySelector("#ball");
    b.addEventListener("click", () => {
      if (!c.querySelector("#bq").value.trim()) { sfx("errorBuzz"); c.querySelector("#bres").textContent = "Type a question first ♥"; return; }
      b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); sfx("gachaPop");
      c.querySelector("#bw").textContent = "?";
      setTimeout(() => { c.querySelector("#bw").textContent = "♥"; c.querySelector("#bres").innerHTML = `<strong>${pick(ans)}</strong>`; LOVE.add(2); }, 650);
    });
  };

  G.tarot = (c) => {
    const cards = [
      ["The Lovers 💞", "A bond is forming. Choices made from the heart lead somewhere beautiful."],
      ["The Star ⭐", "Hope is shining on you. Wishes made quietly are heard."],
      ["The Sun ☀️", "Warmth, joy and happy surprises are on their way."],
      ["The Moon 🌙", "Feelings are deep and still unspoken. Listen to your intuition."],
      ["Ace of Cups 🍷", "A new love or a new feeling is overflowing. Open your heart."],
      ["The Empress 🌸", "Tenderness and growth. What you nurture will bloom."],
      ["Two of Cups 🥂", "Mutual attraction. Two hearts, one gentle spark."],
      ["The Fool 🎒", "A leap of faith. Brave beginnings are the sweetest."]
    ];
    const slots = ["Past", "Present", "Future"];
    const start = () => {
      const deal = shuffle(cards).slice(0, 3); let shown = 0;
      c.innerHTML = `<p class="g-intro">Tap each card to reveal your love reading.</p>
        <div class="tarot-row">${deal.map((d, i) => `<button class="tarot" data-i="${i}" type="button"><span class="tarot-slot">${slots[i]}</span><span class="tarot-back">✦</span><span class="tarot-face">${d[0]}</span></button>`).join("")}</div>
        <div class="g-result" id="tres">Reveal all three cards...</div>
        <div class="g-actions"><button id="tr-again" class="pixel-btn" type="button">↻ New Reading</button></div>`;
      c.querySelectorAll(".tarot").forEach((t) => t.addEventListener("click", () => {
        if (t.classList.contains("up")) return;
        t.classList.add("up"); shown++; sfx("note", 500 + shown * 90);
        c.querySelector("#tres").innerHTML = deal.slice(0, 3).map((d, i) => c.querySelectorAll(".tarot")[i].classList.contains("up") ? `<strong>${slots[i]}: ${d[0]}</strong><br><small>${d[1]}</small>` : "").filter(Boolean).join("<br><br>");
        if (shown === 3) { LOVE.add(6); sfx("clueFound"); }
      }));
      c.querySelector("#tr-again").addEventListener("click", () => { sfx("click"); start(); });
    };
    start();
  };
})();

