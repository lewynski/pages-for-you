// ============================================================
// Interactive Roaming Pixel Pets Engine (Mochi, Boba & Pudding)
// ============================================================

const PET_SPRITES = {
  mochi: `
    <svg viewBox="0 0 16 16" shape-rendering="crispEdges" width="56" height="56">
      <!-- Ears -->
      <rect x="3" y="2" width="2" height="3" fill="#6b2649"/>
      <rect x="11" y="2" width="2" height="3" fill="#6b2649"/>
      <rect x="4" y="3" width="1" height="2" fill="#ff99c4"/>
      <rect x="11" y="3" width="1" height="2" fill="#ff99c4"/>
      <!-- Pink Bow -->
      <rect x="6" y="2" width="4" height="2" fill="#ff4f9a"/>
      <rect x="7" y="3" width="2" height="1" fill="#fff2c2"/>
      <!-- Head & Body -->
      <rect x="2" y="5" width="12" height="8" fill="#6b2649"/>
      <rect x="3" y="5" width="10" height="7" fill="#fff5f9"/>
      <rect x="3" y="10" width="10" height="2" fill="#ffe0ef"/>
      <!-- Eyes & Blush -->
      <rect x="5" y="7" width="1" height="2" fill="#6b2649"/>
      <rect x="10" y="7" width="1" height="2" fill="#6b2649"/>
      <rect x="4" y="9" width="2" height="1" fill="#ff85b8"/>
      <rect x="10" y="9" width="2" height="1" fill="#ff85b8"/>
      <rect x="7" y="9" width="2" height="1" fill="#ff4f9a"/>
      <!-- Paws & Tail -->
      <rect x="4" y="13" width="2" height="2" fill="#6b2649"/>
      <rect x="10" y="13" width="2" height="2" fill="#6b2649"/>
      <rect x="14" y="8" width="1" height="4" fill="#6b2649"/>
      <rect x="13" y="11" width="2" height="1" fill="#ff99c4"/>
    </svg>
  `,
  boba: `
    <svg viewBox="0 0 16 16" shape-rendering="crispEdges" width="56" height="56">
      <!-- Long Bunny Ears -->
      <rect x="4" y="1" width="2" height="5" fill="#6b2649"/>
      <rect x="10" y="1" width="2" height="5" fill="#6b2649"/>
      <rect x="5" y="2" width="1" height="4" fill="#ffc2dd"/>
      <rect x="10" y="2" width="1" height="4" fill="#ffc2dd"/>
      <!-- Head & Body -->
      <rect x="3" y="6" width="10" height="7" fill="#6b2649"/>
      <rect x="4" y="6" width="8" height="6" fill="#ffd9ec"/>
      <rect x="5" y="10" width="6" height="2" fill="#fff5f9"/>
      <!-- Eyes & Nose -->
      <rect x="5" y="8" width="1" height="2" fill="#6b2649"/>
      <rect x="10" y="8" width="1" height="2" fill="#6b2649"/>
      <rect x="4" y="10" width="1" height="1" fill="#ff4f9a"/>
      <rect x="11" y="10" width="1" height="1" fill="#ff4f9a"/>
      <rect x="7" y="9" width="2" height="1" fill="#ff4f9a"/>
      <!-- Paws & Fluffy Tail -->
      <rect x="4" y="13" width="2" height="2" fill="#6b2649"/>
      <rect x="10" y="13" width="2" height="2" fill="#6b2649"/>
      <rect x="13" y="10" width="2" height="2" fill="#ffffff"/>
    </svg>
  `,
  pudding: `
    <svg viewBox="0 0 16 16" shape-rendering="crispEdges" width="56" height="56">
      <!-- Cute Tuft & Ribbon -->
      <rect x="7" y="2" width="2" height="2" fill="#ffbe3b"/>
      <rect x="6" y="3" width="4" height="1" fill="#ff4f9a"/>
      <!-- Round Chick Body -->
      <rect x="3" y="4" width="10" height="9" fill="#6b2649"/>
      <rect x="4" y="5" width="8" height="7" fill="#fff0a6"/>
      <rect x="3" y="8" width="1" height="3" fill="#ffd15c"/>
      <rect x="12" y="8" width="1" height="3" fill="#ffd15c"/>
      <!-- Eyes & Beak -->
      <rect x="5" y="7" width="1" height="2" fill="#6b2649"/>
      <rect x="10" y="7" width="1" height="2" fill="#6b2649"/>
      <rect x="7" y="9" width="2" height="1" fill="#ff7a3b"/>
      <rect x="4" y="9" width="1" height="1" fill="#ff85b8"/>
      <rect x="11" y="9" width="1" height="1" fill="#ff85b8"/>
      <!-- Feet -->
      <rect x="5" y="13" width="2" height="2" fill="#ff7a3b"/>
      <rect x="9" y="13" width="2" height="2" fill="#ff7a3b"/>
    </svg>
  `
};

const PET_LINES = {
  mochi: [
    "purr~ hi Zhia! ♥",
    "mrrrow~ you're so pretty!",
    "pet me more~ 🐾",
    "someone made this for you!",
    "meow! check the diary too~"
  ],
  boba: [
    "*hop hop* hi Zhia!!",
    "got any strawberries? 🍓",
    "my ears perk up for you!",
    "boba + Zhia = best day ♥",
    "psst... a clue is nearby!"
  ],
  pudding: [
    "peep peep! ♥",
    "cheering for you, Zhia!",
    "*happy wiggle* ✨",
    "you make the sun brighter!",
    "chirp! try the melody box~"
  ]
};

class PixelPetsManager {
  constructor(layerEl, onPetMilestone) {
    this.layerEl = layerEl;
    this.onPetMilestone = onPetMilestone;
    this.pets = [
      { id: "mochi", name: "Mochi", role: "Sakura Cat", x: 140, dir: 1, speed: 0.55, state: "walk", timer: 140, hearts: 1 },
      { id: "boba", name: "Boba", role: "Pink Bunny", x: 340, dir: -1, speed: 0.72, state: "idle", timer: 90, hearts: 1 },
      { id: "pudding", name: "Pudding", role: "Pixel Chick", x: 520, dir: 1, speed: 0.48, state: "walk", timer: 110, hearts: 1 }
    ];
    this.treatTarget = null;
    this.clueTriggered = false;
    this.renderPets();
    this.startLoop();
  }

  renderPets() {
    this.layerEl.innerHTML = "";
    this.pets.forEach((pet) => {
      const el = document.createElement("div");
      el.className = "pixel-pet";
      el.dataset.petId = pet.id;
      el.style.left = `${pet.x}px`;
      el.innerHTML = `
        <div class="pet-sprite">${PET_SPRITES[pet.id]}</div>
        <span class="pet-nametag">${pet.name}</span>
      `;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.petAnimal(pet.id);
      });
      pet.el = el;
      this.layerEl.appendChild(el);
    });
  }

  petAnimal(petId, bonus = 1, customLine = null) {
    const pet = this.pets.find((p) => p.id === petId);
    if (!pet) return;

    pet.hearts = Math.min(5, pet.hearts + bonus);
    if (window.pixelAudio) window.pixelAudio.petChirp();

    pet.el.classList.remove("happy");
    void pet.el.offsetWidth;
    pet.el.classList.add("happy");

    this.spawnHeart(pet.x + 28, 68);
    this.spawnHeart(pet.x + 12, 54);

    const lines = PET_LINES[pet.id];
    const line = customLine || lines[Math.floor(Math.random() * lines.length)];
    this.showBubble(pet, line);

    if (typeof this.onPetMilestone === "function") {
      this.onPetMilestone(pet, this.pets);
    }

    if (!this.clueTriggered && pet.hearts >= 3) {
      this.clueTriggered = true;
      setTimeout(() => {
        this.showBubble(pet, "♥ Found a Secret Seal: [H]!");
      }, 450);
    }
  }

  dropTreat(emoji = "🍓") {
    const maxWidth = Math.max(260, window.innerWidth - 160);
    const treatX = Math.floor(90 + Math.random() * (maxWidth - 90));

    if (this.treatTarget && this.treatTarget.el) {
      this.treatTarget.el.remove();
    }

    const el = document.createElement("div");
    el.className = "dropped-treat";
    el.textContent = emoji;
    el.style.left = `${treatX}px`;
    this.layerEl.appendChild(el);

    this.treatTarget = { x: treatX, emoji, el };
    if (window.pixelAudio) window.pixelAudio.click();
  }

  showBubble(pet, text) {
    const existing = pet.el.querySelector(".pet-bubble");
    if (existing) existing.remove();

    const bubble = document.createElement("div");
    bubble.className = "pet-bubble";
    bubble.textContent = text;
    pet.el.appendChild(bubble);

    clearTimeout(pet.bubbleTimer);
    pet.bubbleTimer = setTimeout(() => {
      bubble.remove();
    }, 2600);
  }

  spawnHeart(x, bottomPx) {
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    heart.textContent = Math.random() > 0.35 ? "♥" : "✨";
    heart.style.left = `${x}px`;
    heart.style.bottom = `${bottomPx}px`;
    this.layerEl.appendChild(heart);
    setTimeout(() => heart.remove(), 1100);
  }

  startLoop() {
    const tick = () => {
      const minX = 85;
      const maxX = Math.max(260, window.innerWidth - 155);

      this.pets.forEach((pet) => {
        if (this.treatTarget) {
          const dx = this.treatTarget.x - pet.x;
          if (Math.abs(dx) < 16) {
            // Eat treat!
            const emoji = this.treatTarget.emoji;
            this.treatTarget.el.remove();
            this.treatTarget = null;
            if (window.pixelAudio) window.pixelAudio.feedTreat();
            this.petAnimal(pet.id, 2, `nom nom ${emoji} yummy!!`);
          } else {
            pet.dir = dx > 0 ? 1 : -1;
            pet.x += pet.dir * (pet.speed * 2.1);
            pet.state = "walk";
          }
        } else {
          pet.timer--;
          if (pet.timer <= 0) {
            if (Math.random() < 0.65) {
              pet.state = "walk";
              pet.dir = Math.random() < 0.5 ? -1 : 1;
              pet.timer = 90 + Math.floor(Math.random() * 140);
            } else {
              pet.state = "idle";
              pet.timer = 70 + Math.floor(Math.random() * 100);
            }
          }

          if (pet.state === "walk") {
            pet.x += pet.dir * pet.speed;
            if (pet.x < minX) {
              pet.x = minX;
              pet.dir = 1;
            } else if (pet.x > maxX) {
              pet.x = maxX;
              pet.dir = -1;
            }
          }
        }

        pet.el.style.left = `${Math.round(pet.x)}px`;
        pet.el.style.setProperty("--dir", pet.dir === -1 ? "-1" : "1");
        pet.el.classList.toggle("facing-left", pet.dir === -1);
        pet.el.classList.toggle("walking", pet.state === "walk");
      });

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}

window.PET_SPRITES = PET_SPRITES;
window.PixelPetsManager = PixelPetsManager;
