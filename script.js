const games = {
  match: {
    title: "Word Match", category: "Vocabulary", total: 8,
    items: [
      ["borrow", "to take and use something and return it later"],
      ["improve", "to become better"],
      ["crowded", "full of people"],
      ["choice", "an option you can choose"],
      ["quiet", "with very little noise"],
      ["journey", "a trip from one place to another"],
      ["prepare", "to get ready for something"],
      ["although", "despite the fact that"]
    ]
  },
  choice: {
    title: "Pick the Right One", category: "Grammar", total: 10,
    items: [
      ["I ___ to school every day.", ["go", "am going", "went", "have gone"], 0, "Use the present simple for routines."],
      ["She has lived here ___ 2022.", ["for", "since", "from", "during"], 1, "Use “since” with a starting point."],
      ["If it rains, we ___ at home.", ["stay", "will stay", "stayed", "staying"], 1, "First conditional: if + present, will + verb."],
      ["This book is ___ than the last one.", ["interesting", "more interesting", "most interesting", "interest"], 1, "Use “more” with longer adjectives."],
      ["We ___ dinner when he called.", ["have", "were having", "are having", "had"], 1, "Past continuous describes an action in progress."],
      ["You ___ wear a seat belt in a car.", ["must", "might", "could", "would"], 0, "“Must” expresses a strong rule or obligation."],
      ["I haven't finished my homework ___.", ["already", "yet", "still", "ever"], 1, "“Yet” is common in negatives and questions."],
      ["He is good ___ solving problems.", ["at", "in", "on", "for"], 0, "The fixed expression is “good at”."],
      ["There aren't ___ apples left.", ["much", "many", "a lot", "little"], 1, "Use “many” with countable plural nouns."],
      ["By next year, I ___ English for five years.", ["study", "will have studied", "studied", "am studying"], 1, "Future perfect describes an action completed by a future time."]
    ]
  },
  build: {
    title: "Build It", category: "Sentences", total: 7,
    items: [
      ["I / usually / drink / coffee / in the morning"],
      ["She / has / never / been / to London"],
      ["We / were / watching / a film / when / you called"],
      ["If / I / have time / I / will / help you"],
      ["He / is / interested / in / learning / languages"],
      ["They / went / to the beach / because / it / was sunny"],
      ["I / think / this / is / the best / idea"]
    ]
  },
  spell: {
    title: "Spell Sprint", category: "Spelling", total: 8,
    items: [
      ["environment"], ["necessary"], ["comfortable"], ["experience"],
      ["successful"], ["different"], ["interesting"], ["especially"]
    ]
  }
};

let state = {
  xp: Number(localStorage.getItem("levXp") || 0),
  streak: Number(localStorage.getItem("levStreak") || 0),
  gameKey: null, round: 0, score: 0, correct: 0,
  answer: [], spellAttempts: 0
};

const $ = (id) => document.getElementById(id);
const screens = {
  home: $("homeScreen"), game: $("gameScreen"), result: $("resultScreen")
};

function persist() {
  localStorage.setItem("levXp", state.xp);
  localStorage.setItem("levStreak", state.streak);
  updateHeader();
}

function updateHeader() {
  $("xpValue").textContent = state.xp;
  $("streakValue").textContent = `${state.streak}🔥`;
  const daily = Math.min(state.xp % 100, 100);
  $("progressFill").style.width = `${daily}%`;
  $("progressText").textContent = `${daily} / 100 XP`;
}

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo({top:0, behavior:"smooth"});
}

function showHome() {
  showScreen("home");
  updateHeader();
}

function startGame(key) {
  state.gameKey = key;
  state.round = 0;
  state.score = 0;
  state.correct = 0;
  state.answer = [];
  state.spellAttempts = 0;

  const game = games[key];
  $("gameCategory").textContent = game.category;
  $("gameTitle").textContent = game.title;
  $("gameScore").textContent = "0 XP";
  $("feedback").className = "";
  $("feedback").innerHTML = "";
  showScreen("game");
  renderRound();
}

function renderRound() {
  const game = games[state.gameKey];
  const item = game.items[state.round];
  $("roundLabel").textContent = `Round ${state.round + 1} / ${game.total}`;
  $("roundFill").style.width = `${((state.round) / game.total) * 100}%`;
  $("gameScore").textContent = `${state.score} XP`;
  $("feedback").className = "";
  $("feedback").innerHTML = "";

  if (state.gameKey === "match") renderMatch(item, game);
  if (state.gameKey === "choice") renderChoice(item, game);
  if (state.gameKey === "build") renderBuild(item, game);
  if (state.gameKey === "spell") renderSpell(item, game);
}

function renderMatch(item, game) {
  const currentWord = item[0];
  const currentMeaning = item[1];
  const distractors = game.items.filter(x => x[0] !== currentWord)
    .sort(() => Math.random() - .5).slice(0, 3).map(x => x[1]);
  const options = [currentMeaning, ...distractors].sort(() => Math.random() - .5);
  $("gameContent").innerHTML = `
    <div class="center-box">
      <div class="question">What does <span style="color:#aebcff">${currentWord}</span> mean?</div>
      <div class="options">
        ${options.map((x,i)=>`<button class="option" data-value="${escapeHtml(x)}">${x}</button>`).join("")}
      </div>
    </div>`;
  [...document.querySelectorAll(".option")].forEach(btn => {
    btn.onclick = () => handleMatch(btn, btn.dataset.value === currentMeaning, currentMeaning);
  });
}

function handleMatch(btn, ok, correctAnswer) {
  if (document.querySelector(".option.correct,.option.wrong")) return;
  document.querySelectorAll(".option").forEach(b=>b.disabled=true);
  btn.classList.add(ok ? "correct" : "wrong");
  if (!ok) {
    const correctBtn = [...document.querySelectorAll(".option")].find(b => b.dataset.value === correctAnswer);
    correctBtn?.classList.add("correct");
  }
  finishRound(ok, ok ? "Correct! +10 XP" : `Not quite. The answer is: ${correctAnswer}`);
}

function renderChoice(item, game) {
  const [question, options, correctIndex, hint] = item;
  $("gameContent").innerHTML = `
    <div class="center-box">
      <div class="question">${question.replace("___","<span style='color:#aebcff'>___</span>")}</div>
      <div class="options">
        ${options.map((x,i)=>`<button class="option" data-index="${i}">${x}</button>`).join("")}
      </div>
    </div>`;
  [...document.querySelectorAll(".option")].forEach(btn => {
    btn.onclick = () => {
      if (document.querySelector(".option.correct,.option.wrong")) return;
      const ok = Number(btn.dataset.index) === correctIndex;
      btn.classList.add(ok ? "correct" : "wrong");
      if (!ok) document.querySelectorAll(".option")[correctIndex].classList.add("correct");
      finishRound(ok, ok ? "Correct! +10 XP" : `Not quite. ${hint}`);
    };
  });
}

function renderBuild(item, game) {
  state.answer = [];
  const words = item[0].split(" / ").map(x=>x.trim()).sort(()=>Math.random()-.5);
  const target = item[0].split(" / ").map(x=>x.trim()).join(" ");
  $("gameContent").innerHTML = `
    <div class="center-box">
      <div class="question">Build the sentence</div>
      <div class="sub-question">Tap the words in the correct order.</div>
      <div class="answer-line" id="answerLine"><span class="answer-empty">Your sentence will appear here</span></div>
      <div class="word-bank">
        ${words.map((x,i)=>`<button class="word-chip" data-i="${i}" data-word="${escapeHtml(x)}">${x}</button>`).join("")}
      </div>
      <button class="primary-btn" id="checkBuild">Check answer</button>
    </div>`;
  [...document.querySelectorAll(".word-chip")].forEach(btn=>btn.onclick=()=>{
    if(btn.classList.contains("used")) return;
    btn.classList.add("used");
    state.answer.push(btn.dataset.word);
    updateAnswerLine();
  });
  $("checkBuild").onclick=()=>{
    if(state.answer.length === 0) return;
    const normalized = s => s.toLowerCase().replace(/[.!?,]/g,"").trim();
    const ok = normalized(state.answer.join(" ")) === normalized(target);
    finishRound(ok, ok ? "Perfect! +10 XP" : `The correct sentence is: ${target}.`);
  };
}

function updateAnswerLine(){
  const line = $("answerLine");
  line.innerHTML = state.answer.length
    ? state.answer.map((x,i)=>`<button class="answer-chip" data-pos="${i}">${x}</button>`).join("")
    : `<span class="answer-empty">Your sentence will appear here</span>`;
  [...document.querySelectorAll(".answer-chip")].forEach(ch=>ch.onclick=()=>{
    const pos=Number(ch.dataset.pos);
    const removed = state.answer.splice(pos,1)[0];
    const chips = [...document.querySelectorAll(".word-chip")];
    const unused = chips.find(b=>b.dataset.word===removed && b.classList.contains("used"));
    unused?.classList.remove("used");
    updateAnswerLine();
  });
}

function renderSpell(item, game) {
  const word = item[0];
  $("gameContent").innerHTML = `
    <div class="center-box">
      <div class="question">Listen and spell the word</div>
      <div class="sub-question">Click the speaker, then type the word you hear.</div>
      <button class="speak-btn" id="speakBtn">🔊 Hear word</button>
      <div class="input-wrap">
        <input id="spellInput" class="text-input" autocomplete="off" spellcheck="false" placeholder="Type the word..." />
        <button class="primary-btn" id="spellCheck">Check</button>
      </div>
      <div style="font-size:12px;color:#69738d">Tip: say the spelling quietly to yourself as you type.</div>
    </div>`;
  const speak = ()=>{
    if("speechSynthesis" in window){
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = "en-US";
      u.rate = .82;
      speechSynthesis.speak(u);
    } else showToast("Your browser does not support text-to-speech.");
  };
  $("speakBtn").onclick=speak;
  $("spellCheck").onclick=()=>{
    const input = $("spellInput").value.trim().toLowerCase();
    const ok = input === word.toLowerCase();
    finishRound(ok, ok ? "Excellent spelling! +10 XP" : `The correct spelling is “${word}”.`);
  };
  $("spellInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("spellCheck").click()});
  setTimeout(speak, 250);
}

function finishRound(ok, message) {
  if(ok){
    state.correct++;
    state.score += 10;
    state.xp += 10;
    state.streak++;
  } else {
    state.streak = 0;
  }
  persist();
  $("gameScore").textContent = `${state.score} XP`;
  const f=$("feedback");
  f.className = `feedback ${ok ? "ok":"no"}`;
  f.innerHTML = `${ok ? "✓":"✕"} ${message}`;
  if(state.round < games[state.gameKey].total - 1){
    f.insertAdjacentHTML("afterend",`<div class="next-wrap"><button class="primary-btn" id="nextBtn">Next →</button></div>`);
    $("nextBtn").onclick=()=>{state.round++;renderRound()};
  } else {
    $("roundFill").style.width = "100%";
    f.insertAdjacentHTML("afterend",`<div class="next-wrap"><button class="primary-btn" id="resultBtn">See results →</button></div>`);
    $("resultBtn").onclick=showResult;
  }
}

function showResult(){
  const game=games[state.gameKey];
  const pct=Math.round((state.correct/game.total)*100);
  $("resultScore").textContent=`${state.score} XP`;
  $("resultCorrect").textContent=`${pct}%`;
  $("resultXp").textContent=`+${state.score}`;
  $("resultTitle").textContent = pct >= 90 ? "Outstanding!" : pct >= 70 ? "Great job!" : "Good practice!";
  $("resultSubtitle").textContent=`You finished ${game.title}. Keep going to move from A2+ toward B1.`;
  $("resultMessage").textContent = pct >= 90
    ? "Your accuracy is strong. Try another game and challenge your vocabulary and grammar."
    : pct >= 70
      ? "Solid result. Review the mistakes and repeat the game once more."
      : "Practice is the point. Repeat this round and focus on the words you missed.";
  showScreen("result");
}

function restartCurrentGame(){ if(state.gameKey) startGame(state.gameKey); }
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
let toastTimer;
function showToast(msg){
  const t=$("toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),2200);
}

updateHeader();
