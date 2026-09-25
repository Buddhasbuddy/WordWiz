/*
=========================================================
SPELLING STRATEGY ENGINE
Approximately Grades 1–5 Canadian English

This file contains:
- verified word-specific helpers
- Canadian spelling notes
- common prefixes and suffixes
- common spelling patterns
- contraction and compound-word helpers
- safe fallback strategies

The engine is intentionally conservative. When it cannot
confidently identify a useful spelling rule, it falls back
to general strategies instead of inventing a rule.
=========================================================
*/

const SPELLING_OVERRIDES = {
  kindness: [
    { title: "Build the word", text: "kind + ness" },
    { title: "Suffix", text: "The suffix -ness turns a describing word into a noun." },
    { title: "Use the pattern", text: "kind → kindness, dark → darkness, weak → weakness" }
  ],

  libraries: [
    { title: "Start with the base word", text: "library" },
    { title: "Plural pattern", text: "When a consonant comes before y, change y to i and add es." },
    { title: "Build the word", text: "library → libraries" }
  ],

  machine: [
    { title: "Spelling chunks", text: "ma + chine" },
    { title: "Tricky spelling", text: "The ch in machine sounds like /sh/." },
    { title: "Remember the ending", text: "The last chunk is spelled chine." }
  ],

  neighbour: [
    { title: "Spelling chunks", text: "neigh + bour" },
    { title: "Memory connection", text: "The first part is spelled like neigh, the sound a horse makes." },
    { title: "Canadian spelling", text: "Notice the our near the end: neigh + bour." }
  ],

  "o'clock": [
    { title: "Contraction", text: "o'clock comes from 'of the clock'." },
    { title: "Apostrophe", text: "The apostrophe shows that letters have been removed." },
    { title: "Build the word", text: "o + ' + clock" }
  ],

  paper: [
    { title: "Say it in parts", text: "pa • per" },
    { title: "Spelling chunks", text: "pa + per" }
  ],

  question: [
    { title: "Spelling chunks", text: "ques + tion" },
    { title: "Beginning", text: "The word begins with qu." },
    { title: "Ending", text: "The ending is spelled tion." }
  ],

  railroad: [
    { title: "Compound word", text: "railroad is made from two smaller words." },
    { title: "Build the word", text: "rail + road" }
  ],

  safe: [
    { title: "Silent-e pattern", text: "Notice the e at the end." },
    { title: "Compare", text: "Compare saf and safe. The final e changes how the vowel sounds." },
    { title: "Build the word", text: "saf + e" }
  ],

  thirty: [
    { title: "Spelling chunks", text: "thir + ty" },
    { title: "Ending", text: "Listen for the -ty ending." }
  ],

  discipline: [
    { title: "Spelling chunks", text: "dis + ci + pline" },
    { title: "Beginning", text: "Start with the familiar spelling dis." },
    { title: "Build it", text: "dis → disci → discipline" }
  ],

  because: [
    { title: "Memory chunks", text: "be + cause" },
    { title: "Remember", text: "The second part is cause." }
  ],

  beautiful: [
    { title: "Build the word", text: "beauty + ful" },
    { title: "Spelling clue", text: "Keep beau at the beginning." },
    { title: "Suffix", text: "The ending is -ful, with one l." }
  ],

  friend: [
    { title: "Tricky middle", text: "Remember the letters ie in friend." },
    { title: "Look closely", text: "fr + ie + nd" }
  ],

  people: [
    { title: "Tricky spelling", text: "The first part sounds different from how it is spelled." },
    { title: "Spelling chunks", text: "peo + ple" }
  ],

  enough: [
    { title: "Spelling chunks", text: "e + nough" },
    { title: "Tricky ending", text: "The letters ough make the /uff/ sound in this word." }
  ],

  through: [
    { title: "Tricky pattern", text: "The word contains ough." },
    { title: "Look closely", text: "thr + ough" }
  ],

  thought: [
    { title: "Tricky pattern", text: "Look for ough in the middle." },
    { title: "Ending", text: "The word ends with ht." }
  ],

  could: [
    { title: "Word family", text: "could, would, and should share the spelling ould." }
  ],

  would: [
    { title: "Word family", text: "could, would, and should share the spelling ould." }
  ],

  should: [
    { title: "Word family", text: "could, would, and should share the spelling ould." }
  ]
};


const CANADIAN_SPELLINGS = {
  neighbour: "Canadian spelling uses neighbour.",
  colour: "Canadian spelling commonly uses -our: colour.",
  favourite: "Canadian spelling commonly uses -our: favourite.",
  honour: "Canadian spelling commonly uses -our: honour.",
  humour: "Canadian spelling commonly uses -our: humour.",
  labour: "Canadian spelling commonly uses -our: labour.",

  centre: "Canadian spelling commonly uses centre rather than center.",
  metre: "For the unit of measurement, Canadian spelling uses metre.",
  theatre: "Canadian spelling commonly uses theatre.",

  travelled: "Canadian spelling commonly doubles the l: travelled.",
  travelling: "Canadian spelling commonly doubles the l: travelling.",
  traveller: "Canadian spelling commonly doubles the l: traveller.",
  cancelled: "Canadian spelling commonly doubles the l: cancelled.",
  cancelling: "Canadian spelling commonly doubles the l: cancelling."
};


const PREFIXES = [
  { prefix: "un", meaning: "not or the opposite of" },
  { prefix: "re", meaning: "again" },
  { prefix: "dis", meaning: "not, opposite, or apart" },
  { prefix: "mis", meaning: "wrongly or badly" },
  { prefix: "pre", meaning: "before" },
  { prefix: "non", meaning: "not" },
  { prefix: "over", meaning: "too much or above" },
  { prefix: "under", meaning: "below or not enough" },
  { prefix: "inter", meaning: "between" },
  { prefix: "sub", meaning: "under or below" },
  { prefix: "anti", meaning: "against" }
];


const SUFFIXES = [
  { suffix: "ness", description: "a common noun-forming suffix" },
  { suffix: "less", description: "means without" },
  { suffix: "ful", description: "means full of" },
  { suffix: "ment", description: "a common noun-forming suffix" },
  { suffix: "able", description: "often means able to be" },
  { suffix: "ible", description: "often means able to be" },
  { suffix: "tion", description: "a common noun ending" },
  { suffix: "sion", description: "a common noun ending" },
  { suffix: "ly", description: "a common adverb ending" },
  { suffix: "er", description: "can name a person or compare two things" },
  { suffix: "est", description: "can compare three or more things" },
  { suffix: "ing", description: "shows an ongoing action" },
  { suffix: "ed", description: "often marks past tense" }
];


const SPELLING_PATTERNS = [
  { pattern: "tion", message: "Notice the ending tion. It often sounds like 'shun'." },
  { pattern: "sion", message: "Notice the ending sion. It can sound like 'zhun' or 'shun'." },
  { pattern: "ture", message: "Notice the spelling chunk ture." },
  { pattern: "igh", message: "The letters igh often work together in words such as night and light." },
  { pattern: "eigh", message: "Notice the unusual spelling chunk eigh." },
  { pattern: "ough", message: "Notice the spelling chunk ough. Its sound can change from word to word." },
  { pattern: "ph", message: "The letters ph often represent the /f/ sound." },
  { pattern: "qu", message: "Notice the qu spelling at the beginning or inside the word." },
  { pattern: "kn", message: "At the beginning of some words, the k in kn is silent." },
  { pattern: "wr", message: "At the beginning of some words, the w in wr is silent." },
  { pattern: "mb", message: "At the end of some words, the b in mb is silent." },
  { pattern: "dge", message: "The letters dge can represent the /j/ sound at the end of a word." },
  { pattern: "tch", message: "The letters tch can represent the /ch/ sound." },
  { pattern: "ck", message: "Notice the ck spelling for the /k/ sound." },
  { pattern: "ai", message: "Notice the vowel team ai." },
  { pattern: "ay", message: "Notice the vowel team ay." },
  { pattern: "ee", message: "Notice the vowel team ee." },
  { pattern: "ea", message: "Notice the vowel team ea." },
  { pattern: "oa", message: "Notice the vowel team oa." },
  { pattern: "oi", message: "Notice the vowel team oi." },
  { pattern: "oy", message: "Notice the vowel team oy." },
  { pattern: "ou", message: "Notice the vowel team ou." },
  { pattern: "ow", message: "Notice the spelling pattern ow." },
  { pattern: "ar", message: "Notice the r-controlled vowel pattern ar." },
  { pattern: "er", message: "Notice the r-controlled vowel pattern er." },
  { pattern: "ir", message: "Notice the r-controlled vowel pattern ir." },
  { pattern: "ur", message: "Notice the r-controlled vowel pattern ur." }
];


const CONTRACTIONS = {
  "can't": "can + not",
  "couldn't": "could + not",
  "didn't": "did + not",
  "doesn't": "does + not",
  "don't": "do + not",
  "hasn't": "has + not",
  "haven't": "have + not",
  "isn't": "is + not",
  "shouldn't": "should + not",
  "wasn't": "was + not",
  "weren't": "were + not",
  "won't": "will + not",
  "wouldn't": "would + not",
  "i'm": "I + am",
  "i'll": "I + will",
  "i've": "I + have",
  "he's": "he + is",
  "she's": "she + is",
  "it's": "it + is",
  "we're": "we + are",
  "they're": "they + are",
  "you're": "you + are",
  "o'clock": "of the clock"
};


const COMPOUND_WORDS = {
  railroad: ["rail", "road"],
  playground: ["play", "ground"],
  classroom: ["class", "room"],
  birthday: ["birth", "day"],
  sunshine: ["sun", "shine"],
  football: ["foot", "ball"],
  basketball: ["basket", "ball"],
  notebook: ["note", "book"],
  bedroom: ["bed", "room"],
  bathroom: ["bath", "room"],
  backpack: ["back", "pack"],
  homework: ["home", "work"],
  afternoon: ["after", "noon"],
  something: ["some", "thing"],
  everyone: ["every", "one"],
  everything: ["every", "thing"],
  outside: ["out", "side"],
  inside: ["in", "side"],
  without: ["with", "out"]
};


function getHelpers(rawWord) {
  const word = normalizeWord(rawWord);

  if (SPELLING_OVERRIDES[word]) {
    return SPELLING_OVERRIDES[word];
  }

  const helpers = [];

  addContractionHelper(word, helpers);
  addCompoundHelper(word, helpers);
  addPluralHelpers(word, helpers);
  addInflectionHelpers(word, helpers);
  addPrefixHelper(word, helpers);
  addSuffixHelper(word, helpers);
  addCanadianHelper(word, helpers);
  addPatternHelpers(word, helpers);
  addFinalEHelper(word, helpers);

  const unique = removeDuplicateHelpers(helpers);

  if (unique.length > 0) {
    return unique.slice(0, 4);
  }

  return createGenericHelpers(word);
}


function getPrimaryPattern(rawWord) {
  const word = normalizeWord(rawWord);

  if (CONTRACTIONS[word] || word.includes("'")) {
    return "Contractions";
  }

  if (COMPOUND_WORDS[word]) {
    return "Compound words";
  }

  if (word.endsWith("ies")) {
    return "Plural changes";
  }

  if (CANADIAN_SPELLINGS[word]) {
    return "Canadian spelling";
  }

  for (const item of PREFIXES) {
    if (word.startsWith(item.prefix) && word.length >= item.prefix.length + 4) {
      return "Prefixes";
    }
  }

  const sortedSuffixes = [...SUFFIXES]
    .sort((a, b) => b.suffix.length - a.suffix.length);

  for (const item of sortedSuffixes) {
    if (word.endsWith(item.suffix) && word.length >= item.suffix.length + 3) {
      return "Suffixes and endings";
    }
  }

  for (const item of SPELLING_PATTERNS) {
    if (word.includes(item.pattern)) {
      return "Spelling patterns";
    }
  }

  if (word.endsWith("e") && word.length >= 4) {
    return "Final-e words";
  }

  return "Tricky or mixed words";
}


function addContractionHelper(word, helpers) {
  if (CONTRACTIONS[word]) {
    helpers.push({
      title: "Contraction",
      text: `${word} comes from ${CONTRACTIONS[word]}.`
    });

    helpers.push({
      title: "Apostrophe",
      text: "The apostrophe marks letters that have been left out."
    });

    return;
  }

  if (word.includes("'")) {
    helpers.push({
      title: "Apostrophe",
      text: "This word contains an apostrophe. Look carefully at where it belongs."
    });
  }
}


function addCompoundHelper(word, helpers) {
  const parts = COMPOUND_WORDS[word];

  if (!parts) {
    return;
  }

  helpers.push({
    title: "Compound word",
    text: `${word} is made from two smaller words.`
  });

  helpers.push({
    title: "Build the word",
    text: `${parts[0]} + ${parts[1]} = ${word}`
  });
}


function addPluralHelpers(word, helpers) {
  if (word.endsWith("ies") && word.length > 4) {
    const singular = word.slice(0, -3) + "y";

    helpers.push({
      title: "Plural pattern",
      text: `Think of the singular word ${singular}.`
    });

    helpers.push({
      title: "Change the ending",
      text: `${singular} → ${word}: change y to i and add es.`
    });

    return;
  }

  if (word.endsWith("es") && /(?:s|x|z|ch|sh)es$/.test(word)) {
    helpers.push({
      title: "Plural ending",
      text: "Words ending in s, x, z, ch, or sh often add es to form the plural."
    });
  }
}


function addInflectionHelpers(word, helpers) {
  if (word.endsWith("ied") && word.length > 4) {
    const base = word.slice(0, -3) + "y";

    helpers.push({
      title: "Past-tense pattern",
      text: `Think of the base word ${base}.`
    });

    helpers.push({
      title: "Change the ending",
      text: `${base} → ${word}: change y to i before adding ed.`
    });

    return;
  }

  if (word.endsWith("ing") && word.length > 5) {
    helpers.push({
      title: "Ending",
      text: "Notice the action ending -ing."
    });
  }

  if (word.endsWith("ed") && word.length > 4) {
    helpers.push({
      title: "Ending",
      text: "Notice the past-tense ending -ed."
    });
  }
}


function addPrefixHelper(word, helpers) {
  for (const item of PREFIXES) {
    const prefix = item.prefix;

    if (word.startsWith(prefix) && word.length >= prefix.length + 4) {
      const remainder = word.slice(prefix.length);

      helpers.push({
        title: "Prefix",
        text: `Break the beginning apart: ${prefix} + ${remainder}.`
      });

      helpers.push({
        title: "Meaning clue",
        text: `The prefix ${prefix}- can mean ${item.meaning}.`
      });

      return;
    }
  }
}


function addSuffixHelper(word, helpers) {
  const sorted = [...SUFFIXES]
    .sort((a, b) => b.suffix.length - a.suffix.length);

  for (const item of sorted) {
    const suffix = item.suffix;

    if (word.endsWith(suffix) && word.length >= suffix.length + 3) {
      const base = word.slice(0, -suffix.length);

      helpers.push({
        title: "Suffix",
        text: `Look at the ending: ${base} + ${suffix}.`
      });

      helpers.push({
        title: "Word part",
        text: `-${suffix} ${item.description}.`
      });

      return;
    }
  }
}


function addCanadianHelper(word, helpers) {
  if (!CANADIAN_SPELLINGS[word]) {
    return;
  }

  helpers.push({
    title: "Canadian spelling",
    text: CANADIAN_SPELLINGS[word]
  });
}


function addPatternHelpers(word, helpers) {
  let count = 0;

  for (const item of SPELLING_PATTERNS) {
    if (word.includes(item.pattern)) {
      helpers.push({
        title: "Spelling pattern",
        text: item.message
      });

      count++;

      if (count >= 2) {
        return;
      }
    }
  }
}


function addFinalEHelper(word, helpers) {
  if (word.length < 4 || !word.endsWith("e")) {
    return;
  }

  helpers.push({
    title: "Look at the ending",
    text: "Notice the final e. Compare how the word looks with and without it."
  });
}


function createGenericHelpers(word) {
  return [
    {
      title: "Say it slowly",
      text: "Say the word slowly and listen for parts you recognize."
    },
    {
      title: "Find a chunk",
      text: "Look for a familiar group of letters inside the word."
    },
    {
      title: "Look, cover, spell",
      text: `Look carefully at ${word}. Cover it, then try spelling it from memory.`
    },
    {
      title: "Check",
      text: "Compare your spelling with the word. Look only at the part that was different."
    }
  ];
}


function normalizeWord(word) {
  return word
    .trim()
    .toLocaleLowerCase("en-CA")
    .replace(/’/g, "'");
}


function removeDuplicateHelpers(helpers) {
  const seen = new Set();

  return helpers.filter(helper => {
    const key = `${helper.title}|${helper.text}`.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
