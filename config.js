// ============================================================
// PAGES FOR YOU — Workspace Configuration
// ============================================================

window.PAGES_CONFIG = {
  osTitle: "PINK.OS",

  // Encoded secret payload so casual repo visitors don't get spoiled!
  // Decodes automatically inside the app once the puzzle is solved.
  _secretPayload:
    "eyJwYXNzY29kZSI6IlpISUEiLCJiYWRnZSI6IlNFQ1JFVCBVTkxPQ0tFRCAvLyBGT1IgWkhJQSIsImhlYWRpbmciOiJEZWFyIFpoaWEsIn0=",

  // Secret Quotes shown in the Pink Capsule / Quotes App (spoiler-free!)
  secretQuotes: [
    "Some people feel like sunshine even on rainy days.",
    "You have no idea how much a single smile from you changes my whole mood.",
    "Every time my phone lights up, I secretly hope it's you.",
    "If I could bookmark a feeling, it would be every moment I see you smile.",
    "You make ordinary afternoons feel like cherry blossom season.",
    "Out of all the pages I could ever build, my favorite one is about you.",
    "Notice how the little pixel pets get happier when you're here? Same.",
    "I'm not great at saying things out loud, so I hid them in pixels instead.",
    "Little reminder: you are effortlessly wonderful.",
    "Sometimes admiring someone quietly from afar is the sweetest part of the day."
  ],

  // The 4 Puzzle Clues (each unlocks one seal of the Secret Vault)
  clues: {
    quotes: {
      id: "quotes",
      letter: "Z",
      slot: 1,
      title: "Sakura Seal",
      source: "Quote Jar",
      hint: "Pull 3 capsules in the Quote Jar app until the Golden Capsule appears.",
      quote: "Zero chance I don't smile whenever I happen to spot you across campus."
    },
    pets: {
      id: "pets",
      letter: "H",
      slot: 2,
      title: "Pawprint Seal",
      source: "Desktop Pets",
      hint: "Pet or feed Mochi, Boba, or Pudding on the desktop until they're super happy!",
      quote: "Heartbeats speed up a little whenever you walk past."
    },
    diary: {
      id: "diary",
      letter: "I",
      slot: 3,
      title: "Starlight Seal",
      source: "Secret Diary",
      hint: "Open Secret Diary and turn on the Pink UV Lamp to reveal the invisible ink.",
      quote: "In a crowded hallway, you're still the only one I notice."
    },
    melody: {
      id: "melody",
      letter: "A",
      slot: 4,
      title: "Moonbeam Seal",
      source: "Melody Box",
      hint: "Open Melody Box and play the 4 glowing pink piano notes in order.",
      quote: "Always acting cool when you're near, even though I fold instantly."
    }
  },

  // Final Secret Confession (shown ONLY after solving the puzzle!)
  confession: {
    // Embedded message card (top section)
    embeddedTitle: "💌 A Quiet Note From Afar",
    embeddedParagraphs: [
      "I've been admiring you quietly from afar for a while now. Every time our paths cross around campus, even just for a second, it somehow makes my whole day lighter.",
      "Honestly, whenever you glance back my way, it's almost impossible to hold eye contact — I get shy and fold instantly (tiklop agad, no defense at all).",
      "Since I can never seem to keep my composure in person, I built this little pink pixel workspace just to make you smile... and to finally let you know what I've been keeping to myself."
    ],
    // Highlighted quote at the bottom
    bottomQuote: "“The owner of this workspace has a crush on you.”",
    signoff: "Still folding every time I see you on campus,",
    signature: "— Someone secretly rooting for you ♥"
  }
};
