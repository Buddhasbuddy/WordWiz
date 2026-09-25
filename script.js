/*
=========================================================
ETHAN'S WORD QUEST
Main game logic
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
const helpButton = document.getElementById("helpButton");
const showButton = document.getElementById("showButton");
const checkButton = document.getElementById("checkButton");
const finishButton = document.getElementById("finishButton");

const answerInput = document.getElementById("answerInput");

const helperBox = document.getElementById("helperBox");
const helperTitle = document.getElementById("helperTitle");
const helperText = document.getElementById("helperText");

const wordReveal = document.getElementById("wordReveal");
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
let helperIndex = 0;
let wordsCompleted = 0;
let wordsSeenThisRound = 0;
let reviewSet = new Set();
let currentWordUsedHelp = false;
let currentWordWasMissed = false;


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
  wordsSeenThisRound = 0;
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
NEXT WORD
=========================================================
*/

function nextWord() {
  if (queue.length === 0) {
    finishGame(false);
    return;
  }

  currentWord = queue.shift();

  helperIndex = 0;
  currentWordUsedHelp = false;
  currentWordWasMissed = false;

  answerInput.value = "";
  feedback.textContent = "";

  helperBox.classList.add("hidden");
  helperTitle.textContent = "";
  helperText.textContent = "";

  wordReveal.classList.add("hidden");
  wordReveal.textContent = "";

  showButton.textContent = "👀 Show Me the Word";
  showButton.dataset.visible = "false";

  wordsSeenThisRound++;

  currentNumber.textContent =
    String(Math.min(wordsCompleted + 1, roundWords.length));

  updateProgress();

  speakWord(currentWord);
  answerInput.focus();
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
SPEECH
=========================================================
*/

function speakWord(word) {
  if (!("speechSynthesis" in window)) {
    feedback.textContent =
      "Speech is not available in this browser, but you can still practise by reading the word from your list.";
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(word);

  speech.lang = "en-CA";
  speech.rate = 0.78;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}


/*
=========================================================
HELPERS
=========================================================
*/

function showNextHelper() {
  const helpers = getHelpers(currentWord);

  currentWordUsedHelp = true;
  reviewSet.add(currentWord);

  helperBox.classList.remove("hidden");

  if (helperIndex < helpers.length) {
    const helper = helpers[helperIndex];

    helperTitle.textContent = helper.title;
    helperText.textContent = helper.text;

    helperIndex++;
  } else {
    helperTitle.textContent = "You have used all the clues";
    helperText.textContent =
      "You can choose “Show Me the Word” whenever you're ready.";
  }
}


/*
=========================================================
SHOW / HIDE WORD
=========================================================
*/

function revealWord() {
  currentWordUsedHelp = true;
  reviewSet.add(currentWord);

  wordReveal.textContent = currentWord;
  wordReveal.classList.remove("hidden");

  feedback.textContent =
    "Look at the word for as long as you need. Hide it when you're ready to try again.";

  showButton.textContent = "🙈 Hide the Word";
  showButton.dataset.visible = "true";
}


function hideWord() {
  wordReveal.classList.add("hidden");

  showButton.textContent = "👀 Show Me the Word";
  showButton.dataset.visible = "false";

  answerInput.value = "";
  answerInput.focus();
}


/*
=========================================================
CHECK ANSWER
=========================================================
*/

function checkAnswer() {
  const answer = normalizeForComparison(answerInput.value);
  const target = normalizeForComparison(currentWord);

  if (!answer) {
    feedback.textContent =
      "Type your best try first. You can use Help Me whenever you want.";
    return;
  }

  if (answer === target) {
    feedback.textContent =
      currentWordUsedHelp
        ? "You got it. The strategy helped!"
        : "You got it on your own!";

    wordsCompleted++;
    updateProgress();

    if (currentWordUsedHelp || currentWordWasMissed) {
      scheduleReview(currentWord);
    }

    setTimeout(nextWord, 900);
    return;
  }

  currentWordWasMissed = true;
  currentWordUsedHelp = true;
  reviewSet.add(currentWord);

  feedback.textContent =
    "Good try. Let's use a strategy.";

  showNextHelper();
}


/*
=========================================================
SPACED REVIEW
=========================================================
*/

function scheduleReview(word) {
  /*
  Do not add the same word over and over.
  At most one extra copy is kept in the queue.
  */

  if (queue.includes(word)) {
    return;
  }

  /*
  Put the word about 2–3 items later when possible.
  */

  const distance =
    Math.min(
      queue.length,
      2 + Math.floor(Math.random() * 2)
    );

  queue.splice(distance, 0, word);
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
      `You finished the round and practised ${roundWords.length} word${roundWords.length === 1 ? "" : "s"}.`;
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

helpButton.addEventListener("click", showNextHelper);

showButton.addEventListener("click", () => {
  if (showButton.dataset.visible === "true") {
    hideWord();
  } else {
    revealWord();
  }
});

checkButton.addEventListener("click", checkAnswer);

answerInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    checkAnswer();
  }
});

finishButton.addEventListener("click", () => {
  finishGame(true);
});

againButton.addEventListener("click", () => {
  startGame();
});

changeWordsButton.addEventListener("click", () => {
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

function normalizeForComparison(text) {
  return text
    .trim()
    .toLocaleLowerCase("en-CA")
    .replace(/’/g, "'");
}


function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}
