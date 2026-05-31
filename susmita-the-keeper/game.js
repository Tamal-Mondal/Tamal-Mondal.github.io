"use strict";

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  scoreText: document.querySelector("#scoreText"),
  relationshipText: document.querySelector("#relationshipText"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  toast: document.querySelector("#toast"),
  toastTitle: document.querySelector("#toastTitle"),
  toastText: document.querySelector("#toastText"),
  startOverlay: document.querySelector("#startOverlay"),
  startButton: document.querySelector("#startButton"),
  resultOverlay: document.querySelector("#resultOverlay"),
  resultEyebrow: document.querySelector("#resultEyebrow"),
  resultTitle: document.querySelector("#resultTitle"),
  resultMessage: document.querySelector("#resultMessage"),
  finalScore: document.querySelector("#finalScore"),
  finalRank: document.querySelector("#finalRank"),
  bonusText: document.querySelector("#bonusText"),
  restartButton: document.querySelector("#restartButton"),
  shareButton: document.querySelector("#shareButton"),
};

const positiveBrickTypes = [
  { label: "Food Order", points: 100, color: "#b8f7a3", detail: "Food Fixes More Than Hunger", kind: "positive" },
  { label: "Flower", points: 100, color: "#ffc2dc", detail: "Small Gestures Still Bloom", kind: "positive" },
  { label: "Good Call", points: 120, color: "#a9ddff", detail: "One Call Makes The Distance Smaller", kind: "positive" },
  { label: "Video Call", points: 140, color: "#a7f3ff", detail: "Seeing Each Other Makes Distance Softer", kind: "positive" },
  { label: "Ludo Night", points: 130, color: "#c7f4ff", detail: "A Little Game, A Lot Of Togetherness", kind: "positive" },
  { label: "Cute Text", points: 90, color: "#ffd3a8", detail: "One Message Can Save The Whole Day", kind: "positive" },
  { label: "Long Hug", points: 160, color: "#d8c7ff", detail: "Some Arguments End Best Without More Words", kind: "positive" },
  { label: "White Sauce Pasta", points: 150, color: "#fff2c6", detail: "Comfort Food, Comfort Heart", kind: "positive" },
  { label: "Cooking Together", points: 160, color: "#d9f99d", detail: "Two People, One Kitchen, Many Memories", kind: "positive" },
  { label: "Momos", points: 110, color: "#fde68a", detail: "Small Bites, Big Smiles", kind: "positive" },
  { label: "Movie Plan", points: 110, color: "#b9f6d3", detail: "A Shared Screen, A Shared Mood", kind: "positive" },
  { label: "Sorry First", points: 140, color: "#fff0a8", detail: "Love Wins When Ego Steps Back", kind: "positive" },
  { label: "Tea Break", points: 80, color: "#cce7ff", detail: "A Pause Together Is Still Progress", kind: "positive" },
];

const negativeBrickTypes = [
  { label: "Low Battery", points: -30, color: "#ff8a80", detail: "Low Energy Asks For Extra Care", kind: "negative" },
  { label: "No Data", points: -40, color: "#ff6b6b", detail: "No Signal Makes Patience Do The Talking", kind: "negative" },
  { label: "Missed Call", points: -35, color: "#ff7b72", detail: "One Missed Call Should Not Become A Whole Story", kind: "negative" },
  { label: "Busy Day", points: -30, color: "#ff9b8f", detail: "Busy Days Still Need Tiny Check-Ins", kind: "negative" },
  { label: "Mood Off", points: -45, color: "#ff6f61", detail: "Bad Moods Need Softness, Not Sparks", kind: "negative" },
  { label: "Tiny Fight", points: -50, color: "#ef4444", detail: "Tiny Fights Feel Bigger When Both Are Tired", kind: "negative" },
  { label: "Overthinking", points: -75, color: "#dc2626", detail: "Overthinking Turns Silence Into Noise", kind: "negative" },
  { label: "Distance", points: -100, color: "#b91c1c", detail: "Distance Is Harder On Heavy Days", kind: "negative" },
  { label: "Late Reply", points: -35, color: "#fb7185", detail: "Late Replies Need Trust To Stay Small", kind: "negative" },
  { label: "Sleepy Fight", points: -60, color: "#e11d48", detail: "Sleepy Fights Should Wait For Morning", kind: "negative" },
];

const immovableBrickTypes = [
  { label: "Ego Wall", points: -80, color: "#4b5563", detail: "Ego Blocks The Way Until Someone Chooses Softness", kind: "immovable" },
  { label: "Silence", points: -100, color: "#374151", detail: "Silence Can Feel Louder Than A Fight", kind: "immovable" },
  { label: "Assumption", points: -90, color: "#52525b", detail: "Assumptions Create Stories Love Never Wrote", kind: "immovable" },
  { label: "Trust Wobble", points: -150, color: "#3f3f46", detail: "Trust Needs Care, Not Panic", kind: "immovable" },
  { label: "Trust Issues", points: -140, color: "#57534e", detail: "Trust Asks For Patience, Honesty, And Repair", kind: "immovable" },
];

const brickTypes = [...positiveBrickTypes, ...negativeBrickTypes];

const scoreBudget = {
  positive: 3600,
  negative: -900,
  immovable: -520,
};

const ranks = [
  { min: 4500, label: "Keeper Hero" },
  { min: 3000, label: "Heart Rescuer" },
  { min: 2000, label: "Distance Fighter" },
  { min: 1000, label: "Problem Breaker" },
  { min: 0, label: "Cute Try" },
];

const state = {
  width: 0,
  height: 0,
  ratio: 1,
  running: false,
  won: false,
  over: false,
  score: 0,
  combo: 0,
  bestCombo: 0,
  chances: 3,
  rescueBonus: 0,
  chanceBonus: 0,
  cleared: 0,
  rescueTarget: 0,
  positiveCollected: 0,
  positiveTotal: 0,
  last: 0,
  elapsed: 0,
  rushTimer: 0,
  nextRushAt: 12,
  rushWarned: false,
  difficulty: 1,
  wallTop: 150,
  wallBottom: 360,
  fallPath: { left: 0, right: 0, top: 0, bottom: 0 },
  shake: 0,
  input: { left: false, right: false, pointer: false, pointerX: 0 },
  susmita: { x: 0, y: 0, vx: 0, width: 116, height: 22, speed: 610 },
  tamal: { x: 0, y: 0, free: false, falling: false, hug: 0 },
  ball: { x: 0, y: 0, vx: 0, vy: 0, speed: 0, horizontalTime: 0, radius: 11, attached: true },
  bricks: [],
  particles: [],
  floatingText: [],
  stars: [],
};

const palette = {
  ink: "#fff7eb",
  muted: "#c5d4e6",
  night: "#101729",
  gold: "#ffd166",
  coral: "#ff6f61",
  rose: "#f58fb0",
  mint: "#79e0b8",
  sky: "#76c7ff",
  violet: "#b9a8ff",
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const random = (min, max) => min + Math.random() * (max - min);
const randomInt = (min, max) => Math.floor(random(min, max + 1));
const isMobile = () => state.width < 760;
const mobileScale = () => (isMobile() ? 0.78 : 1);
const isProblemKind = (kind) => kind === "negative" || kind === "immovable";

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function init() {
  bindEvents();
  resize();
  resetGame();
  showToast("Ready?", "Collect Care, Clear Problems, And Protect The Relationship.", 3600);
  requestAnimationFrame(loop);
}

function bindEvents() {
  window.addEventListener("resize", resize);

  ui.startButton.addEventListener("click", () => {
    ui.startOverlay.classList.remove("overlay--visible");
    startGame();
  });

  ui.restartButton.addEventListener("click", () => {
    ui.resultOverlay.classList.remove("overlay--visible");
    resetGame();
    startGame();
  });

  ui.shareButton.addEventListener("click", copyScore);

  window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "a", "d", " "].includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") state.input.left = true;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") state.input.right = true;
    if (event.key === " ") launchBall();
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") state.input.left = false;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") state.input.right = false;
  });

  canvas.addEventListener("pointerdown", (event) => {
    const rect = canvas.getBoundingClientRect();
    state.input.pointer = true;
    state.input.pointerX = event.clientX - rect.left;
    launchBall();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.input.pointer) return;
    const rect = canvas.getBoundingClientRect();
    state.input.pointerX = event.clientX - rect.left;
  });

  canvas.addEventListener("pointerup", () => {
    state.input.pointer = false;
  });

  canvas.addEventListener("pointercancel", () => {
    state.input.pointer = false;
  });

}

function resize() {
  state.ratio = Math.min(window.devicePixelRatio || 1, 2);
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * state.ratio);
  canvas.height = Math.floor(state.height * state.ratio);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);

  state.susmita.width = isMobile() ? clamp(state.width * 0.22, 78, 104) : clamp(state.width * 0.28, 96, 146);
  state.susmita.height = isMobile() ? 16 : 22;
  state.ball.radius = isMobile() ? 9 : 11;
  state.susmita.x = clamp(state.susmita.x || state.width / 2, state.susmita.width / 2 + 12, state.width - state.susmita.width / 2 - 12);
  state.susmita.y = state.height - (isMobile() ? 68 : 82);
  if (!state.bricks.length) {
    state.tamal.x = state.width / 2;
    state.tamal.y = Math.max(162, state.height * 0.22);
  }
  makeStars();

  if (!state.running) {
    state.ball.x = state.susmita.x;
    state.ball.y = state.susmita.y - 24;
  }
}

function makeStars() {
  state.stars = Array.from({ length: 70 }, () => ({
    x: random(0, state.width),
    y: random(0, state.height),
    size: random(0.7, 2.4),
    pulse: random(0, Math.PI * 2),
    color: [palette.gold, palette.sky, palette.rose, palette.mint][Math.floor(random(0, 4))],
  }));
}

function resetGame() {
  state.running = false;
  state.won = false;
  state.over = false;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.chances = 3;
  state.rescueBonus = 0;
  state.chanceBonus = 0;
  state.cleared = 0;
  state.positiveCollected = 0;
  state.positiveTotal = 0;
  state.elapsed = 0;
  state.rushTimer = 0;
  state.rushWarned = false;
  state.difficulty = random(0.96, 1.14);
  state.nextRushAt = random(5.8, 10.5) / state.difficulty;
  state.shake = 0;
  state.tamal.free = false;
  state.tamal.falling = false;
  state.tamal.hug = 0;
  state.susmita.x = state.width / 2;
  state.susmita.vx = 0;
  state.ball.attached = true;
  state.ball.x = state.susmita.x;
  state.ball.y = state.susmita.y - 24;
  state.ball.vx = 0;
  state.ball.vy = 0;
  state.ball.speed = 0;
  state.ball.horizontalTime = 0;
  state.bricks = buildBricks();
  state.rescueTarget = getPathBricks().length;
  state.positiveTotal = getTotalPositivePoints();
  state.particles = [];
  state.floatingText = [];
  updateUi();
}

function getPathBricks() {
  return state.bricks.filter((brick) => brick.pathBlocker);
}

function getTotalPositivePoints() {
  return state.bricks.reduce((total, brick) => {
    return brick.type.kind === "positive" ? total + brick.type.points : total;
  }, 0);
}

function buildBricks() {
  const baseColumns = state.width < 420 ? 6 : state.width < 720 ? 7 : 9;
  const columns = clamp(baseColumns + randomInt(0, 1), state.width < 420 ? 6 : 7, state.width < 720 ? 8 : 10);
  const rows = state.width < 420 ? randomInt(11, 12) : state.width < 720 ? randomInt(10, 11) : randomInt(8, 10);
  const gap = isMobile() ? randomInt(3, 4) : randomInt(4, 6);
  const side = isMobile() ? 10 : 16;
  const minTop = isMobile() ? 126 : 112;
  const top = Math.max(minTop, state.height * random(0.13, 0.15));
  const unitWidth = (state.width - side * 2 - gap * (columns - 1)) / columns;
  const baseHeight = isMobile()
    ? clamp(state.height * random(0.028, 0.034), 20, 28)
    : clamp(state.height * random(0.036, 0.044), 28, 40);
  const bricks = [];
  const totalSlots = columns * rows;
  const typeBag = makeBrickTypeBag(totalSlots);
  const cage = makeCageLayout(columns, side, unitWidth, gap, top, baseHeight);
  const columnProblemStreaks = Array(columns).fill(0);
  state.wallTop = top;
  state.wallBottom = top + rows * baseHeight + (rows - 1) * gap;
  state.tamal.x = cage.centerX;
  state.tamal.y = cage.centerY;
  state.fallPath = {
    left: cage.left + unitWidth * 0.12,
    right: cage.right - unitWidth * 0.12,
    top: cage.centerY + (isMobile() ? 44 : 58),
    bottom: state.wallBottom + baseHeight * 0.2,
  };

  for (let row = 0; row < rows; row += 1) {
    const rowLean = random(-unitWidth * 0.05, unitWidth * 0.05);
    let col = 0;

    while (col < columns) {
      const isEdge = col === 0 || col === columns - 1;
      const canSkip = row > 0 && row < rows - 1 && !isEdge;
      const slotsLeft = (rows - row) * columns - col;

      if (isCagePocket(row, col, cage)) {
        columnProblemStreaks[col] = 0;
        col += 1;
        continue;
      }

      if (canSkip && typeBag.length < slotsLeft - 2 && Math.random() < 0.07) {
        columnProblemStreaks[col] = 0;
        col += 1;
        continue;
      }

      const remaining = columns - col;
      const cageRequired = isCageRequiredSlot(row, col, cage);
      const pathSlot = isFallPathSlot(row, col, cage);
      const sideRisk = isSideRiskSlot(col, cage);
      const nearCenter = !sideRisk && !pathSlot && !cageRequired;
      const canSpan = !pathSlot && !cageRequired && remaining > 1 && !isEdge && typeBag.length < slotsLeft && Math.random() < 0.24;
      const span = canSpan ? randomInt(1, Math.min(2, remaining)) : 1;
      const problemStreak = getMaxProblemStreak(columnProblemStreaks, col, span);
      let type = takeTypeForSlot(typeBag, { row, pathSlot, cageRequired, sideRisk, nearCenter, problemStreak });

      if (!type) {
        col += span;
        continue;
      }

      if ((pathSlot || cageRequired) && type.kind === "immovable") {
        type = takeBreakableType(typeBag);
      }

      const immovable = type.kind === "immovable";
      const isSupport = type.kind === "positive";
      const hardBrick = !immovable && Math.abs(type.points) >= 75 && Math.random() < 0.34 * state.difficulty;
      const bossBrick = !immovable && Math.abs(type.points) >= 120 && row < 2 && Math.random() < 0.14 * state.difficulty;
      const toughness = immovable ? 0 : bossBrick ? 3 : hardBrick ? 2 : 1;
      const width = unitWidth * span + gap * (span - 1) + random(-3, 5);
      const height = baseHeight * random(0.84, immovable ? 0.98 : 1.12);
      const x = side + col * (unitWidth + gap) + rowLean + random(-2.5, 2.5);

      bricks.push({
        x: clamp(x, side, state.width - side - width),
        y: top + row * (baseHeight + gap) + random(-2, 2),
        width,
        height,
        type,
        hp: toughness,
        maxHp: toughness,
        support: isSupport,
        immovable,
        pathBlocker: pathSlot && !immovable,
        alive: true,
        lastPenaltyAt: -10,
        wobble: random(0, Math.PI * 2),
      });

      updateColumnProblemStreaks(columnProblemStreaks, col, span, type.kind);
      col += span;
    }
  }

  return bricks;
}

function makeCageLayout(columns, side, unitWidth, gap, top, baseHeight) {
  const pocketWidth = columns <= 5 ? 2 : 2;
  const pocketStart = clamp(Math.floor((columns - pocketWidth) / 2), 1, columns - pocketWidth - 1);
  const pocketEnd = pocketStart + pocketWidth - 1;
  const left = side + pocketStart * (unitWidth + gap);
  const right = side + (pocketEnd + 1) * unitWidth + pocketEnd * gap;

  return {
    pocketStart,
    pocketEnd,
    pocketRows: 2,
    requiredMaxRow: 3,
    left,
    right,
    centerX: (left + right) / 2,
    centerY: top + baseHeight * 0.88,
  };
}

function isCagePocket(row, col, cage) {
  return row < cage.pocketRows && col >= cage.pocketStart && col <= cage.pocketEnd;
}

function isCageRequiredSlot(row, col, cage) {
  const nearPocket = col >= cage.pocketStart - 1 && col <= cage.pocketEnd + 1;
  const underPocket = row >= cage.pocketRows && col >= cage.pocketStart && col <= cage.pocketEnd;
  const topSideCage = row <= cage.requiredMaxRow && nearPocket && (row < cage.pocketRows || col === cage.pocketStart - 1 || col === cage.pocketEnd + 1);
  return !isCagePocket(row, col, cage) && (underPocket || topSideCage);
}

function isFallPathSlot(row, col, cage) {
  return row >= cage.pocketRows && col >= cage.pocketStart && col <= cage.pocketEnd;
}

function isSideRiskSlot(col, cage) {
  return col < cage.pocketStart - 1 || col > cage.pocketEnd + 1;
}

function getMaxProblemStreak(streaks, col, span) {
  let max = 0;

  for (let offset = 0; offset < span; offset += 1) {
    max = Math.max(max, streaks[col + offset] || 0);
  }

  return max;
}

function updateColumnProblemStreaks(streaks, col, span, kind) {
  const next = isProblemKind(kind) ? 1 : 0;

  for (let offset = 0; offset < span; offset += 1) {
    streaks[col + offset] = next ? (streaks[col + offset] || 0) + 1 : 0;
  }
}

function takeTypeForSlot(typeBag, { row, pathSlot, cageRequired, sideRisk, nearCenter, problemStreak }) {
  if (row <= 1 && !sideRisk && Math.random() < 0.74) {
    const topReward = takeTopRewardType(typeBag);

    if (topReward) return topReward;
  }

  if (pathSlot) {
    return takeBreakableType(typeBag);
  }

  if (cageRequired) {
    return takeBreakableType(typeBag);
  }

  if (sideRisk) {
    if (problemStreak > 0) {
      const positiveBreak = takeTypeByKinds(typeBag, ["positive"]);

      if (positiveBreak) return positiveBreak;
    }

    const roll = Math.random();
    const balancedSideType =
      roll < 0.68
        ? takeTypeByKinds(typeBag, ["positive"])
        : roll < 0.92
          ? takeTypeByKinds(typeBag, ["negative"])
          : takeTypeByKinds(typeBag, ["immovable"]);

    if (balancedSideType) return balancedSideType;
  }

  if (nearCenter && row > 2 && Math.random() < 0.34) {
    const centerProblem = takeTypeByKinds(typeBag, ["negative", "immovable"]);

    if (centerProblem) return centerProblem;
  }

  return typeBag.pop();
}

function takeTypeByKinds(typeBag, kinds) {
  const index = typeBag.findIndex((type) => kinds.includes(type.kind));

  if (index < 0) return null;

  const [type] = typeBag.splice(index, 1);
  return type;
}

function takeTopRewardType(typeBag) {
  const index = typeBag.findIndex((type) => type.kind === "positive" && type.points >= 120);

  if (index >= 0) {
    const [type] = typeBag.splice(index, 1);
    return type;
  }

  const fallbackIndex = typeBag.findIndex((type) => type.kind === "positive");

  if (fallbackIndex >= 0) {
    const [type] = typeBag.splice(fallbackIndex, 1);
    return type;
  }

  return null;
}

function takeBreakableType(typeBag) {
  const index = typeBag.findIndex((type) => type.kind !== "immovable");

  if (index >= 0) {
    const [type] = typeBag.splice(index, 1);
    return type;
  }

  const pool = Math.random() < 0.58 ? positiveBrickTypes : negativeBrickTypes;
  return pool[Math.floor(random(0, pool.length))];
}

function makeBrickTypeBag(totalSlots) {
  const targetSlots = state.width < 420 ? 58 : state.width < 720 ? 62 : 64;
  const playableSlots = Math.min(totalSlots, targetSlots + randomInt(-2, 2));
  const immovableCount = clamp(Math.round(playableSlots * 0.12), 3, 5);
  const breakableCount = playableSlots - immovableCount;
  const positiveCount = Math.round(breakableCount * 0.58);
  const negativeCount = breakableCount - positiveCount;
  const positives = makeBudgetedTypes(positiveBrickTypes, positiveCount, scoreBudget.positive);
  const negatives = makeBudgetedTypes(negativeBrickTypes, negativeCount, scoreBudget.negative);
  const immovables = makeBudgetedTypes(immovableBrickTypes, immovableCount, scoreBudget.immovable);

  return shuffle([...positives, ...negatives, ...immovables]);
}

function makeBudgetedTypes(pool, count, totalPoints) {
  if (count <= 0) return [];

  const signs = Math.sign(totalPoints) || 1;
  const average = Math.abs(totalPoints) / count;
  const min = Math.max(10, Math.floor((average * 0.62) / 5) * 5);
  const max = Math.max(min + 10, Math.ceil((average * 1.42) / 5) * 5);
  const selected = Array.from({ length: count }, () => ({ ...pool[Math.floor(random(0, pool.length))] }));

  selected.forEach((type) => {
    type.points = signs * (Math.round(random(min, max) / 5) * 5);
  });

  balanceBudgetedPoints(selected, totalPoints, min, max, signs);

  return shuffle(selected);
}

function balanceBudgetedPoints(types, targetTotal, min, max, signs) {
  let guard = 0;

  while (types.reduce((sum, type) => sum + type.points, 0) !== targetTotal && guard < 5000) {
    const currentTotal = types.reduce((sum, type) => sum + type.points, 0);
    const needsMore = signs > 0 ? currentTotal < targetTotal : currentTotal > targetTotal;
    const candidates = types.filter((type) => {
      const abs = Math.abs(type.points);
      return needsMore ? abs < max : abs > min;
    });
    const type = candidates[Math.floor(random(0, candidates.length))] || types[0];
    type.points += signs * (needsMore ? 5 : -5);
    guard += 1;
  }
}

function startGame() {
  if (state.over) return;
  state.running = true;
  state.last = performance.now();
  showToast("Go Susmita", "Tap Or Press Space To Release The Heart-Ball.", 2800);
}

function launchBall() {
  if (!state.running || state.won || state.over || !state.ball.attached) return;

  const direction = random(-0.48, 0.48);
  const speed = currentSpeed();
  state.ball.attached = false;
  state.ball.speed = speed;
  state.ball.horizontalTime = 0;
  state.ball.vx = direction * speed;
  state.ball.vy = -speed;
  state.combo = 0;
}

function loop(now) {
  const dt = Math.min((now - state.last) / 1000 || 0, 0.025);
  state.last = now;

  if (state.running && !state.over) update(dt);
  draw();
  requestAnimationFrame(loop);
}

function update(dt) {
  state.elapsed += dt;
  state.shake = Math.max(0, state.shake - dt * 18);
  updateRush(dt);
  updateSusmita(dt);
  updateBall(dt);
  updateParticles(dt);
  updateFloatingText(dt);
  updateRescue(dt);
  updateUi();
}

function updateRush(dt) {
  if (state.rushTimer > 0) {
    state.rushTimer -= dt;
    return;
  }

  if (
    !state.rushWarned &&
    state.elapsed > state.nextRushAt - 1.4 &&
    !state.ball.attached &&
    !state.tamal.falling
  ) {
    state.rushWarned = true;
    showToast("Rush Zone", "Speed Burst Incoming. Stay With The Heart.", 1300);
  }

  if (state.elapsed > state.nextRushAt && !state.ball.attached && !state.tamal.falling) {
    state.rushTimer = random(2.2, 3.4);
    state.nextRushAt = state.elapsed + random(6.5, 10.5);
    state.rushWarned = false;
    showToast("Rush Burst", "The Day Got Chaotic. Hold Steady.", 1600);
  }
}

function currentSpeed() {
  const base = (470 + Math.min(230, state.elapsed * 7.8)) * state.difficulty;
  return state.rushTimer > 0 ? base * 1.56 : base;
}

function updateSusmita(dt) {
  let target = 0;
  if (state.input.left) target -= 1;
  if (state.input.right) target += 1;

  const rushAssist = state.rushTimer > 0 ? 1.36 : 1;
  const maxSpeed = state.susmita.speed * rushAssist;
  let desiredVelocity = target * maxSpeed;

  if (state.input.pointer) {
    const pointerTarget = clamp(
      state.input.pointerX,
      state.susmita.width / 2 + 12,
      state.width - state.susmita.width / 2 - 12,
    );
    desiredVelocity = clamp((pointerTarget - state.susmita.x) * 10.5, -maxSpeed, maxSpeed);
  }

  const easing = target || state.input.pointer ? 15 : 20;
  state.susmita.vx = lerp(state.susmita.vx, desiredVelocity, clamp(dt * easing, 0, 1));
  if (!target && !state.input.pointer && Math.abs(state.susmita.vx) < 6) {
    state.susmita.vx = 0;
  }
  state.susmita.x += state.susmita.vx * dt;

  state.susmita.x = clamp(
    state.susmita.x,
    state.susmita.width / 2 + 12,
    state.width - state.susmita.width / 2 - 12,
  );

  if (
    (state.susmita.x <= state.susmita.width / 2 + 12 && state.susmita.vx < 0) ||
    (state.susmita.x >= state.width - state.susmita.width / 2 - 12 && state.susmita.vx > 0)
  ) {
    state.susmita.vx = 0;
  }

  if (state.ball.attached) {
    state.ball.x = state.susmita.x;
    state.ball.y = state.susmita.y - 25;
  }
}

function updateBall(dt) {
  const ball = state.ball;
  if (ball.attached || state.tamal.falling) return;

  const speed = currentSpeed();
  const easedSpeed = updateBallSpeed(dt, speed);
  normalizeBallVelocity(easedSpeed);
  preventHorizontalStall(dt);
  const steps = Math.max(1, Math.ceil((easedSpeed * dt) / 5));
  const stepDt = dt / steps;

  for (let step = 0; step < steps; step += 1) {
    ball.x += ball.vx * stepDt;
    ball.y += ball.vy * stepDt;

    if (ball.x < ball.radius) {
      ball.x = ball.radius;
      ball.vx = Math.abs(ball.vx);
    }

    if (ball.x > state.width - ball.radius) {
      ball.x = state.width - ball.radius;
      ball.vx = -Math.abs(ball.vx);
    }

    const topLimit = Math.max(ball.radius + 96, state.wallTop - ball.radius - 6);
    if (ball.y < topLimit) {
      ball.y = topLimit;
      ball.vy = Math.abs(ball.vy);
    }

    let hitCount = 0;
    while (hitCount < 2 && collideWithBricks()) {
      hitCount += 1;
    }

    collideWithSusmita();

    if (ball.y > state.height + 40) {
      loseChance();
      break;
    }
  }

  normalizeBallVelocity(state.ball.speed || easedSpeed);
  preventHorizontalStall(dt);
}

function updateBallSpeed(dt, targetSpeed) {
  const ball = state.ball;
  const current = ball.speed || Math.hypot(ball.vx, ball.vy) || targetSpeed;
  const ramp = targetSpeed > current ? 4.4 : 3.2;
  ball.speed = lerp(current, targetSpeed, clamp(dt * ramp, 0, 1));
  return ball.speed;
}

function normalizeBallVelocity(speed) {
  const ball = state.ball;
  const length = Math.hypot(ball.vx, ball.vy) || 1;
  ball.vx = (ball.vx / length) * speed;
  ball.vy = (ball.vy / length) * speed;
}

function preventHorizontalStall(dt) {
  const ball = state.ball;
  const speed = Math.hypot(ball.vx, ball.vy) || currentSpeed();
  const minVertical = speed * 0.4;
  const nearlyHorizontal = Math.abs(ball.vy) < speed * 0.32;
  ball.horizontalTime = nearlyHorizontal ? ball.horizontalTime + dt : 0;

  if (Math.abs(ball.vy) >= minVertical && ball.horizontalTime < 0.3) return;

  const needsDownwardNudge = ball.horizontalTime > 0.26 && ball.y < state.susmita.y - 44;
  const direction = needsDownwardNudge ? 1 : ball.vy < 0 ? -1 : 1;
  const desiredVy = direction * minVertical;
  ball.vy = lerp(ball.vy, desiredVy, clamp(dt * 5.5, 0.05, 0.24));

  const xDirection = ball.vx < 0 ? -1 : 1;
  ball.vy = clamp(ball.vy, -speed * 0.88, speed * 0.88);
  ball.vx = xDirection * Math.sqrt(Math.max(speed * speed - ball.vy * ball.vy, speed * speed * 0.2));
}

function collideWithSusmita() {
  const ball = state.ball;
  const paddle = state.susmita;
  const top = paddle.y - paddle.height / 2;
  const left = paddle.x - paddle.width / 2;
  const right = paddle.x + paddle.width / 2;

  if (
    ball.vy > 0 &&
    ball.y + ball.radius >= top &&
    ball.y - ball.radius <= paddle.y + paddle.height / 2 &&
    ball.x >= left - ball.radius &&
    ball.x <= right + ball.radius
  ) {
    const offset = (ball.x - paddle.x) / (paddle.width / 2);
    const speed = state.ball.speed || currentSpeed();
    state.ball.speed = speed;
    state.ball.horizontalTime = 0;
    ball.y = top - ball.radius;
    ball.vx = offset * speed * 0.74;
    ball.vy = -Math.sqrt(Math.max(speed * speed - ball.vx * ball.vx, speed * speed * 0.42));

    if (state.combo > 1) {
      const comboBonus = state.combo * 50;
      state.score += comboBonus;
      addFloatingText(`Combo +${comboBonus}`, ball.x, ball.y - 20, palette.gold);
      showToast("Combo Kept", `${state.combo} Problems In One Run. +${comboBonus}`, 1400);
    }

    state.combo = 0;
    burst(ball.x, ball.y, palette.gold, 12);
  }
}

function collideWithBricks() {
  const ball = state.ball;

  for (const brick of state.bricks) {
    if (!brick.alive) continue;

    const closestX = clamp(ball.x, brick.x, brick.x + brick.width);
    const closestY = clamp(ball.y, brick.y, brick.y + brick.height);
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;

    if (dx * dx + dy * dy > ball.radius * ball.radius) continue;

    resolveBrickBounce(brick, closestX, closestY, dx, dy);
    handleBrickHit(brick);
    return true;
  }

  return false;
}

function resolveBrickBounce(brick, closestX, closestY, dx, dy) {
  const ball = state.ball;
  let normalX = dx;
  let normalY = dy;
  let distance = Math.hypot(normalX, normalY);

  if (distance < 0.001) {
    const left = Math.abs(ball.x - brick.x);
    const right = Math.abs(brick.x + brick.width - ball.x);
    const top = Math.abs(ball.y - brick.y);
    const bottom = Math.abs(brick.y + brick.height - ball.y);
    const min = Math.min(left, right, top, bottom);

    if (min === left) {
      normalX = -1;
      normalY = 0;
    } else if (min === right) {
      normalX = 1;
      normalY = 0;
    } else if (min === top) {
      normalX = 0;
      normalY = -1;
    } else {
      normalX = 0;
      normalY = 1;
    }
    distance = 1;
  }

  normalX /= distance;
  normalY /= distance;
  const dot = ball.vx * normalX + ball.vy * normalY;

  ball.vx -= 2 * dot * normalX;
  ball.vy -= 2 * dot * normalY;
  ball.x = closestX + normalX * (ball.radius + 0.8);
  ball.y = closestY + normalY * (ball.radius + 0.8);
}

function handleBrickHit(brick) {
  state.shake = brick.immovable ? 0.16 : 0.24;

  if (brick.immovable) {
    if (state.elapsed - brick.lastPenaltyAt > 0.16) {
      state.score += brick.type.points;
      brick.lastPenaltyAt = state.elapsed;
      addFloatingText(formatPoints(brick.type.points), brick.x + brick.width / 2, brick.y + brick.height / 2, brick.type.color);
      showToast(brick.type.label, brick.type.detail, 1200);
    }
    state.combo = 0;
    burst(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.type.color, 7);
    return;
  }

  brick.hp -= 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);

  if (brick.hp <= 0) {
    breakBrick(brick);
    return;
  }

  addFloatingText("Crack", brick.x + brick.width / 2, brick.y + brick.height / 2, palette.muted);
  burst(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.type.color, 8);
}

function breakBrick(brick) {
  brick.alive = false;
  state.cleared += 1;
  state.score += brick.type.points;

  if (brick.type.kind === "positive") {
    state.positiveCollected += brick.type.points;
  }

  if (state.combo > 1) {
    state.score += 50;
  }

  const cx = brick.x + brick.width / 2;
  const cy = brick.y + brick.height / 2;
  addFloatingText(formatPoints(brick.type.points), cx, cy, brick.type.color);
  burst(cx, cy, brick.type.color, brick.support ? 24 : 16);

  if (brick.support || brick.type.kind === "negative") {
    showToast(brick.type.label, brick.type.detail, 1800);
  } else if (Math.random() < 0.28) {
    showToast(brick.type.label, brick.type.detail, 1500);
  }

  if (isFallPathClear() && !state.tamal.free) {
    rescueTamal();
  }
}

function isFallPathClear() {
  return state.bricks.every((brick) => !brick.alive || !intersectsFallPath(brick));
}

function intersectsFallPath(brick) {
  const path = state.fallPath;
  return (
    brick.x < path.right &&
    brick.x + brick.width > path.left &&
    brick.y < path.bottom &&
    brick.y + brick.height > path.top
  );
}

function getPositivePointProgress() {
  if (!state.positiveTotal) return 0;
  return state.positiveCollected / state.positiveTotal;
}

function rescueTamal() {
  state.tamal.free = true;
  state.tamal.falling = true;
  state.ball.attached = true;
  state.rescueBonus = 500;
  state.chanceBonus = state.chances * 300;
  state.score += state.rescueBonus + state.chanceBonus;
  showToast("Tamal Is Free", "Susmita Cleared The Way. Hug Incoming.", 2600);
  burst(state.tamal.x, state.tamal.y + 32, palette.gold, 60);
}

function updateRescue(dt) {
  if (!state.tamal.falling) return;

  const targetY = state.susmita.y - (isMobile() ? 56 : 72);
  state.tamal.y = lerp(state.tamal.y, targetY, clamp(dt * 1.9, 0, 1));
  state.susmita.x = lerp(state.susmita.x, state.width / 2, clamp(dt * 2.4, 0, 1));
  state.tamal.x = lerp(state.tamal.x, state.susmita.x, clamp(dt * 2.1, 0, 1));
  state.tamal.hug = clamp(state.tamal.hug + dt * 0.65, 0, 1);

  if (Math.abs(state.tamal.y - targetY) < 3 && state.tamal.hug >= 1) {
    winGame();
  }
}

function winGame() {
  if (state.won) return;
  state.won = true;
  state.over = true;
  state.running = false;
  burst(state.width / 2, state.susmita.y - (isMobile() ? 56 : 72), palette.rose, 90);
  setTimeout(showResult, 1450);
}

function loseChance() {
  state.chances -= 1;
  state.combo = 0;
  state.ball.attached = true;
  state.ball.x = state.susmita.x;
  state.ball.y = state.susmita.y - 25;
  state.ball.vx = 0;
  state.ball.vy = 0;
  state.ball.speed = 0;
  state.ball.horizontalTime = 0;

  if (state.chances <= 0) {
    state.over = true;
    state.running = false;
    showToast("Almost", "The Wall Is Still There, But Love Gets Rematches.", 1200);
    setTimeout(showResult, 900);
    return;
  }

  showToast("Love Ball Used", `${state.chances} Love Ball${state.chances === 1 ? "" : "s"} Left. Bring Him Back.`, 1800);
}

function showResult() {
  const rank = getRank(state.score);
  ui.resultEyebrow.textContent = state.won ? "Rescue Complete" : "Try Again";
  ui.resultTitle.textContent = rank;
  ui.resultMessage.textContent = state.won
    ? "Susmita Rescued Tamal And Protected The Relationship."
    : "Tamal Is Still Waiting, But The Next Rescue Starts Stronger.";
  ui.finalScore.textContent = String(state.score);
  ui.finalRank.textContent = rank;
  ui.bonusText.textContent = `+${state.rescueBonus + state.chanceBonus}`;
  ui.resultOverlay.classList.add("overlay--visible");
}

function getRank(score) {
  return ranks.find((rank) => score >= rank.min)?.label || ranks[ranks.length - 1].label;
}

async function copyScore() {
  const text = `Susmita: The Keeper: ${state.score} Points, ${getRank(state.score)}. Best Combo: ${state.bestCombo}.`;

  try {
    await navigator.clipboard.writeText(text);
    ui.shareButton.textContent = "Copied";
    setTimeout(() => {
      ui.shareButton.textContent = "Copy Score";
    }, 1400);
  } catch {
    showToast("Score", text, 3000);
  }
}

function updateParticles(dt) {
  state.particles = state.particles.filter((particle) => {
    particle.age += dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 260 * dt;
    return particle.age < particle.life;
  });
}

function updateFloatingText(dt) {
  state.floatingText = state.floatingText.filter((text) => {
    text.age += dt;
    text.y -= 66 * dt;
    return text.age < text.life;
  });
}

function burst(x, y, color, count) {
  for (let index = 0; index < count; index += 1) {
    const angle = random(0, Math.PI * 2);
    const speed = random(95, 360);
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - random(55, 165),
      size: random(2, 5.5),
      age: 0,
      life: random(0.24, 0.62),
      color,
    });
  }
}

function addFloatingText(value, x, y, color) {
  state.floatingText.push({ value, x, y, color, age: 0, life: 0.52 });
}

let toastTimer = 0;
function showToast(title, text, duration) {
  if (isMobile()) {
    ui.toast.classList.remove("is-visible");
    return;
  }

  ui.toastTitle.textContent = title;
  ui.toastText.textContent = text;
  ui.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove("is-visible"), duration);
}

function updateUi() {
  const progress = clamp(getPositivePointProgress(), 0, 1);
  ui.scoreText.textContent = String(state.score);
  ui.progressText.textContent = `${Math.round(progress * 100)}%`;
  ui.progressBar.style.width = `${progress * 100}%`;
  ui.relationshipText.textContent = state.rushTimer > 0 ? "Relationship Meter Under Rush" : "Relationship Meter";
}

function draw() {
  const shakeX = state.shake ? random(-state.shake, state.shake) * 8 : 0;
  const shakeY = state.shake ? random(-state.shake, state.shake) * 8 : 0;

  ctx.save();
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.translate(shakeX, shakeY);
  drawBackground();
  drawBricks();
  drawTamal();
  drawParticles();
  drawBall();
  drawSusmita();
  drawFloatingText();
  ctx.restore();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
  gradient.addColorStop(0, "#101729");
  gradient.addColorStop(0.55, "#18243a");
  gradient.addColorStop(1, "#111827");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  const time = performance.now() / 1000;
  state.stars.forEach((star) => {
    ctx.globalAlpha = 0.26 + Math.sin(time * 1.9 + star.pulse) * 0.18;
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawTamal() {
  const x = state.tamal.x;
  const y = state.tamal.y;
  const trapped = !state.tamal.free;
  const scale = mobileScale();

  if (trapped) {
    const cageWidth = 100 * scale;
    const cageHeight = 132 * scale;
    const top = y - 58 * scale;
    const bottom = top + cageHeight;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.roundRect(x - cageWidth / 2, top, cageWidth, cageHeight, 8 * scale);
    ctx.stroke();
    for (let i = -34 * scale; i <= 34 * scale; i += 17 * scale) {
      ctx.beginPath();
      ctx.moveTo(x + i, top + 2 * scale);
      ctx.lineTo(x + i, bottom - 4 * scale);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawTamalCharacter(x, y, trapped, state.tamal.hug);
}

function drawSusmita() {
  const paddle = state.susmita;
  const x = paddle.x;
  const y = paddle.y;

  ctx.save();
  ctx.fillStyle = "rgba(255, 209, 102, 0.18)";
  ctx.beginPath();
  ctx.roundRect(x - paddle.width / 2, y - paddle.height / 2, paddle.width, paddle.height, paddle.height / 2);
  ctx.fill();

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = isMobile() ? 2 : 3;
  ctx.beginPath();
  ctx.roundRect(x - paddle.width / 2, y - paddle.height / 2, paddle.width, paddle.height, paddle.height / 2);
  ctx.stroke();
  ctx.restore();

  if (state.tamal.hug < 0.18) {
    drawLoveBalls(x + paddle.width / 2 - (isMobile() ? 24 : 34), y);
  }

  const hugOffset = state.tamal.hug * 26;
  const susmitaX = x - (isMobile() ? 22 : 28) + hugOffset * 0.7;
  const susmitaY = y - (isMobile() ? 44 : 58);
  drawSusmitaCharacter(susmitaX, susmitaY, state.tamal.hug);

  if (state.tamal.hug > 0.2) {
    drawHugLove(state.tamal.x, state.tamal.y, susmitaX, susmitaY, state.tamal.hug);
  }
}

function drawLoveBalls(x, y) {
  const scale = mobileScale();
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let index = 0; index < 3; index += 1) {
    const offset = (index - 1) * 12 * scale;
    const active = index < state.chances;
    const ballX = x + offset;
    const ballY = y;

    ctx.globalAlpha = active ? 1 : 0.22;
    ctx.fillStyle = active ? "rgba(255, 209, 102, 0.24)" : "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = active ? palette.gold : "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.arc(ballX, ballY, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawHeart(ballX, ballY - 0.5, 4.5 * scale, active ? palette.coral : "rgba(255, 247, 235, 0.45)");
  }

  ctx.restore();
}

function drawTamalCharacter(x, y, trapped, hug = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(mobileScale(), mobileScale());

  drawCharacterShadow();
  drawCharacterBody("#4aa3df", "#2563a8", trapped ? 0.9 : 1, hug <= 0.2);
  drawCharacterHead("#f4c7a1");
  drawHair("male");
  drawFace(trapped ? "worried" : "happy");
  drawCharacterLabel(trapped ? "Tamal Trapped" : "Tamal", 68);
  ctx.restore();
}

function drawSusmitaCharacter(x, y, hug) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(mobileScale(), mobileScale());

  drawCharacterShadow();
  drawCharacterBody("#f58fb0", "#b83280", 1, hug <= 0.2);
  drawCharacterHead("#f2bd98");
  drawHair("female");
  drawFace(hug > 0.25 ? "happy" : "focused");
  drawCharacterLabel("Susmita", 72);
  ctx.restore();
}

function drawHugLove(tamalX, tamalY, susmitaX, susmitaY, hug) {
  const alpha = clamp(hug, 0, 1);
  const pulse = Math.sin(performance.now() / 180) * 1.5;
  const scale = mobileScale();
  const shoulderX = 18 * scale;
  const tamalShoulderY = tamalY + 23 * scale;
  const susmitaShoulderY = susmitaY + 23 * scale;
  const holdY = Math.max(tamalShoulderY, susmitaShoulderY) + 16 * scale + pulse;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  drawHugArm(tamalX - shoulderX, tamalShoulderY, susmitaX + shoulderX, holdY, false, scale);
  drawHugArm(tamalX + shoulderX, tamalShoulderY, susmitaX - shoulderX, holdY + 4 * scale, true, scale);
  drawHugArm(susmitaX - shoulderX, susmitaShoulderY, tamalX + shoulderX, holdY - 3 * scale, true, scale);
  drawHugArm(susmitaX + shoulderX, susmitaShoulderY, tamalX - shoulderX, holdY + 5 * scale, false, scale);

  drawHand(susmitaX + shoulderX, holdY, scale);
  drawHand(susmitaX - shoulderX, holdY + 4 * scale, scale);
  drawHand(tamalX + shoulderX, holdY - 3 * scale, scale);
  drawHand(tamalX - shoulderX, holdY + 5 * scale, scale);

  for (let index = 0; index < 5; index += 1) {
    const phase = performance.now() / 520 + index * 1.25;
    const centerX = (tamalX + susmitaX) / 2;
    const centerY = (tamalY + susmitaY) / 2;
    const heartX = centerX + Math.cos(phase) * (26 + index * 4) * scale;
    const heartY = centerY - 44 * scale - ((phase * 12 + index * 9) % 44) * scale;
    drawHeart(heartX, heartY, (7 + Math.sin(phase) * 1.6) * scale, index % 2 ? palette.rose : palette.coral);
  }

  ctx.restore();
}

function drawHugArm(startX, startY, endX, endY, upperCurve, scale = 1) {
  const midX = (startX + endX) / 2;
  const controlY = upperCurve ? startY - 12 * scale : endY + 14 * scale;

  ctx.strokeStyle = "rgba(17, 23, 42, 0.34)";
  ctx.lineWidth = 7 * scale;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(midX, controlY, endX, endY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 247, 235, 0.92)";
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(midX, controlY, endX, endY);
  ctx.stroke();
}

function drawHand(x, y, scale = 1) {
  ctx.fillStyle = "rgba(255, 247, 235, 0.96)";
  ctx.strokeStyle = "rgba(17, 23, 42, 0.34)";
  ctx.lineWidth = 1.4 * scale;
  ctx.beginPath();
  ctx.arc(x, y, 4.4 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawCharacterShadow() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 60, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCharacterBody(shirt, accent, alpha, showArms = true) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.roundRect(-18, 18, 36, 34, 12);
  ctx.fill();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-18, 22);
  ctx.lineTo(0, 44);
  ctx.lineTo(18, 22);
  ctx.lineTo(18, 52);
  ctx.lineTo(-18, 52);
  ctx.closePath();
  ctx.fill();

  if (showArms) {
    ctx.strokeStyle = "rgba(255, 247, 235, 0.74)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-17, 25);
    ctx.quadraticCurveTo(-32, 30, -28, 44);
    ctx.moveTo(17, 25);
    ctx.quadraticCurveTo(32, 30, 28, 44);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawCharacterHead(skin) {
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
}

function drawHair(style) {
  ctx.fillStyle = style === "female" ? "#30203a" : "#26324a";

  if (style === "female") {
    ctx.beginPath();
    ctx.arc(0, -3, 25, Math.PI * 0.92, Math.PI * 2.08);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-18, 12, 8, 20, -0.2, 0, Math.PI * 2);
    ctx.ellipse(18, 12, 8, 20, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(17, -17, 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(-22, -5);
  ctx.quadraticCurveTo(-16, -28, 0, -20);
  ctx.quadraticCurveTo(13, -30, 22, -7);
  ctx.quadraticCurveTo(6, -14, -22, -5);
  ctx.fill();
}

function drawFace(mood) {
  ctx.fillStyle = "#fff7eb";
  ctx.beginPath();
  ctx.arc(-8, -6, 3, 0, Math.PI * 2);
  ctx.arc(8, -6, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fff7eb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (mood === "worried") {
    ctx.arc(0, 12, 8, Math.PI * 1.08, Math.PI * 1.92);
  } else if (mood === "focused") {
    ctx.moveTo(-7, 8);
    ctx.quadraticCurveTo(0, 12, 7, 8);
  } else {
    ctx.arc(0, 4, 9, 0.12 * Math.PI, 0.88 * Math.PI);
  }
  ctx.stroke();
}

function drawCharacterLabel(label, y) {
  ctx.save();
  ctx.font = "900 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const width = Math.min(92, Math.max(56, ctx.measureText(label).width + 16));

  ctx.fillStyle = "rgba(15, 22, 38, 0.78)";
  ctx.strokeStyle = "rgba(255, 247, 235, 0.34)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-width / 2, y - 10, width, 20, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = palette.ink;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
  ctx.lineWidth = 3;
  ctx.strokeText(label, 0, y);
  ctx.fillText(label, 0, y);
  ctx.restore();
}

function drawBricks() {
  const time = performance.now() / 1000;
  state.bricks.forEach((brick) => {
    if (!brick.alive) return;

    const cx = brick.x + brick.width / 2;
    const cy = brick.y + brick.height / 2;
    const glow = brick.immovable
      ? 0.15 + Math.sin(time * 5 + brick.wobble) * 0.06
      : brick.support
        ? 0.24 + Math.sin(time * 4 + brick.wobble) * 0.08
        : 0.08;
    const textColor = brick.type.kind === "positive" ? "#111827" : palette.ink;
    const badgeColor = brick.type.kind === "positive" ? "rgba(17, 24, 39, 0.72)" : "rgba(255, 247, 235, 0.9)";

    ctx.save();
    ctx.shadowColor = brick.type.color;
    ctx.shadowBlur = brick.support ? 18 : brick.immovable ? 12 : 6;
    ctx.fillStyle = brick.type.color;
    ctx.globalAlpha = brick.immovable ? 0.92 : 0.88;
    ctx.beginPath();
    ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 8);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
    ctx.beginPath();
    ctx.roundRect(brick.x + 4, brick.y + 4, brick.width - 8, brick.height * 0.42, 6);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = textColor;
    ctx.font = `${labelFontSize(brick.type.label, brick.width)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (brick.type.kind !== "positive") {
      ctx.strokeStyle = "rgba(17, 24, 39, 0.42)";
      ctx.lineWidth = 3;
      ctx.strokeText(brick.type.label, cx, cy - 4);
    }
    ctx.fillText(brick.type.label, cx, cy - 4);

    ctx.fillStyle = badgeColor;
    ctx.font = `800 ${pointFontSize(brick.width, brick.height)}px Inter, system-ui, sans-serif`;
    const pointY = cy + Math.min(11, brick.height * 0.32);
    if (brick.type.kind !== "positive") {
      ctx.strokeStyle = "rgba(17, 24, 39, 0.5)";
      ctx.lineWidth = 3;
      ctx.strokeText(formatPoints(brick.type.points), cx, pointY);
    }
    ctx.fillText(formatPoints(brick.type.points), cx, pointY);

    if (brick.immovable) {
      ctx.strokeStyle = "rgba(255, 247, 235, 0.58)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.roundRect(brick.x + 4, brick.y + 4, brick.width - 8, brick.height - 8, 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (brick.maxHp > 1) {
      ctx.fillStyle = "rgba(17, 24, 39, 0.72)";
      ctx.beginPath();
      ctx.arc(brick.x + brick.width - 12, brick.y + 12, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palette.ink;
      ctx.font = "900 9px Inter, system-ui, sans-serif";
      ctx.fillText(String(brick.hp), brick.x + brick.width - 12, brick.y + 12);
    }

    ctx.restore();
  });
}

function labelFontSize(label, width) {
  if (width < 52) return label.length > 9 ? 6 : 7;
  if (width < 68) return label.length > 9 ? 7 : 8;
  if (width < 90) return label.length > 10 ? 8 : 9;
  return label.length > 11 ? 10 : 11;
}

function pointFontSize(width, height) {
  if (width < 56 || height < 32) return 8;
  return 10;
}

function formatPoints(points) {
  return points > 0 ? `+${points}` : String(points);
}

function drawBall() {
  const ball = state.ball;
  ctx.save();
  const glow = state.rushTimer > 0 ? 25 : 14;
  ctx.shadowColor = state.rushTimer > 0 ? palette.rose : palette.gold;
  ctx.shadowBlur = glow;
  drawHeart(ball.x, ball.y, ball.radius * 1.45, state.rushTimer > 0 ? palette.rose : palette.coral);
  ctx.restore();
}

function drawHeart(x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 18, size / 18);
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.bezierCurveTo(-20, -2, -9, -17, 0, -8);
  ctx.bezierCurveTo(9, -17, 20, -2, 0, 12);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
  ctx.lineWidth = 2.3;
  ctx.stroke();
  ctx.restore();
}

function drawParticles() {
  state.particles.forEach((particle) => {
    const alpha = 1 - particle.age / particle.life;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.age * 8);
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 1.8);
    ctx.restore();
  });
}

function drawFloatingText() {
  state.floatingText.forEach((text) => {
    const alpha = 1 - text.age / text.life;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = text.color;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.lineWidth = 4;
    ctx.font = "900 18px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(text.value, text.x, text.y);
    ctx.fillText(text.value, text.x, text.y);
    ctx.restore();
  });
}

init();
