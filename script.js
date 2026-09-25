/*
=========================================================
ETHAN'S WORD QUEST
Syllable puzzle game logic
=========================================================
*/

const setupScreen = document.getElementById("setupScreen");
const gameScreen = document.getElementById("gameScreen");
const finishScreen = document.getElementById("finishScreen");

const wordInput = document.getElementById("wordInput");
const practiceMode = document.getElementById("practiceMode");
const roundSize = document.getElementById("roundSize");

const prepareButton = document.getElementById("prepareButton");
const previewArea = document.getElementById("previewArea");
const clusterList = document.getElementById("clusterList");
const startButton = document.getElementById("startButton");

const hearButton = document.getElementById("hearButton");
const finishButton = document.getElementById("finishButton");
const syllableSlots = document.getElementById("syllableSlots");
const pieceBank = document.getElementById("pieceBank");
const feedback = document.getElementById("feedback");

const currentNumber = document.getElementById("currentNumber");
const totalWords = document.getElementById("totalWords");
const progressBar = document.getElementById("progressBar");

const finishMessage = document.getElementById("finishMessage");
const reviewArea = document.getElementById("reviewArea");
const reviewWords = document.getElementById("reviewWords");

const againButton = document.getElementById("againButton");
const changeWordsButton = document.getElementById("changeWordsButton");

let allWords = [];
let roundWords = [];
let queue = [];
let currentWord = "";
let currentSyllables = [];
let selectedSyllables = [];
let wordsCompleted = 0;
let reviewSet = new Set();
let currentWordHadMistake = false;
let puzzleLocked = false;


/*
=========================================================
SYLLABLE DATA
=========================================================
*/

/* Common words have spelling-friendly syllable chunks. */
const SYLLABLE_OVERRIDES = {
  kindness: ["kind", "ness"],
  libraries: ["li", "brar", "ies"],
  machine: ["ma", "chine"],
  neighbour: ["neigh", "bour"],
  "o'clock": ["o", "'clock"],
  paper: ["pa", "per"],
  question: ["ques", "tion"],
  railroad: ["rail", "road"],
  safe: ["safe"],
  thirty: ["thir", "ty"],
  discipline: ["dis", "ci", "pline"]
};

const COMMON_ONSETS = [
  "bl", "br", "ch", "cl", "cr", "dr", "fl", "fr", "gl", "gr",
  "pl", "pr", "sc", "sh", "sk", "sl", "sm", "sn", "sp", "st",
  "sw", "th", "tr", "tw", "wh", "wr", "str", "spl", "spr", "scr"
];


/*
=========================================================
SETUP / PREVIEW
=========================================================
*/

prepareButton.addEventListener("click", prepareWords);
startButton.addEventListener("click", startGame);

function prepareWords() {
  allWords = parseWords(wordInput.value);

  if (allWords.length === 0) {
    previewArea.classList.add("hidden");
    alert("Please enter at least one spelling word.");
    return;
  }

  renderClusters(allWords);
  previewArea.classList.remove("hidden");
}

function parseWords(text) {
  const words = text
    .split(/\n|,/)
    .map(word => word.trim())
    .filter(Boolean)
    .map(word => word.slice(0, 40));

  return [...new Set(words)];
}

function renderClusters(words) {
  const grouped = {};

  for (const word of words) {
    const label = getPrimaryPattern(word);

    if (!grouped[label]) {
      grouped[label] = [];
    }

    grouped[label].push(word);
  }

  clusterList.innerHTML = "";

  for (const [label, groupWords] of Object.entries(grouped)) {
    const card = document.createElement("article");
    card.className = "clusterCard";

    const heading = document.createElement("h3");
    heading.textContent = label;

    const chips = document.createElement("div");
    chips.className = "clusterWords";

    for (const word of groupWords) {
      const chip = document.createElement("span");
      chip.className = "wordChip";
      chip.textContent = word;
      chips.appendChild(chip);
    }

    card.appendChild(heading);
    card.appendChild(chips);
    clusterList.appendChild(card);
  }
}


/*
=========================================================
START ROUND
=========================================================
*/

function startGame() {
  allWords = parseWords(wordInput.value);

  if (allWords.length === 0) {
    alert("Please enter at least one spelling word.");
    return;
  }

  const requestedSize = Number(roundSize.value);
  const size = Math.min(allWords.length, requestedSize);

  if (practiceMode.value === "patterns") {
    roundWords = choosePatternRound(allWords, size);
  } else {
    roundWords = shuffle([...allWords]).slice(0, size);
  }

  queue = [...roundWords];
  wordsCompleted = 0;
  reviewSet.clear();

  totalWords.textContent = String(roundWords.length);

  setupScreen.classList.add("hidden");
  finishScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  nextWord();
}

function choosePatternRound(words, size) {
  const grouped = {};

  for (const word of words) {
    const label = getPrimaryPattern(word);

    if (!grouped[label]) {
      grouped[label] = [];
    }

    grouped[label].push(word);
  }

  const groups = Object.values(grouped)
    .sort((a, b) => b.length - a.length);

  const chosen = [];

  for (const group of groups) {
    for (const word of group) {
      if (chosen.length >= size) {
        return chosen;
      }

      chosen.push(word);
    }
  }

  return chosen;
}


/*
=========================================================
NEXT WORD / PUZZLE
=========================================================
*/

function nextWord() {
  if (queue.length === 0) {
    finishGame(false);
    return;
  }

  currentWord = queue.shift();
  currentSyllables = getSyllables(currentWord);
  selectedSyllables = [];
  currentWordHadMistake = false;
  puzzleLocked = false;

  feedback.textContent = "";
  currentNumber.textContent = String(
    Math.min(wordsCompleted + 1, roundWords.length)
  );

  updateProgress();
  renderPuzzle();
  speakWord(currentWord);
}

function renderPuzzle() {
  syllableSlots.innerHTML = "";
  pieceBank.innerHTML = "";

  currentSyllables.forEach((syllable, index) => {
    const slot = document.createElement("div");
    slot.className = "syllableSlot";
    slot.textContent = "?";
    slot.setAttribute("aria-label", `Empty syllable ${index + 1}`);
    syllableSlots.appendChild(slot);
  });

  const pieces = shuffle(
    currentSyllables.map((syllable, index) => ({ syllable, index }))
  );

  pieces.forEach(piece => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "syllablePiece";
    button.textContent = piece.syllable;
    button.dataset.index = String(piece.index);
    button.setAttribute("aria-label", `Syllable ${piece.syllable}`);
    button.addEventListener("click", () => choosePiece(button));
    pieceBank.appendChild(button);
  });
}

function choosePiece(button) {
  if (puzzleLocked || button.disabled) {
    return;
  }

  const chosenIndex = Number(button.dataset.index);
  const expectedIndex = selectedSyllables.length;

  if (chosenIndex !== expectedIndex) {
    currentWordHadMistake = true;
    reviewSet.add(currentWord);
    feedback.textContent = "That piece comes later. Try the next syllable piece.";
    button.classList.remove("pieceWrong");
    void button.offsetWidth;
    button.classList.add("pieceWrong");
    return;
  }

  selectedSyllables.push(currentSyllables[chosenIndex]);
  button.disabled = true;
  button.classList.add("pieceUsed");

  const slot = syllableSlots.children[expectedIndex];
  slot.textContent = currentSyllables[chosenIndex];
  slot.classList.add("filled");
  slot.setAttribute(
    "aria-label",
    `Syllable ${expectedIndex + 1}: ${currentSyllables[chosenIndex]}`
  );

  if (selectedSyllables.length === currentSyllables.length) {
    completeWord();
  } else {
    feedback.textContent = "Great choice! Find the next piece.";
  }
}

function completeWord() {
  puzzleLocked = true;
  wordsCompleted++;
  updateProgress();

  const builtWord = selectedSyllables.join("");
  feedback.textContent = `Great job! You built ${builtWord}.`;

  if (currentWordHadMistake) {
    scheduleReview(currentWord);
  }

  setTimeout(nextWord, 1100);
}

function scheduleReview(word) {
  if (queue.includes(word)) {
    return;
  }

  const distance = Math.min(queue.length, 2 + Math.floor(Math.random() * 2));
  queue.splice(distance, 0, word);
}

function updateProgress() {
  const percent =
    roundWords.length === 0
      ? 0
      : Math.min(100, (wordsCompleted / roundWords.length) * 100);

  progressBar.style.width = `${percent}%`;
}


/*
=========================================================
SYLLABLE SPLITTING
=========================================================
*/

function getSyllables(rawWord) {
  const word = rawWord.trim();
  const key = word.toLocaleLowerCase("en-CA");

  if (SYLLABLE_OVERRIDES[key]) {
    return [...SYLLABLE_OVERRIDES[key]];
  }

  const lowerWord = word.toLocaleLowerCase("en-CA");
  const vowelMatches = [...lowerWord.matchAll(/[aeiouy]+/g)];

  if (vowelMatches.length <= 1) {
    return [word];
  }

  const boundaries = [];

  for (let index = 0; index < vowelMatches.length - 1; index++) {
    const currentVowel = vowelMatches[index];
    const nextVowel = vowelMatches[index + 1];
    const currentEnd = currentVowel.index + currentVowel[0].length;
    const nextStart = nextVowel.index;
    const consonants = lowerWord.slice(currentEnd, nextStart);

    let boundary = currentEnd;

    if (consonants.length > 1) {
      const onset3 = consonants.slice(-3);
      const onset2 = consonants.slice(-2);

      if (COMMON_ONSETS.includes(onset3)) {
        boundary = nextStart - 3;
      } else if (COMMON_ONSETS.includes(onset2)) {
        boundary = nextStart - 2;
      } else {
        boundary = nextStart - 1;
      }
    }

    boundaries.push(boundary);
  }

  const syllables = [];
  let start = 0;

  for (const boundary of boundaries) {
    if (boundary > start) {
      syllables.push(word.slice(start, boundary));
      start = boundary;
    }
  }

  syllables.push(word.slice(start));
  return syllables.filter(Boolean);
}


/*
=========================================================
SPEECH
=========================================================
*/

function speakWord(word) {
  speakText(
    word,
    "Speech is not available in this browser, but you can still build the word from its pieces."
  );
}

function speakText(text, unavailableMessage) {
  if (!("speechSynthesis" in window)) {
    feedback.textContent = unavailableMessage;
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-CA";
  speech.rate = 0.78;
  speech.pitch = 1;
  window.speechSynthesis.speak(speech);
}


/*
=========================================================
FINISH
=========================================================
*/

function finishGame(stoppedEarly) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  gameScreen.classList.add("hidden");
  setupScreen.classList.add("hidden");
  finishScreen.classList.remove("hidden");

  if (stoppedEarly) {
    finishMessage.textContent =
      `You practised ${wordsCompleted} word${wordsCompleted === 1 ? "" : "s"} today. That still counts as practice.`;
  } else {
    finishMessage.textContent =
      `You finished the puzzle round and built ${roundWords.length} word${roundWords.length === 1 ? "" : "s"}.`;
  }

  if (reviewSet.size > 0) {
    reviewArea.classList.remove("hidden");
    reviewWords.textContent = [...reviewSet].join(" • ");
  } else {
    reviewArea.classList.add("hidden");
    reviewWords.textContent = "";
  }
}


/*
=========================================================
BUTTONS
=========================================================
*/

hearButton.addEventListener("click", () => {
  speakWord(currentWord);
});

finishButton.addEventListener("click", () => {
  finishGame(true);
});

againButton.addEventListener("click", () => {
  startGame();
});

changeWordsButton.addEventListener("click", () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  finishScreen.classList.add("hidden");
  setupScreen.classList.remove("hidden");
  previewArea.classList.add("hidden");
  wordInput.focus();
});


/*
=========================================================
UTILITIES
=========================================================
*/

function shuffle(array) {
  const copy = [...array];

  for (let index = copy.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}
