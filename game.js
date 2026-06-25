/**
 * Space Animals Dodge Bombs
 * Vanilla JS + HTML5 Canvas playable game.
 *
 * Game loop, input, collision and spawn architecture adapted from
 * Darkraider888/Catch-Dodge (MIT License) — see CODE_CREDITS.md.
 * All visuals/audio are local ai-grok-assets / CC0 assets.
 */

(() => {
  "use strict";

  // ============================================================
  // Constants
  // ============================================================
  const DESIGN_W = 960;
  let DESIGN_H = 540;
  let GROUND_Y = 470;
  let CHAR_SCALE = 1;

  function refreshMobile() {
    const m = window.matchMedia("(max-width: 768px) and (orientation: portrait)").matches;
    DESIGN_H = m ? 1200 : 540;
    GROUND_Y = m ? 1080 : 470;
    CHAR_SCALE = m ? 3 : 1;
    console.log("refreshMobile", m, DESIGN_H, GROUND_Y, CHAR_SCALE);
  }
  refreshMobile();
  window.addEventListener("resize", refreshMobile);
  const GRAVITY = 1200;
  const MAX_LIVES = 3;
  const STORAGE_KEY = "space_animals_dodge_bombs_v1";

  const I18N = {
    ru: {
      game_title: "Космические животные",
      game_subtitle: "уворачиваются от бомб",
      loading: "Загрузка...",
      play: "Играть",
      select_animal: "Выбрать животное",
      settings: "Настройки",
      menu_hint: "Собирай звёзды, уворачивайся от бомб, открывай новых героев!",
      level: "Ур.",
      score: "Счёт",
      highscore: "Рекорд",
      paused: "Пауза",
      resume: "Продолжить",
      retry: "Попробовать снова",
      menu: "В меню",
      next: "Дальше",
      back: "Назад",
      level_clear: "Уровень пройден!",
      level_fail: "Бум! Попробуй ещё раз",
      new_animal: "Новый герой открыт!",
      music_volume: "Музыка",
      sfx_volume: "Звуки",
      vibration: "Вибрация",
      particles: "Частицы",
      reset_progress: "Сбросить прогресс",
      unlock_at_level: "Уровень {n}",
    },
    en: {
      game_title: "Space Animals",
      game_subtitle: "Dodge Bombs",
      loading: "Loading...",
      play: "Play",
      select_animal: "Choose Animal",
      settings: "Settings",
      menu_hint: "Collect stars, dodge bombs, unlock new heroes!",
      level: "Lv.",
      score: "Score",
      highscore: "Highscore",
      paused: "Paused",
      resume: "Resume",
      retry: "Try Again",
      menu: "Menu",
      next: "Next",
      back: "Back",
      level_clear: "Level Complete!",
      level_fail: "Boom! Try Again",
      new_animal: "New hero unlocked!",
      music_volume: "Music",
      sfx_volume: "SFX",
      vibration: "Vibration",
      particles: "Particles",
      reset_progress: "Reset Progress",
      unlock_at_level: "Level {n}",
    },
  };

  const CHARACTERS = [
    { id: "giraffo", sprite: "player_giraffe", nameRu: "Жирафик", nameEn: "Giraffo", unlockLevel: 1, speed: 260, jump: 420, w: 144, h: 168, hb: { x: 42, y: 36, w: 60, h: 120 } },
    { id: "sharky", sprite: "player_shark", nameRu: "Акулка", nameEn: "Sharky", unlockLevel: 2, speed: 300, jump: 400, w: 144, h: 144, hb: { x: 30, y: 36, w: 84, h: 84 } },
    { id: "kitty", sprite: "player_cat", nameRu: "Котик", nameEn: "Kitty", unlockLevel: 3, speed: 270, jump: 460, w: 132, h: 144, hb: { x: 30, y: 36, w: 72, h: 96 } },
    { id: "croco", sprite: "player_crocodile", nameRu: "Кроко", nameEn: "Croco", unlockLevel: 4, speed: 240, jump: 380, w: 156, h: 144, hb: { x: 30, y: 36, w: 96, h: 90 } },
    { id: "pengo", sprite: "player_penguin", nameRu: "Пенго", nameEn: "Pengo", unlockLevel: 5, speed: 320, jump: 440, w: 120, h: 144, hb: { x: 27, y: 30, w: 66, h: 102 } },
    { id: "racco", sprite: "player_raccoon", nameRu: "Енотик", nameEn: "Racco", unlockLevel: 6, speed: 285, jump: 430, w: 132, h: 144, hb: { x: 30, y: 36, w: 72, h: 96 } },
    { id: "foxy", sprite: "player_fox", nameRu: "Лисичка", nameEn: "Foxy", unlockLevel: 7, speed: 295, jump: 450, w: 132, h: 144, hb: { x: 30, y: 33, w: 72, h: 99 } },
    { id: "ellie", sprite: "player_elephant", nameRu: "Слоник", nameEn: "Ellie", unlockLevel: 8, speed: 220, jump: 360, w: 156, h: 156, hb: { x: 33, y: 33, w: 90, h: 108 } },
    { id: "berry", sprite: "player_bear", nameRu: "Мишка", nameEn: "Berry", unlockLevel: 9, speed: 250, jump: 390, w: 144, h: 156, hb: { x: 33, y: 33, w: 78, h: 108 } },
    { id: "sparky", sprite: "player_dragon", nameRu: "Дракончик", nameEn: "Sparky", unlockLevel: 10, speed: 280, jump: 470, w: 144, h: 168, hb: { x: 36, y: 36, w: 72, h: 120 } },
  ];

  const LEVELS = [
    { duration: 60, goal: 250, spawnMin: 1.5, spawnMax: 2.4, speeds: [180, 260], lanes: 3, collectMin: 2.0, collectMax: 3.5, weights: { bomb: 1.0, fast: 0.0, wide: 0.0, cluster: 0.0 } },
    { duration: 65, goal: 400, spawnMin: 1.2, spawnMax: 2.0, speeds: [200, 300], lanes: 3, collectMin: 1.9, collectMax: 3.2, weights: { bomb: 0.85, fast: 0.15, wide: 0.0, cluster: 0.0 } },
    { duration: 70, goal: 600, spawnMin: 1.0, spawnMax: 1.7, speeds: [220, 340], lanes: 4, collectMin: 1.8, collectMax: 3.0, weights: { bomb: 0.70, fast: 0.30, wide: 0.0, cluster: 0.0 } },
    { duration: 70, goal: 800, spawnMin: 0.9, spawnMax: 1.5, speeds: [240, 380], lanes: 4, collectMin: 1.7, collectMax: 2.8, weights: { bomb: 0.60, fast: 0.40, wide: 0.0, cluster: 0.0 } },
    { duration: 75, goal: 1050, spawnMin: 0.8, spawnMax: 1.3, speeds: [260, 420], lanes: 4, collectMin: 1.6, collectMax: 2.6, weights: { bomb: 0.45, fast: 0.35, wide: 0.20, cluster: 0.0 } },
    { duration: 75, goal: 1300, spawnMin: 0.7, spawnMax: 1.1, speeds: [280, 460], lanes: 5, collectMin: 1.5, collectMax: 2.4, weights: { bomb: 0.40, fast: 0.35, wide: 0.25, cluster: 0.0 } },
    { duration: 80, goal: 1600, spawnMin: 0.65, spawnMax: 1.0, speeds: [300, 500], lanes: 5, collectMin: 1.4, collectMax: 2.3, weights: { bomb: 0.35, fast: 0.30, wide: 0.25, cluster: 0.10 } },
    { duration: 80, goal: 1900, spawnMin: 0.55, spawnMax: 0.9, speeds: [320, 540], lanes: 5, collectMin: 1.3, collectMax: 2.1, weights: { bomb: 0.25, fast: 0.35, wide: 0.25, cluster: 0.15 } },
    { duration: 85, goal: 2250, spawnMin: 0.5, spawnMax: 0.8, speeds: [340, 580], lanes: 6, collectMin: 1.2, collectMax: 2.0, weights: { bomb: 0.20, fast: 0.35, wide: 0.25, cluster: 0.20 } },
    { duration: 90, goal: 2600, spawnMin: 0.45, spawnMax: 0.75, speeds: [360, 620], lanes: 6, collectMin: 1.1, collectMax: 1.9, weights: { bomb: 0.15, fast: 0.35, wide: 0.25, cluster: 0.25 } },
  ];

  const BOMB_TYPES = {
    bomb: { sprite: "bomb_normal", w: 96, h: 96, hb: { x: 16, y: 16, w: 64, h: 64 }, mult: 1.0 },
    fast: { sprite: "bomb_fast", w: 80, h: 112, hb: { x: 12, y: 16, w: 56, h: 80 }, mult: 1.45 },
    wide: { sprite: "bomb_wide", w: 160, h: 96, hb: { x: 16, y: 16, w: 128, h: 64 }, mult: 0.9 },
    cluster: { sprite: "bomb_cluster", w: 144, h: 144, hb: { x: 16, y: 16, w: 112, h: 112 }, mult: 1.05 },
  };

  const COLLECT_TYPES = {
    star: { sprite: "collectable_star", w: 80, h: 80, hb: { x: 12, y: 12, w: 56, h: 56 }, score: 20 },
    food: { sprite: "collectable_food", w: 80, h: 80, hb: { x: 12, y: 12, w: 56, h: 56 }, score: 50 },
    heart: { sprite: "collectable_heart", w: 80, h: 80, hb: { x: 12, y: 12, w: 56, h: 56 }, score: 0 },
    shield: { sprite: "collectable_shield", w: 96, h: 96, hb: { x: 16, y: 16, w: 64, h: 64 }, score: 0 },
  };

  const AUDIO_FILES = {
    music_menu: "assets/audio/music_menu.ogg",
    music_game: "assets/audio/music_game.ogg",
    sfx_explosion: "assets/audio/sfx_explosion.wav",
    sfx_dodge: "assets/audio/sfx_dodge.wav",
    sfx_collect: "assets/audio/sfx_collect.wav",
    sfx_level_up: "assets/audio/sfx_level_up.wav",
    sfx_game_over: "assets/audio/sfx_game_over.wav",
    sfx_ui_click: "assets/audio/sfx_ui_click.ogg",
    sfx_ui_confirm: "assets/audio/sfx_ui_confirm.ogg",
  };

  // ============================================================
  // DOM refs
  // ============================================================
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  function resizeCanvas() {
    const wrapper = document.getElementById("game-wrapper");
    const rect = wrapper.getBoundingClientRect();
    const cssW = Math.max(1, Math.floor(rect.width));
    const cssH = Math.max(1, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    return { cssW, cssH };
  }

  let { cssW: CSS_W, cssH: CSS_H } = resizeCanvas();
  window.addEventListener("resize", () => {
    const r = resizeCanvas();
    CSS_W = r.cssW;
    CSS_H = r.cssH;
  });

  const screens = {
    loading: document.getElementById("screen-loading"),
    menu: document.getElementById("screen-menu"),
    select: document.getElementById("screen-select"),
    pause: document.getElementById("screen-pause"),
    result: document.getElementById("screen-result"),
    settings: document.getElementById("screen-settings"),
  };
  const hud = document.getElementById("hud");
  const touchControls = document.getElementById("touch-controls");
  const loadingFill = document.getElementById("loading-fill");
  const hudScore = document.getElementById("hud-score");
  const hudLevel = document.getElementById("hud-level");
  const hudProgress = document.getElementById("hud-progress");
  const hudCurrent = document.getElementById("hud-current");
  const hudGoal = document.getElementById("hud-goal");
  const hudLives = document.getElementById("hud-lives");
  const characterGrid = document.getElementById("character-grid");
  const resultTitle = document.getElementById("result-title");
  const resultUnlock = document.getElementById("result-unlock");
  const unlockPortrait = document.getElementById("unlock-portrait");
  const unlockName = document.getElementById("unlock-name");
  const resultScore = document.getElementById("result-score");
  const resultHigh = document.getElementById("result-high");
  const btnNext = document.getElementById("btn-next");

  // ============================================================
  // State
  // ============================================================
  let gameState = "loading";
  let lang = "ru";
  let settings = { music: 0.6, sfx: 0.7, vibration: true, particles: true };
  let progress = { maxLevel: 1, highScore: 0 };
  let selectedChar = CHARACTERS[0];
  let currentLevelIdx = 0;
  let totalScore = 0;
  let levelScore = 0;
  let lives = MAX_LIVES;
  let levelTime = 0;
  let combo = 0;
  let comboTimer = 0;
  let heartsThisLevel = 0;
  let perfect = true;
  let shake = 0;
  let audioEnabled = false;
  let previousScreen = "menu";

  const player = {
    x: DESIGN_W / 2,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    grounded: true,
    faceRight: true,
    anim: "idle",
    animTime: 0,
    hitTimer: 0,
    invuln: 0,
    shield: 0,
  };

  const entities = []; // bombs/collectibles/effects
  const particles = []; // star dust
  const keys = { left: false, right: false, jump: false };
  let jumpPressed = false;
  let spawnAcc = 0;
  let nextSpawn = 0;
  let collectAcc = 0;
  let nextCollect = 0;
  let lastT = performance.now();

  // ============================================================
  // Utilities
  // ============================================================
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pickWeighted = (weights) => {
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    for (const [k, v] of Object.entries(weights)) {
      r -= v;
      if (r <= 0) return k;
    }
    return Object.keys(weights)[0];
  };
  const rectsOverlap = (a, b) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function tr(key, vars) {
    let s = I18N[lang][key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
    }
    return s;
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (I18N[lang][key]) el.textContent = I18N[lang][key];
    });
    document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    updateHud();
  }

  // ============================================================
  // Persistence
  // ============================================================
  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        progress.maxLevel = clamp(saved.maxLevel || 1, 1, LEVELS.length);
        progress.highScore = saved.highScore || 0;
        lang = saved.lang || "ru";
        if (saved.settings) Object.assign(settings, saved.settings);
      }
    } catch {}
    selectedChar = CHARACTERS.find((c) => c.unlockLevel <= progress.maxLevel) || CHARACTERS[0];
    currentLevelIdx = Math.min(progress.maxLevel - 1, LEVELS.length - 1);
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...progress, lang, settings }));
    } catch {}
  }

  // ============================================================
  // Assets
  // ============================================================
  const images = {};
  const audios = {};
  let assetsToLoad = 0;
  let assetsLoaded = 0;

  function registerImage(key, src, meta = {}) {
    assetsToLoad++;
    const img = new Image();
    img.src = src;
    const asset = { img, ...meta };
    images[key] = asset;
    img.onload = () => {
      if (asset.frameCount) {
        // Generated spritesheets use a 5x4 grid (20 frames)
        asset.columns = asset.columns || 5;
        asset.rows = asset.rows || 4;
        asset.frameW = Math.floor(img.naturalWidth / asset.columns);
        asset.frameH = Math.floor(img.naturalHeight / asset.rows);
      } else {
        asset.frameW = img.naturalWidth;
        asset.frameH = img.naturalHeight;
      }
      assetsLoaded++;
      updateLoading();
    };
    img.onerror = () => {
      console.warn("Failed to load image", src);
      assetsLoaded++;
      updateLoading();
    };
  }

  function registerAudio(key, src) {
    const a = new Audio(src);
    a.preload = "auto";
    audios[key] = a;
  }

  function buildAssetList() {
    // Background / platform
    registerImage("bg_space", "assets/background/bg_space.png");
    registerImage("platform", "assets/environment/platform_floating.png");

    // Characters
    for (const c of CHARACTERS) {
      for (const st of ["idle", "run", "jump", "hit"]) {
        registerImage(`${c.sprite}_${st}`, `assets/player/${c.sprite}_${st}_spritesheet.png`, { frameCount: 20, fps: 20, loop: st === "idle" || st === "run" });
      }
      registerImage(`${c.sprite}_ref`, `assets/player/${c.sprite}_reference.png`);
    }

    // Bombs
    for (const [type, info] of Object.entries(BOMB_TYPES)) {
      for (const st of ["fall", "explode"]) {
        registerImage(`${info.sprite}_${st}`, `assets/enemy/${info.sprite}_${st}_spritesheet.png`, { frameCount: 20, fps: 20, loop: st === "fall" });
      }
    }

    // Collectibles
    for (const info of Object.values(COLLECT_TYPES)) {
      registerImage(`${info.sprite}_twinkle`, `assets/collectable/${info.sprite}_twinkle_spritesheet.png`, { frameCount: 20, fps: 20, loop: true });
    }

    // Effects
    registerImage("fx_explosion", "assets/effect/fx_explosion_explode_spritesheet.png", { frameCount: 20, fps: 20, loop: false });
    registerImage("fx_sparkle", "assets/effect/fx_sparkle_sparkle_spritesheet.png", { frameCount: 20, fps: 20, loop: true });

    // Audio
    for (const [k, v] of Object.entries(AUDIO_FILES)) registerAudio(k, v);
  }

  function updateLoading() {
    const pct = assetsToLoad ? Math.floor((assetsLoaded / assetsToLoad) * 100) : 100;
    loadingFill.style.width = `${pct}%`;
    if (assetsLoaded >= assetsToLoad) {
      setTimeout(() => {
        if (gameState === "loading") showScreen("menu");
      }, 300);
    }
  }

  // ============================================================
  // Audio manager
  // ============================================================
  function enableAudio() {
    if (audioEnabled) return;
    audioEnabled = true;
    for (const a of Object.values(audios)) {
      a.volume = settings.music;
    }
    playMusic("music_menu");
  }

  function playMusic(key) {
    if (!audioEnabled) return;
    for (const [k, a] of Object.entries(audios)) {
      if (k.startsWith("music_")) {
        if (k === key) {
          a.loop = true;
          a.volume = settings.music;
          if (a.paused) a.play().catch(() => {});
        } else {
          a.pause();
          a.currentTime = 0;
        }
      }
    }
  }

  function playSfx(key) {
    if (!audioEnabled) return;
    const a = audios[key];
    if (!a) return;
    const clone = a.cloneNode();
    clone.volume = settings.sfx;
    clone.play().catch(() => {});
  }

  function setVolumes() {
    for (const [k, a] of Object.entries(audios)) {
      a.volume = k.startsWith("music_") ? settings.music : settings.sfx;
    }
  }

  function vibrate(ms = 40) {
    if (settings.vibration && navigator.vibrate) navigator.vibrate(ms);
  }

  // ============================================================
  // Input
  // ============================================================
  function setupInput() {
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keys.left = true;
      if (k === "arrowright" || k === "d") keys.right = true;
      if (k === "arrowup" || k === "w" || k === " ") {
        if (!keys.jump) jumpPressed = true;
        keys.jump = true;
      }
      if (k === "escape" || k === "p") togglePause();
      if (k === "enter") {
        if (gameState === "menu") startGameFromMenu();
        else if (gameState === "result") retryOrNext();
      }
    });

    window.addEventListener("keyup", (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keys.left = false;
      if (k === "arrowright" || k === "d") keys.right = false;
      if (k === "arrowup" || k === "w" || k === " ") keys.jump = false;
    });

    // Virtual buttons
    bindHold("btn-touch-left", "left");
    bindHold("btn-touch-right", "right");
    bindTap("btn-touch-jump", () => { jumpPressed = true; });

    // Canvas touch: swipe + tap
    let startX = 0;
    let startY = 0;
    let startT = 0;
    let pointerActive = false;

    canvas.addEventListener("pointerdown", (e) => {
      pointerActive = true;
      startX = e.clientX;
      startY = e.clientY;
      startT = performance.now();
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!pointerActive || gameState !== "playing") return;
      const dx = e.clientX - startX;
      const deadzone = 24;
      keys.left = dx < -deadzone;
      keys.right = dx > deadzone;
    });

    canvas.addEventListener("pointerup", (e) => {
      pointerActive = false;
      keys.left = false;
      keys.right = false;
      const dt = performance.now() - startT;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (dt < 220 && Math.abs(dx) < 24 && Math.abs(dy) < 24) {
        jumpPressed = true;
      }
    });

    canvas.addEventListener("pointercancel", () => {
      pointerActive = false;
      keys.left = false;
      keys.right = false;
    });
  }

  function bindHold(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const down = (e) => { e.preventDefault(); keys[key] = true; el.classList.add("pressed"); };
    const up = (e) => { e.preventDefault(); keys[key] = false; el.classList.remove("pressed"); };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", up);
  }

  function bindTap(id, fn) {
    const el = document.getElementById(id);
    if (!el) return;
    const fire = (e) => { e.preventDefault(); fn(); };
    el.addEventListener("pointerdown", fire);
  }

  // ============================================================
  // Screens / UI
  // ============================================================
  function showScreen(name) {
    for (const [k, el] of Object.entries(screens)) el.classList.toggle("hidden", k !== name);
    hud.classList.toggle("hidden", name !== "playing" && name !== "paused");
    touchControls.classList.toggle("hidden", name !== "playing" && name !== "paused");
    gameState = name;
    document.body.dataset.gameState = name;
    canvas.dataset.playing = String(name === "playing");
    if (name === "menu") playMusic("music_menu");
    else if (name === "playing") playMusic("music_game");
  }

  function updateHud() {
    hudScore.textContent = String(totalScore);
    hudLevel.textContent = String(currentLevelIdx + 1);
    const lvl = LEVELS[currentLevelIdx];
    hudGoal.textContent = String(lvl ? lvl.goal : 0);
    hudCurrent.textContent = String(levelScore);
    const pct = lvl ? clamp((levelScore / lvl.goal) * 100, 0, 100) : 0;
    hudProgress.style.width = `${pct}%`;

    hudLives.innerHTML = "";
    for (let i = 0; i < MAX_LIVES; i++) {
      const div = document.createElement("div");
      div.className = "life-heart" + (i < lives ? "" : " empty");
      hudLives.appendChild(div);
    }
  }

  function buildCharacterGrid() {
    characterGrid.innerHTML = "";
    for (const c of CHARACTERS) {
      const unlocked = c.unlockLevel <= progress.maxLevel;
      const slot = document.createElement("div");
      slot.className = "character-slot" + (unlocked ? "" : " locked") + (selectedChar.id === c.id ? " selected" : "");
      slot.title = unlocked ? (lang === "ru" ? c.nameRu : c.nameEn) : tr("unlock_at_level", { n: c.unlockLevel });

      const img = document.createElement("img");
      img.className = "character-portrait";
      img.src = `assets/player/${c.sprite}_reference.png`;
      img.alt = c.nameEn;
      slot.appendChild(img);

      const name = document.createElement("div");
      name.className = "character-name";
      name.textContent = lang === "ru" ? c.nameRu : c.nameEn;
      slot.appendChild(name);

      if (!unlocked) {
        const lock = document.createElement("div");
        lock.className = "lock-overlay";
        lock.innerHTML = '<div class="lock-icon"></div>';
        const tag = document.createElement("div");
        tag.className = "level-tag";
        tag.textContent = tr("unlock_at_level", { n: c.unlockLevel });
        slot.appendChild(lock);
        slot.appendChild(tag);
      }

      slot.addEventListener("click", () => {
        playSfx("sfx_ui_click");
        if (!unlocked) return;
        selectedChar = c;
        buildCharacterGrid();
      });
      characterGrid.appendChild(slot);
    }
  }

  // ============================================================
  // Gameplay
  // ============================================================
  function startGameFromMenu() {
    enableAudio();
    currentLevelIdx = Math.min(progress.maxLevel - 1, LEVELS.length - 1);
    startLevel(currentLevelIdx);
  }

  function startLevel(idx) {
    currentLevelIdx = clamp(idx, 0, LEVELS.length - 1);
    const lvl = LEVELS[currentLevelIdx];
    totalScore = 0;
    levelScore = 0;
    lives = MAX_LIVES;
    levelTime = lvl.duration;
    combo = 0;
    comboTimer = 0;
    heartsThisLevel = 0;
    perfect = true;
    shake = 0;
    entities.length = 0;
    particles.length = 0;

    player.x = DESIGN_W / 2;
    player.y = GROUND_Y;
    player.vx = 0;
    player.vy = 0;
    player.grounded = true;
    player.faceRight = true;
    player.anim = "idle";
    player.animTime = 0;
    player.hitTimer = 0;
    player.invuln = 0;
    player.shield = 0;

    spawnAcc = 0;
    nextSpawn = rand(lvl.spawnMin, lvl.spawnMax);
    collectAcc = 0;
    nextCollect = rand(lvl.collectMin, lvl.collectMax);

    updateHud();
    showScreen("playing");
    playSfx("sfx_ui_confirm");
  }

  function togglePause() {
    if (gameState === "playing") {
      previousScreen = "playing";
      showScreen("pause");
      playSfx("sfx_ui_click");
    } else if (gameState === "paused") {
      showScreen("playing");
      playSfx("sfx_ui_click");
    }
  }

  function retryOrNext() {
    if (!btnNext.classList.contains("hidden")) {
      startLevel(currentLevelIdx + 1);
    } else {
      startLevel(currentLevelIdx);
    }
  }

  function spawnBomb() {
    const lvl = LEVELS[currentLevelIdx];
    const margin = 60;
    const usableW = DESIGN_W - margin * 2;
    const laneW = usableW / lvl.lanes;

    let type = pickWeighted(lvl.weights);
    const info = BOMB_TYPES[type];

    let x, widthScale = 1;
    if (type === "wide") {
      const lane = Math.floor(Math.random() * (lvl.lanes - 1));
      x = margin + laneW * lane + laneW;
      widthScale = 1;
    } else {
      const lane = Math.floor(Math.random() * lvl.lanes);
      x = margin + laneW * lane + laneW / 2;
    }

    const baseSpeed = rand(lvl.speeds[0], lvl.speeds[1]);
    const speed = baseSpeed * info.mult;

    const bomb = {
      kind: "bomb",
      type,
      x,
      y: -80,
      vx: 0,
      vy: speed,
      animTime: 0,
      state: "fall",
      w: info.w,
      h: info.h,
      hb: { ...info.hb },
      rot: 0,
    };

    if (type === "cluster") {
      bomb.splitY = DESIGN_H * 0.55;
      bomb.split = false;
    }

    entities.push(bomb);
  }

  function spawnCollectible() {
    const lvl = LEVELS[currentLevelIdx];
    const margin = 70;
    const x = rand(margin, DESIGN_W - margin);
    const weights = { star: 0.55, food: 0.30, heart: 0.05, shield: 0.10 };
    const type = pickWeighted(weights);
    const info = COLLECT_TYPES[type];
    entities.push({
      kind: "collectible",
      type,
      x,
      y: -60,
      vy: 150,
      w: info.w,
      h: info.h,
      hb: { ...info.hb },
      animTime: 0,
      baseX: x,
      bobTime: Math.random() * 10,
    });
  }

  function addExplosion(x, y, scale = 1) {
    entities.push({
      kind: "effect",
      key: "fx_explosion",
      x,
      y,
      scale,
      animTime: 0,
      dead: false,
    });
  }

  function addSparkles(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      entities.push({
        kind: "effect",
        key: "fx_sparkle",
        x: x + rand(-20, 20),
        y: y + rand(-20, 20),
        scale: rand(0.5, 0.9),
        animTime: rand(0, 1),
        life: rand(0.5, 0.9),
        dead: false,
      });
    }
  }

  function addParticle() {
    if (!settings.particles) return;
    particles.push({
      x: Math.random() * DESIGN_W,
      y: -10,
      vy: rand(20, 80),
      r: rand(0.5, 2),
      alpha: rand(0.2, 0.6),
    });
  }

  function getPlayerHitbox() {
    const c = selectedChar;
    const s = CHAR_SCALE;
    const left = player.x - c.w * 0.5 * s + c.hb.x * s;
    const top = player.y - c.h * 0.9 * s + c.hb.y * s;
    return { x: left, y: top, w: c.hb.w * s, h: c.hb.h * s };
  }

  function getEntityHitbox(e) {
    return { x: e.x - e.w / 2 + e.hb.x, y: e.y - e.h / 2 + e.hb.y, w: e.hb.w, h: e.hb.h };
  }

  function update(dt) {
    if (gameState !== "playing") return;

    const lvl = LEVELS[currentLevelIdx];
    levelTime -= dt;

    // Player physics
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir !== 0) {
      player.faceRight = dir > 0;
      player.vx += dir * 2400 * dt;
      player.vx = clamp(player.vx, -selectedChar.speed, selectedChar.speed);
    } else {
      player.vx *= Math.pow(0.82, dt * 60);
      if (Math.abs(player.vx) < 1) player.vx = 0;
    }

    player.x += player.vx * dt;
    const margin = (selectedChar.w * CHAR_SCALE) / 2 + 10;
    player.x = clamp(player.x, margin, DESIGN_W - margin);

    if (jumpPressed && player.grounded) {
      player.vy = -selectedChar.jump;
      player.grounded = false;
      player.anim = "jump";
      player.animTime = 0;
      playSfx("sfx_dodge");
    }
    jumpPressed = false;

    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    if (player.y >= GROUND_Y && player.vy >= 0) {
      player.y = GROUND_Y;
      player.vy = 0;
      player.grounded = true;
    }

    // Timers
    if (player.hitTimer > 0) player.hitTimer -= dt;
    if (player.invuln > 0) player.invuln -= dt;
    if (player.shield > 0) player.shield -= dt;
    if (shake > 0) shake = Math.max(0, shake - 30 * dt);
    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) combo = 0;
    }

    // Animation state
    if (player.hitTimer > 0) {
      player.anim = "hit";
    } else if (!player.grounded) {
      player.anim = "jump";
    } else if (Math.abs(player.vx) > 5) {
      player.anim = "run";
    } else {
      player.anim = "idle";
    }
    player.animTime += dt;

    // Spawning
    spawnAcc += dt;
    if (spawnAcc >= nextSpawn) {
      spawnAcc = 0;
      nextSpawn = rand(lvl.spawnMin, lvl.spawnMax);
      spawnBomb();
    }

    collectAcc += dt;
    if (collectAcc >= nextCollect) {
      collectAcc = 0;
      nextCollect = rand(lvl.collectMin, lvl.collectMax);
      spawnCollectible();
    }

    if (Math.random() < 0.3) addParticle();

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y += p.vy * dt;
      if (p.y > DESIGN_H + 10) particles.splice(i, 1);
    }

    // Update entities
    const phb = getPlayerHitbox();
    for (let i = entities.length - 1; i >= 0; i--) {
      const e = entities[i];

      if (e.kind === "effect") {
        const asset = images[e.key];
        e.animTime += dt;
        if (e.life) {
          e.life -= dt;
          if (e.life <= 0) {
            entities.splice(i, 1);
            continue;
          }
        }
        if (asset && !asset.loop && e.animTime >= asset.frameCount / asset.fps) {
          entities.splice(i, 1);
        }
        continue;
      }

      e.y += e.vy * dt;
      if (e.kind === "collectible") {
        e.bobTime += dt;
        e.x = e.baseX + Math.sin(e.bobTime * 3) * 6;
        e.animTime += dt;
      }

      if (e.kind === "bomb") {
        e.x += (e.vx || 0) * dt;
        e.animTime += dt;
        e.rot += dt * 2;
      }

      if (e.kind === "bomb" && e.type === "cluster" && !e.split && e.y >= e.splitY) {
        e.split = true;
        e.dead = true;
        const count = Math.floor(rand(2, 4));
        const info = BOMB_TYPES.bomb;
        for (let k = 0; k < count; k++) {
          const offset = (k - (count - 1) / 2) * 50;
          entities.push({
            kind: "bomb",
            type: "bomb",
            x: e.x + offset,
            y: e.y,
            vx: offset * 0.5,
            vy: e.vy * rand(0.9, 1.1),
            animTime: 0,
            state: "fall",
            w: info.w,
            h: info.h,
            hb: { ...info.hb },
            rot: 0,
          });
        }
        addExplosion(e.x, e.y, 0.8);
      }

      if (e.dead) {
        entities.splice(i, 1);
        continue;
      }

      const ehb = getEntityHitbox(e);
      if (rectsOverlap(phb, ehb)) {
        if (e.kind === "collectible") {
          collect(e);
          entities.splice(i, 1);
          continue;
        } else if (e.kind === "bomb") {
          if (player.shield > 0) {
            addExplosion(e.x, e.y, 0.9);
            entities.splice(i, 1);
            continue;
          }
          if (player.invuln <= 0) {
            takeHit(e);
            entities.splice(i, 1);
            continue;
          }
        }
      }

      if (e.y > DESIGN_H + 100) entities.splice(i, 1);
    }

    // Level end
    if (levelTime <= 0) {
      if (levelScore >= lvl.goal) winLevel();
      else loseLevel();
    } else if (lives <= 0) {
      loseLevel();
    }

    updateHud();
  }

  function collect(e) {
    const info = COLLECT_TYPES[e.type];
    if (e.type === "heart") {
      if (lives < MAX_LIVES && heartsThisLevel < 1) {
        lives++;
        heartsThisLevel++;
        addSparkles(e.x, e.y, 8);
        playSfx("sfx_collect");
      }
    } else if (e.type === "shield") {
      player.shield = 3.5;
      addSparkles(e.x, e.y, 8);
      playSfx("sfx_collect");
    } else {
      combo++;
      comboTimer = 3.0;
      let mult = 1;
      if (combo >= 12) mult = 2.5;
      else if (combo >= 8) mult = 2.0;
      else if (combo >= 5) mult = 1.5;
      else if (combo >= 3) mult = 1.2;
      const gained = Math.floor(info.score * mult);
      totalScore += gained;
      levelScore += gained;
      addSparkles(e.x, e.y, 5);
      playSfx("sfx_collect");
    }
  }

  function takeHit(bomb) {
    lives--;
    perfect = false;
    player.hitTimer = 0.5;
    player.invuln = 1.0;
    player.anim = "hit";
    player.animTime = 0;
    shake = 12;
    addExplosion(bomb.x, bomb.y, 1.0);
    playSfx("sfx_explosion");
    vibrate(60);
    combo = 0;
  }

  function winLevel() {
    const lvl = LEVELS[currentLevelIdx];
    const clearBonus = 50;
    const perfectBonus = perfect ? 100 + currentLevelIdx * 100 : 0;
    totalScore += clearBonus + perfectBonus;
    levelScore += clearBonus + perfectBonus;
    if (totalScore > progress.highScore) progress.highScore = totalScore;

    let unlocked = null;
    const nextChar = CHARACTERS.find((c) => c.unlockLevel === currentLevelIdx + 1);
    if (nextChar && currentLevelIdx + 1 >= progress.maxLevel) {
      progress.maxLevel = Math.max(progress.maxLevel, currentLevelIdx + 2);
      unlocked = nextChar;
    }
    saveProgress();

    showResult(true, unlocked);
    playSfx("sfx_level_up");
  }

  function loseLevel() {
    if (totalScore > progress.highScore) progress.highScore = totalScore;
    saveProgress();
    showResult(false, null);
    playSfx("sfx_game_over");
  }

  function showResult(win, unlocked) {
    resultTitle.dataset.i18n = win ? "level_clear" : "level_fail";
    resultTitle.textContent = tr(win ? "level_clear" : "level_fail");
    resultScore.textContent = String(totalScore);
    resultHigh.textContent = String(progress.highScore);

    if (unlocked) {
      resultUnlock.classList.remove("hidden");
      unlockPortrait.innerHTML = `<img src="assets/player/${unlocked.sprite}_reference.png" alt="${lang === "ru" ? unlocked.nameRu : unlocked.nameEn}">`;
      unlockName.textContent = lang === "ru" ? unlocked.nameRu : unlocked.nameEn;
    } else {
      resultUnlock.classList.add("hidden");
    }

    if (win && currentLevelIdx < LEVELS.length - 1) {
      btnNext.classList.remove("hidden");
    } else {
      btnNext.classList.add("hidden");
    }

    showScreen("result");
    playMusic("music_menu");
  }

  // ============================================================
  // Rendering
  // ============================================================
  function drawSprite(key, x, y, opts = {}) {
    const asset = images[key];
    if (!asset || !asset.img.complete || asset.img.naturalWidth === 0) return;
    const {
      anchorX = 0.5,
      anchorY = 0.5,
      scale = 1,
      flipX = false,
      alpha = 1,
      rot = 0,
      t = 0,
    } = opts;

    const columns = asset.columns || 1;
    const frameCount = asset.frameCount || 1;
    const frameW = asset.frameW;
    const frameH = asset.frameH;
    const fps = asset.fps || 20;
    const loop = asset.loop !== false;
    let frame = 0;
    if (frameCount > 1) {
      const dur = frameCount / fps;
      if (loop) {
        frame = Math.floor((t % dur) * fps) % frameCount;
      } else {
        frame = Math.min(Math.floor(t * fps), frameCount - 1);
      }
    }

    const col = frame % columns;
    const row = Math.floor(frame / columns);
    const sx = col * frameW;
    const sy = row * frameH;

    const dw = frameW * scale;
    const dh = frameH * scale;
    const dx = x - dw * anchorX;
    const dy = y - dh * anchorY;

    ctx.save();
    ctx.globalAlpha = alpha;
    if (rot) {
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.translate(-x, -y);
    }
    if (flipX) {
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.translate(-x, 0);
    }
    ctx.drawImage(asset.img, sx, sy, frameW, frameH, dx, dy, dw, dh);
    ctx.restore();
  }

  function draw() {
    const screenW = CSS_W;
    const screenH = CSS_H;
    const scaleX = screenW / DESIGN_W;
    const scaleY = screenH / DESIGN_H;

    ctx.save();
    ctx.fillStyle = "#0D1B2A";
    ctx.fillRect(0, 0, screenW, screenH);

    // Background: cover the screen, keep aspect ratio
    const bg = images.bg_space;
    if (bg && bg.img.complete) {
      const bgScale = Math.max(screenW / bg.img.naturalWidth, screenH / bg.img.naturalHeight);
      const bw = bg.img.naturalWidth * bgScale;
      const bh = bg.img.naturalHeight * bgScale;
      ctx.drawImage(bg.img, (screenW - bw) / 2, (screenH - bh) / 2, bw, bh);
    }

    // Gameplay coordinate system: uniformly scaled to fit, letterboxed if needed
    const gameScale = Math.min(scaleX, scaleY);
    const gameW = DESIGN_W * gameScale;
    const gameH = DESIGN_H * gameScale;
    const offsetX = (screenW - gameW) / 2;
    let offsetY = (screenH - gameH) / 2;
    if (CHAR_SCALE > 1) {
      const bottomPad = Math.min(screenH * 0.14, 120);
      offsetY = Math.max(offsetY, screenH - gameH - bottomPad);
    }

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(gameScale, gameScale);

    const sx = shake > 0 ? rand(-shake, shake) : 0;
    const sy = shake > 0 ? rand(-shake, shake) : 0;
    ctx.translate(sx, sy);

    // Particles
    ctx.fillStyle = "#FFF5E1";
    for (const p of particles) {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Platform under player
    const plat = images.platform;
    if (plat && plat.img.complete) {
      const pw = 320 * CHAR_SCALE;
      const ph = (plat.img.naturalHeight / plat.img.naturalWidth) * pw;
      ctx.drawImage(plat.img, player.x - pw / 2, GROUND_Y - 6, pw, ph);
    }

    // Entities (effects behind)
    for (const e of entities) {
      if (e.kind === "effect") {
        const asset = images[e.key];
        const fxScale = asset && asset.frameW ? (96 / asset.frameW) : 1;
        drawSprite(e.key, e.x, e.y, { scale: (e.scale || 1) * fxScale, t: e.animTime });
      }
    }

    // Collectibles
    for (const e of entities) {
      if (e.kind === "collectible") {
        const key = `${COLLECT_TYPES[e.type].sprite}_twinkle`;
        const asset = images[key];
        const scale = asset && asset.frameW ? (e.w / asset.frameW) : 1;
        drawSprite(key, e.x, e.y, { anchorX: 0.5, anchorY: 0.5, scale, t: e.animTime });
      }
    }

    // Bombs
    for (const e of entities) {
      if (e.kind === "bomb") {
        const info = BOMB_TYPES[e.type];
        const key = `${info.sprite}_${e.state}`;
        const asset = images[key];
        const scale = asset && asset.frameW ? (e.w / asset.frameW) : 1;
        drawSprite(key, e.x, e.y, { anchorX: 0.5, anchorY: 0.5, scale, rot: e.rot, t: e.animTime });
      }
    }

    // Player
    const c = selectedChar;
    const pKey = `${c.sprite}_${player.anim}`;
    const pAsset = images[pKey];
    const pScale = (pAsset && pAsset.frameW ? (c.w / pAsset.frameW) : 1) * CHAR_SCALE;

    const flash = player.invuln > 0 && Math.floor(performance.now() / 80) % 2 === 0;
    drawSprite(pKey, player.x, player.y, {
      anchorX: 0.5,
      anchorY: 0.9,
      scale: pScale,
      flipX: !player.faceRight,
      alpha: flash ? 0.5 : 1,
      t: player.animTime,
    });

    // Shield aura
    if (player.shield > 0) {
      ctx.save();
      ctx.translate(player.x, player.y - c.h * 0.5 * CHAR_SCALE);
      ctx.strokeStyle = "rgba(125, 255, 224, 0.6)";
      ctx.lineWidth = 3 / gameScale;
      ctx.beginPath();
      const r = c.w * 0.7 * CHAR_SCALE + Math.sin(performance.now() / 150) * 4;
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(125, 255, 224, 0.12)";
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    ctx.restore();

    // HUD update lives handled in updateHud
  }

  // ============================================================
  // Main loop
  // ============================================================
  let frameCounter = 0;
  function loop(t) {
    const dt = clamp((t - lastT) / 1000, 0, 1 / 20);
    lastT = t;

    update(dt);
    draw();

    frameCounter++;
    canvas.dataset.frame = String(frameCounter);
    canvas.dataset.lastTime = String(performance.now());

    requestAnimationFrame(loop);
  }

  // ============================================================
  // Event wiring
  // ============================================================
  function wireButtons() {
    const click = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", () => { enableAudio(); playSfx("sfx_ui_click"); fn(); });
    };

    click("btn-play", startGameFromMenu);
    click("btn-select", () => { previousScreen = "menu"; buildCharacterGrid(); showScreen("select"); });
    click("btn-settings", () => { previousScreen = "menu"; showScreen("settings"); updateSettingsUi(); });
    click("btn-select-back", () => showScreen("menu"));
    click("btn-pause", togglePause);
    click("btn-resume", togglePause);
    click("btn-retry-pause", () => startLevel(currentLevelIdx));
    click("btn-menu-pause", () => showScreen("menu"));
    click("btn-retry-result", () => startLevel(currentLevelIdx));
    click("btn-next", () => startLevel(currentLevelIdx + 1));
    click("btn-menu-result", () => showScreen("menu"));
    click("btn-settings-back", () => showScreen(previousScreen === "playing" ? "pause" : previousScreen));
    click("btn-reset", () => {
      if (confirm(tr("reset_progress") + "?")) {
        progress = { maxLevel: 1, highScore: 0 };
        saveProgress();
        selectedChar = CHARACTERS[0];
        currentLevelIdx = 0;
        updateSettingsUi();
      }
    });

    const setLang = (l) => { lang = l; saveProgress(); applyLang(); buildCharacterGrid(); };
    document.getElementById("btn-lang-ru").addEventListener("click", () => setLang("ru"));
    document.getElementById("btn-lang-en").addEventListener("click", () => setLang("en"));
    document.getElementById("btn-lang-ru-set").addEventListener("click", () => setLang("ru"));
    document.getElementById("btn-lang-en-set").addEventListener("click", () => setLang("en"));

    const toggleBtn = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", () => {
        settings[key] = !settings[key];
        el.setAttribute("aria-pressed", String(settings[key]));
        el.textContent = settings[key] ? "ON" : "OFF";
        saveProgress();
      });
    };
    toggleBtn("btn-vibro", "vibration");
    toggleBtn("btn-particles", "particles");

    const volMusic = document.getElementById("vol-music");
    const volSfx = document.getElementById("vol-sfx");
    if (volMusic) {
      volMusic.value = settings.music;
      volMusic.addEventListener("input", () => { settings.music = parseFloat(volMusic.value); setVolumes(); saveProgress(); });
    }
    if (volSfx) {
      volSfx.value = settings.sfx;
      volSfx.addEventListener("input", () => { settings.sfx = parseFloat(volSfx.value); setVolumes(); saveProgress(); });
    }
  }

  function updateSettingsUi() {
    const vibro = document.getElementById("btn-vibro");
    const parts = document.getElementById("btn-particles");
    const vm = document.getElementById("vol-music");
    const vs = document.getElementById("vol-sfx");
    if (vibro) { vibro.setAttribute("aria-pressed", String(settings.vibration)); vibro.textContent = settings.vibration ? "ON" : "OFF"; }
    if (parts) { parts.setAttribute("aria-pressed", String(settings.particles)); parts.textContent = settings.particles ? "ON" : "OFF"; }
    if (vm) vm.value = settings.music;
    if (vs) vs.value = settings.sfx;
  }

  // ============================================================
  // Init
  // ============================================================
  function init() {
    loadProgress();
    buildAssetList();
    setupInput();
    wireButtons();
    applyLang();
    updateSettingsUi();
    showScreen("loading");
    requestAnimationFrame(loop);
  }

  init();
})();
