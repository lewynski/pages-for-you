// ============================================================
// PAGES FOR YOU — Easy Personalization Config
// Edit anything below to customize quotes, clues, or the letter!
// ============================================================

window.PAGES_CONFIG = {
  crushName: "Zhia",
  osTitle: "ZHIA.OS",
  passcode: "ZHIA", // 4-letter secret code unlocked by the 4 clues

  // Secret Quotes shown in the Pink Capsule / Quotes App
  secretQuotes: [
    "Some people feel like sunshine even on rainy days.",
    "You have no idea how much a single smile from you changes my whole mood.",
    "Every time my phone lights up, I secretly hope it's you.",
    "If I could bookmark a feeling, it would be every moment I talk to you.",
    "You make ordinary afternoons feel like cherry blossom season.",
    "Out of all the pages I could ever build, my favorite one is about you.",
    "Notice how the little pixel pets get happier when you're here? Same.",
    "I'm not great at saying things out loud, so I hid them in pixels instead.",
    "Little reminder: you are effortlessly wonderful, Zhia.",
    "My favorite notification will always be your name."
  ],

  // The 4 Puzzle Clues (each unlocks one seal of the Secret Vault)
  clues: {
    quotes: {
      id: "quotes",
      letter: "Z",
      slot: 1,
      title: "Sakura Seal",
      source: "Quote Capsule",
      hint: "Pull 3 capsules in the Secret Quotes app until the Golden Capsule appears.",
      quote: "Zero chance I don't smile whenever your name pops up on my screen."
    },
    pets: {
      id: "pets",
      letter: "H",
      slot: 2,
      title: "Pawprint Seal",
      source: "Desktop Pets",
      hint: "Pet or feed Mochi the Cat or Boba the Bunny on the desktop until they're super happy!",
      quote: "Heartbeats speed up a little whenever you're around."
    },
    diary: {
      id: "diary",
      letter: "I",
      slot: 3,
      title: "Starlight Seal",
      source: "Secret Diary",
      hint: "Open Secret Diary and turn on the Pink UV Lamp to reveal the invisible ink.",
      quote: "In a room full of stars, you're the only one I look for."
    },
    melody: {
      id: "melody",
      letter: "A",
      slot: 4,
      title: "Moonbeam Seal",
      source: "Melody Box",
      hint: "Open Melody Box and play the 4 glowing pink piano notes in order.",
      quote: "Always you. Even when I try to act cool about it."
    }
  },

  // Final Secret Confession Letter (shown once the puzzle is solved!)
  confession: {
    badge: "SECRET UNLOCKED // FOR ZHIA ONLY",
    heading: "Dear Zhia,",
    paragraphs: [
      "You solved every little puzzle, petted the pixel friends, uncovered the hidden quotes, and opened the most secret corner of this workspace.",
      "I made this little pink pixel world because I wanted to build something cute that might make you smile — and because there's something I've been wanting to tell you for a while.",
      "I have a crush on you, Zhia.",
      "I really admire the way you brighten up every moment just by being yourself. No pressure at all — I just didn't want to keep this a secret forever, and you deserve to know how special you are to me."
    ],
    signoff: "Made with pixels & a very real crush,",
    signature: "— Someone who really likes you ♥"
  }
};
