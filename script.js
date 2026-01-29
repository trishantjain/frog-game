
// GAME CONFIGURATION
const TOTAL_SEGMENTS = 30;
const MAX_TIME_BASE = 5000; // 5 seconds initially
const MIN_TIME = 2000;      // Minimum 2 seconds

// DOM ELEMENTS
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    end: document.getElementById('game-over-screen')
};

const ui = {
    score: document.getElementById('score'),
    highScore: document.getElementById('high-score'),
    finalScore: document.getElementById('final-score'),
    timerContainer: document.getElementById('timer-container'),
    challengeText: document.getElementById('challenge-text'),
    pressCounter: document.getElementById('press-counter'),
    frog: document.getElementById('game-frog'),
    touchLayer: document.getElementById('touch-layer'),
    gameLayer: document.getElementById('game-ui-layer'),
    themeToggle: document.getElementById('theme-toggle'),

    // Video Elements
    loadingScreen: document.getElementById('loading-screen'),
    bgStatic: document.getElementById('bg-static'),
    vidIntro: document.getElementById('vid-intro'),
    vidManual: document.getElementById('vid-manual'),
    vidGame: document.getElementById('vid-game'),
    playOverlay: document.getElementById('play-overlay'),
    playBtn: document.getElementById('big-play-btn')
};


// ORIENTATION & THEME DETECTION
const isPortrait = () => window.matchMedia("(orientation: portrait)").matches;
let isDarkMode = false; // Default: Light mode

// GAME STATE
let state = {
    isPlaying: false,
    score: 0,
    round: 1,
    currentChallenge: null,
    pressCount: 0,
    timerStart: 0,
    timerDuration: 0,
    timerId: null,
    segments: [],
    videoSequenceComplete: false
};

// PERSISTENCE
let highScore = parseInt(localStorage.getItem('frog_high_score') || '0');
ui.highScore.innerText = highScore;

// TAPPING DEBOUNCE
let lastTapTime = 0;
const TAP_DEBOUNCE = 100;

// CHALLENGE DATABASE - 100 UNIQUE QUESTIONS
const challenges = [
    // ===== EASY (34 questions) - Rounds 1-9 =====
    { text: "PRESS 5 TIMES", answer: 5, type: "exact", difficulty: 1 },
    { text: "PRESS 7 TIMES", answer: 7, type: "exact", difficulty: 1 },
    { text: "PRESS 3 TIMES", answer: 3, type: "exact", difficulty: 1 },
    { text: "TAP ONCE IF YOU LIKE FROGS", answer: 1, type: "exact", difficulty: 1 },
    { text: "PRESS IF YOU'RE A HUMAN", answer: 1, type: "exact", difficulty: 1 },
    { text: "PRESS MORE THAN 2 TIMES", answer: 2, type: "minimum", difficulty: 1 },
    { text: "PRESS MORE THAN 4 TIMES", answer: 4, type: "minimum", difficulty: 1 },
    { text: "3 PRESSES REMAINING", answer: 3, type: "exact", difficulty: 1 },
    { text: "2 PRESSES REMAINING", answer: 2, type: "exact", difficulty: 1 },
    { text: "PRESS AN ODD NUMBER OF TIMES", type: "condition", condition: "odd", difficulty: 1 },
    { text: "PRESS 10 TIMES", answer: 10, type: "exact", difficulty: 1 },
    { text: "PRESS 6 TIMES", answer: 6, type: "exact", difficulty: 1 },
    { text: "TAP TWICE", answer: 2, type: "exact", difficulty: 1 },
    { text: "PRESS 4 TIMES EXACTLY", answer: 4, type: "exact", difficulty: 1 },
    { text: "GIVE ME 8 TAPS", answer: 8, type: "exact", difficulty: 1 },
    { text: "PRESS MORE THAN 5 TIMES", answer: 5, type: "minimum", difficulty: 1 },
    { text: "PRESS 9 TIMES", answer: 9, type: "exact", difficulty: 1 },
    { text: "PRESS ONCE", answer: 1, type: "exact", difficulty: 1 },
    { text: "TAP 3 TIMES FAST", answer: 3, type: "exact", difficulty: 1 },
    { text: "PRESS MORE THAN 1 TIME", answer: 1, type: "minimum", difficulty: 1 },
    { text: "SINGLE TAP ONLY", answer: 1, type: "exact", difficulty: 1 },
    { text: "PRESS 12 TIMES", answer: 12, type: "exact", difficulty: 1 },
    { text: "4 QUICK PRESSES", answer: 4, type: "exact", difficulty: 1 },
    { text: "PRESS MORE THAN 6 TIMES", answer: 6, type: "minimum", difficulty: 1 },
    { text: "TAP 5 TIMES NOW", answer: 5, type: "exact", difficulty: 1 },
    { text: "PRESS 11 TIMES", answer: 11, type: "exact", difficulty: 1 },
    { text: "DOUBLE TAP", answer: 2, type: "exact", difficulty: 1 },
    { text: "PRESS MORE THAN 3 TIMES", answer: 3, type: "minimum", difficulty: 1 },
    { text: "TAP ONCE FOR YES", answer: 1, type: "exact", difficulty: 1 },
    { text: "PRESS 15 TIMES", answer: 15, type: "exact", difficulty: 1 },
    { text: "GIVE ME 6 TAPS", answer: 6, type: "exact", difficulty: 1 },
    { text: "PRESS MORE THAN 7 TIMES", answer: 7, type: "minimum", difficulty: 1 },
    { text: "TAP 8 TIMES QUICK", answer: 8, type: "exact", difficulty: 1 },
    { text: "PRESS ONCE FOR EACH WORD IN THIS SENTENCE", answer: 8, type: "exact", difficulty: 1 },
    
    // ===== MEDIUM (33 questions) - Rounds 10-19 =====
    { text: "TAP LESS THAN 4 TIMES", answer: 4, type: "maximum_exclusive", difficulty: 2 },
    { text: "NEVER PRESS WHEN YOU SEE A SPIDER 🕷️", answer: 0, type: "exact", difficulty: 2 },
    { text: "PRESS AN EVEN NUMBER OF TIMES", type: "condition", condition: "even", difficulty: 2 },
    { text: "PRESS FOR EACH LETTER IN 'FROG'", answer: 4, type: "exact", difficulty: 2 },
    { text: "PRESS BETWEEN 5 AND 8 TIMES", min: 5, max: 8, type: "range", difficulty: 2 },
    { text: "HOW MANY EYES DOES A FROG HAVE?", answer: 2, type: "exact", difficulty: 2 },
    { text: "PRESS FOR EACH VOWEL IN 'FROG'", answer: 1, type: "exact", difficulty: 2 },
    { text: "COUNT THE EMOJIS: 🐸🌿🐸", answer: 3, type: "exact", difficulty: 2 },
    { text: "PRESS LESS THAN 5 TIMES", answer: 5, type: "maximum_exclusive", difficulty: 2 },
    { text: "PRESS BETWEEN 2 AND 5 TIMES", min: 2, max: 5, type: "range", difficulty: 2 },
    { text: "HOW MANY LEGS DOES A FROG HAVE?", answer: 4, type: "exact", difficulty: 2 },
    { text: "DON'T PRESS IF YOU SEE RED 🔴", answer: 0, type: "exact", difficulty: 2 },
    { text: "LETTERS IN THE WORD 'JUMP'", answer: 4, type: "exact", difficulty: 2 },
    { text: "PRESS BETWEEN 4 AND 7 TIMES", min: 4, max: 7, type: "range", difficulty: 2 },
    { text: "TAP LESS THAN 3 TIMES", answer: 3, type: "maximum_exclusive", difficulty: 2 },
    { text: "COUNT THE STARS: ⭐⭐⭐⭐", answer: 4, type: "exact", difficulty: 2 },
    { text: "PRESS FOR EACH LETTER IN 'GAME'", answer: 4, type: "exact", difficulty: 2 },
    { text: "NEVER TAP WHEN YOU SEE FIRE 🔥", answer: 0, type: "exact", difficulty: 2 },
    { text: "PRESS BETWEEN 6 AND 9 TIMES", min: 6, max: 9, type: "range", difficulty: 2 },
    { text: "HOW MANY EYES DO TWO FROGS HAVE?", answer: 4, type: "exact", difficulty: 2 },
    { text: "LETTERS IN 'POND'", answer: 4, type: "exact", difficulty: 2 },
    { text: "PRESS LESS THAN 6 TIMES", answer: 6, type: "maximum_exclusive", difficulty: 2 },
    { text: "COUNT THE HEARTS: ❤️❤️❤️", answer: 3, type: "exact", difficulty: 2 },
    { text: "PRESS BETWEEN 3 AND 8 TIMES", min: 3, max: 8, type: "range", difficulty: 2 },
    { text: "LETTERS IN 'LILY'", answer: 4, type: "exact", difficulty: 2 },
    { text: "PRESS FOR EACH SEASON", answer: 4, type: "exact", difficulty: 2 },
    { text: "DON'T PRESS WHEN WARNED ⚠️", answer: 0, type: "exact", difficulty: 2 },
    { text: "PRESS LESS THAN 7 TIMES", answer: 7, type: "maximum_exclusive", difficulty: 2 },
    { text: "COUNT THESE: 🍃🍃🍃🍃🍃", answer: 5, type: "exact", difficulty: 2 },
    { text: "PRESS BETWEEN 1 AND 4 TIMES", min: 1, max: 4, type: "range", difficulty: 2 },
    { text: "LETTERS IN 'WATER'", answer: 5, type: "exact", difficulty: 2 },
    { text: "PRESS FOR EACH CARDINAL DIRECTION", answer: 4, type: "exact", difficulty: 2 },
    { text: "STOP MEANS DON'T PRESS 🛑", answer: 0, type: "exact", difficulty: 2 },
    
    // ===== HARD (33 questions) - Rounds 20+ =====
    { text: "DON'T PRESS MORE THAN ONCE", answer: 1, type: "maximum", difficulty: 3 },
    { text: "MULTIPLY 2 x 3 AND PRESS", answer: 6, type: "exact", difficulty: 3 },
    { text: "PRESS FOR EACH EMOJI: 🐸🐸🌿", answer: 3, type: "exact", difficulty: 3 },
    { text: "PRESS TWICE FOR EVERY LEG A FROG HAS", answer: 8, type: "exact", difficulty: 3 },
    { text: "DAYS IN A WEEK MINUS 3", answer: 4, type: "exact", difficulty: 3 },
    { text: "HALF OF TEN", answer: 5, type: "exact", difficulty: 3 },
    { text: "PRESS ONLY IF THIS NUMBER IS ODD: 7", answer: 1, type: "exact", difficulty: 3 },
    { text: "3 + 4 = ?", answer: 7, type: "exact", difficulty: 3 },
    { text: "SIDES ON A TRIANGLE", answer: 3, type: "exact", difficulty: 3 },
    { text: "10 DIVIDED BY 2", answer: 5, type: "exact", difficulty: 3 },
    { text: "DON'T PRESS MORE THAN TWICE", answer: 2, type: "maximum", difficulty: 3 },
    { text: "WHEELS ON A CAR", answer: 4, type: "exact", difficulty: 3 },
    { text: "2 x 4 = ?", answer: 8, type: "exact", difficulty: 3 },
    { text: "FINGERS ON ONE HAND", answer: 5, type: "exact", difficulty: 3 },
    { text: "PRESS FOR EACH CONTINENT", answer: 7, type: "exact", difficulty: 3 },
    { text: "12 MINUS 5", answer: 7, type: "exact", difficulty: 3 },
    { text: "SIDES ON A SQUARE", answer: 4, type: "exact", difficulty: 3 },
    { text: "3 x 3 = ?", answer: 9, type: "exact", difficulty: 3 },
    { text: "DON'T PRESS MORE THAN 3 TIMES", answer: 3, type: "maximum", difficulty: 3 },
    { text: "MONTHS IN HALF A YEAR", answer: 6, type: "exact", difficulty: 3 },
    { text: "4 + 5 = ?", answer: 9, type: "exact", difficulty: 3 },
    { text: "CORNERS ON A PENTAGON", answer: 5, type: "exact", difficulty: 3 },
    { text: "2 x 5 = ?", answer: 10, type: "exact", difficulty: 3 },
    { text: "PRESS FOR EACH OCEAN", answer: 5, type: "exact", difficulty: 3 },
    { text: "15 MINUS 8", answer: 7, type: "exact", difficulty: 3 },
    { text: "LEGS ON TWO FROGS", answer: 8, type: "exact", difficulty: 3 },
    { text: "DON'T PRESS MORE THAN 4 TIMES", answer: 4, type: "maximum", difficulty: 3 },
    { text: "6 + 3 = ?", answer: 9, type: "exact", difficulty: 3 },
    { text: "SIDES ON A HEXAGON", answer: 6, type: "exact", difficulty: 3 },
    { text: "DOUBLE OF 4", answer: 8, type: "exact", difficulty: 3 },
    { text: "20 DIVIDED BY 4", answer: 5, type: "exact", difficulty: 3 },
    { text: "PRESS FOR EACH RAINBOW COLOR", answer: 7, type: "exact", difficulty: 3 },
    { text: "9 MINUS 3", answer: 6, type: "exact", difficulty: 3 },
];


// INITIALIZATION
function init() {
    createTimerSegments();
    initFireflies();
    setTheme(false);
    // Event Listeners for Game
    document.addEventListener('click', handleInput);
    document.addEventListener('touchstart', (e) => {
        handleInput(e);
    }, { passive: false });

    document.getElementById('restart-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        resetGame();

    });
    // Theme Toggle Button
    ui.themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTheme();
    });


    // Start Video System
    initVideoSystem();
}

// --- THEME SYSTEM ---
function setTheme(dark) {
    isDarkMode = dark;

    // Update button emoji
    ui.themeToggle.innerText = dark ? '🌙' : '☀️';

    // Update static background image
    const orientation = isPortrait() ? 'p' : 'l';
    const theme = dark ? 'd' : 'l';
    const bgImage = `bg${orientation}${theme}.png`;

    ui.bgStatic.style.background = `url('${bgImage}') no-repeat center center / cover`;

    // Update CSS variables for colors
    document.documentElement.style.setProperty('--primary-green', dark ? '#2a9d2a' : '#39ff14');
    document.documentElement.style.setProperty('--dim-green', dark ? '#051a05' : '#0a3d0a');
}

function toggleTheme() {
    setTheme(!isDarkMode);
}

// --- VIDEO SYSTEM LOGIC ---
function initVideoSystem() {
    // Set correct intro video source based on orientation
    const introSrc = isPortrait() ? 'bgvinp.mp4' : 'bgvinl.mp4';
    ui.vidIntro.innerHTML = `<source src="${introSrc}" type="video/mp4">`;
    ui.vidIntro.load(); // Force reload with new source

    const videos = [ui.vidIntro, ui.vidManual, ui.vidGame];
    let loadedCount = 0;

    // Preload Logic
    videos.forEach(vid => {
        vid.preload = "auto";
        // Check if already ready (cached)
        if (vid.readyState >= 3) {
            checkLoad();
        } else {
            vid.addEventListener('loadeddata', checkLoad);
            vid.addEventListener('canplay', checkLoad);
        }
    });

    // Fallback: Force start after 5 seconds if preloading gets stuck
    setTimeout(() => {
        if (loadedCount < 3) {
            console.log("Force starting video sequence...");
            startVideoSequence();
        }
    }, 5000);

    function checkLoad() {
        loadedCount++;
        // We might get multiple events per video, so simply check if all are ready enough
        const allReady = videos.every(v => v.readyState >= 2);
        if (allReady && document.getElementById('loading-screen').style.opacity !== '0') {
            startVideoSequence();
        }
    }

    // Listen for orientation changes and reload if needed
    window.addEventListener('orientationchange', handleOrientationChange);
}

function handleOrientationChange() {
    // If video sequence hasn't completed, reload with correct video
    if (!state.videoSequenceComplete) {
        location.reload();
    }
}

// function startVideoSequence() {
//     // Hide Loading Screen
//     ui.loadingScreen.classList.add('hidden');

//     // Ensure bgStatic is visible initially
//     if (ui.bgStatic) ui.bgStatic.style.zIndex = '10';

//     // STEP 1: Show Intro Video
//     ui.vidIntro.classList.add('active');

//     const playIntro = () => {
//         // Transition: Fade out Static BG to reveal Video
//         setTimeout(() => {
//             if (ui.bgStatic) {
//                 ui.bgStatic.classList.remove('active'); // Start opacity fade out
//                 setTimeout(() => {
//                     ui.bgStatic.style.display = 'none'; // Clean up
//                 }, 600);
//             }
//         }, 100);
//     };

//     // Play Intro Video (Try with audio first)
//     ui.vidIntro.play().then(() => {
//         console.log("Intro playing with audio");
//         playIntro();
//     }).catch(e => {
//         console.log("Auto-play with audio blocked, trying muted", e);
//         ui.vidIntro.muted = true;
//         ui.vidIntro.play().then(() => {
//             playIntro();
//         }).catch(err => console.error("Video play failed completely", err));
//     });

//     // Setup Transition: Intro -> Manual
//     ui.vidIntro.onended = () => {
//         ui.vidIntro.classList.remove('active'); // Fade out
//         setupManualVideo();
//     };
// }

function startVideoSequence() {
    // Hide Loading Screen
    ui.loadingScreen.classList.add('hidden');

    // Skip videos for now - just show static background and game UI
    ui.bgStatic.classList.add('active');
    ui.bgStatic.style.display = 'block';
    ui.bgStatic.style.opacity = '1';
    ui.bgStatic.style.zIndex = '1';

    // Show game UI immediately
    setTimeout(() => {
        ui.gameLayer.classList.remove('fade-hidden');
        state.videoSequenceComplete = true;
    }, 500);
}

function setupManualVideo() {
    // STEP 2: Show Manual Video (Paused) + Button
    ui.vidManual.classList.add('active');
    ui.playOverlay.classList.remove('hidden'); // Show button

    // Button Click Listener
    ui.playBtn.onclick = () => {
        ui.playBtn.onclick = null; // Remove listener
        ui.playOverlay.classList.add('hidden'); // Hide button
        ui.vidManual.play();
    };

    // Setup Transition: Manual -> Game Loop
    ui.vidManual.onended = () => {
        ui.vidManual.classList.remove('active'); // Fade out
        ui.vidManual.onended = null; // ye remove karegi listener
        setupGameLoop();
    };
}

// function setupGameLoop() {
//     // STEP 3: Start Game Loop Video
//     ui.vidGame.muted = true;
//     ui.vidGame.loop = true;   // ← ENSURE IT LOOPS
//     ui.vidGame.classList.add('active');
//     ui.vidGame.play();

//     // Reveal Game UI
//     ui.gameLayer.classList.remove('fade-hidden');
//     state.videoSequenceComplete = true;

//     ui.vidGame.onended = null;
// }

function setupGameLoop() {
    // STEP 3: Start Game Loop Video

    // Hide previous videos permanently
    ui.vidIntro.style.display = 'none';  // ← ADD
    ui.vidManual.style.display = 'none'; // ← ADD

    // Setup game video
    ui.vidGame.muted = true;
    ui.vidGame.loop = true;
    ui.vidGame.style.zIndex = '10';      // ← ADD - Force top
    ui.vidGame.classList.add('active');
    ui.vidGame.play();

    // Reveal Game UI
    ui.gameLayer.classList.remove('fade-hidden');
    state.videoSequenceComplete = true;
}
// --- GAME LOGIC ---

function createTimerSegments() {
    ui.timerContainer.innerHTML = '';
    state.segments = [];

    for (let i = 0; i < TOTAL_SEGMENTS; i++) {
        const segment = document.createElement('div');
        segment.className = 'timer-segment';

        // ✅ FIXED: Keep both transforms
        const rotation = (i / TOTAL_SEGMENTS) * 360;
        segment.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

        const bar = document.createElement('div');
        bar.className = 'segment-bar';
        segment.appendChild(bar);

        ui.timerContainer.appendChild(segment);
        state.segments.push(segment);
    }
}
function startGame() {
    state.isPlaying = true;
    state.score = 0;
    state.round = 1;
    ui.score.innerText = '0';

    // Reset optimizer state
    let lastFilledCount = -1;
    let lastColorState = '';

    switchScreen('game');
    nextRound();
}

function nextRound() {
    // 1. Select Challenge
    const difficulty = state.round < 10 ? 1 : (state.round < 20 ? 2 : 3);
    const available = challenges.filter(c => c.difficulty === difficulty);
    const challenge = available[Math.floor(Math.random() * available.length)];

    state.currentChallenge = challenge;
    state.pressCount = 0;

    // 2. Update UI
    ui.challengeText.innerText = challenge.text;
    updatePressCounter();

    // 3. Set Timer
    const reduction = Math.floor(state.round / 2) * 200;
    state.timerDuration = Math.max(MIN_TIME, MAX_TIME_BASE - reduction);
    state.timerStart = Date.now();

    // 4. Start Loop
    if (state.timerId) cancelAnimationFrame(state.timerId);
    loop();

    // Animate Challenge Text In
    ui.challengeText.classList.remove('fade-in');
    void ui.challengeText.offsetWidth; // trigger reflow
    ui.challengeText.classList.add('fade-in');

    // Set Frog to Idle
    ui.frog.className = 'frog idle';
}

function loop() {
    if (!state.isPlaying) return;

    const now = Date.now();
    const elapsed = now - state.timerStart;
    const progress = elapsed / state.timerDuration;
    const remaining = 1 - progress;

    if (progress >= 1) {
        checkAnswer(true); // true = caused by timeout
        return;
    }

    updateTimerVisuals(progress);

    // Frog Nervous State logic
    const isBusy = ui.frog.classList.contains('jump-anim') ||
        ui.frog.classList.contains('success-anim') ||
        ui.frog.classList.contains('sad-anim');

    if (remaining < 0.2 && !isBusy) {
        ui.frog.classList.add('nervous');
    } else {
        ui.frog.classList.remove('nervous');
    }

    state.timerId = requestAnimationFrame(loop);
}

function updateTimerVisuals(progress) {
    const filledCount = Math.floor(progress * TOTAL_SEGMENTS);
    const remaining = 1 - progress;

    state.segments.forEach((seg, index) => {
        if (index < filledCount) {
            seg.classList.add('active');

            // Color Logic
            if (remaining < 0.15) {
                seg.classList.remove('caution', 'warning');
                seg.classList.add('warning', 'critical');
            } else if (remaining < 0.3) {
                seg.classList.remove('caution', 'critical');
                seg.classList.add('warning'); // Red
            } else if (remaining < 0.5) {
                seg.classList.remove('warning', 'critical');
                seg.classList.add('caution'); // Yellow
            } else {
                seg.classList.remove('warning', 'caution', 'critical');
            }

        } else {
            seg.classList.remove('active', 'warning', 'caution', 'critical');
        }
    });

    // Shake effect on container when critical
    if (remaining < 0.15) {
        ui.timerContainer.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
    } else {
        ui.timerContainer.style.transform = 'none';
    }
}

function handleInput(e) {
const excludeSelectors = ['#restart-btn', '#press-counter'];
    const isExcluded = excludeSelectors.some(selector => e.target.closest(selector));
    



    // Ignore input if game UI is not active yet (Video sequence running)
    if (!state.videoSequenceComplete) return;

    if (e.type === 'touchstart') {
        e.preventDefault();
    }

    if (!state.isPlaying) {
        // Check if we are on start screen and clicked to start
        if (screens.start.classList.contains('active')) {
            startGame();
        }
        return;
    }

    // Debounce
    const now = Date.now();
    if (now - lastTapTime < TAP_DEBOUNCE) return;
    lastTapTime = now;

    // In game
    state.pressCount++;
    updatePressCounter();
    animateFrog('jump');
    createRipple(e);

    checkAnswerDuringTapping();
}

function checkAnswerDuringTapping() {
    const { type, answer, min, max } = state.currentChallenge;
    const count = state.pressCount;
    let fail = false;

    // IMMEDIATE SUCCESS (Exact matches only)
    if (type === 'exact' && count === answer) {
        onSuccess();
        return;
    }

    // IMMEDIATE FAILURE CHECKS
    if (type === 'exact' && count > answer) fail = true;
    if (type === 'maximum' && count > answer) fail = true;
    if (type === 'maximum_exclusive' && count >= answer) fail = true;
    if (type === 'range' && count > max) fail = true;
    if (answer === 0 && count > 0) fail = true; // For "Never press" challenges

    if (fail) {
        gameOver("WRONG COUNT!");
    }
}

function checkAnswer(isTimeout) {
    if (!state.isPlaying) return;

    const { type, answer, min, max, condition } = state.currentChallenge;
    const count = state.pressCount;
    let success = false;

    if (type === 'minimum') {
        if (count > answer) success = true;
    } else if (type === 'maximum') {
        if (count <= answer) success = true;
    } else if (type === 'maximum_exclusive') {
        if (count < answer) success = true;
    } else if (type === 'range') {
        if (count >= min && count <= max) success = true;
    } else if (type === 'condition') {
        if (condition === 'even' && count % 2 === 0) success = true;
        if (condition === 'odd' && count % 2 !== 0) success = true;
    }

    // Special case for "Never Press" which is essentially exact 0 or max 0
    if (answer === 0 && count === 0) {
        success = true;
    }

    if (success) {
        onSuccess();
    } else {
        gameOver("TIME'S UP!");
    }
}

function onSuccess() {
    playSound('success');
    state.score++;

    ui.frog.className = 'frog success-anim';
    createFloatingScore();

    cancelAnimationFrame(state.timerId);
    setTimeout(() => {
        state.round++;
        ui.score.innerText = state.score;
        nextRound();
    }, 500);
}

function gameOver(reason) {
    state.isPlaying = false;
    cancelAnimationFrame(state.timerId);

    ui.frog.className = 'frog sad-anim';

    if (state.score > highScore) {
        highScore = state.score;
        localStorage.setItem('frog_high_score', highScore);
        ui.highScore.innerText = highScore;
    }

    ui.finalScore.innerText = state.score;

    setTimeout(() => {
        switchScreen('end');
        playSound('fail');
    }, 1000);
}

function resetGame() {
    switchScreen('start');
    ui.frog.className = 'frog idle';
}

// UI HELPERS
function updatePressCounter() {
    ui.pressCounter.innerText = `${state.pressCount} PRESSES`;
    ui.pressCounter.classList.remove('bounce-anim');
    void ui.pressCounter.offsetWidth;
    ui.pressCounter.classList.add('bounce-anim');
}

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function animateFrog(type) {
    ui.frog.className = 'frog';
    void ui.frog.offsetWidth;

    if (type === 'jump') ui.frog.classList.add('jump-anim');
}

function createRipple(e) {
    let x, y;
    if (e.changedTouches && e.changedTouches.length > 0) {
        x = e.changedTouches[0].clientX;
        y = e.changedTouches[0].clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }

    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    ui.touchLayer.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

function createFloatingScore() {
    const el = document.createElement('div');
    el.innerText = "+1";
    el.className = 'floating-score';
    el.style.left = '50%';
    el.style.top = '40%';
    el.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

// FIREFLIES
function initFireflies() {
    const container = document.getElementById('ambient-layer');
    if (!container) return; // Might be removed in HTML

    const existing = container.querySelectorAll('.firefly');
    existing.forEach(e => e.remove());

    for (let i = 0; i < 5; i++) {
        const f = document.createElement('div');
        f.className = 'firefly';
        f.style.left = Math.random() * 100 + '%';
        f.style.top = Math.random() * 100 + '%';
        f.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(f);
    }
}

// AUDIO SYSTEM
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }
}

const shareScreen = document.getElementById('share-screen');
const downloadBtn = document.getElementById('download-btn');
const shareTwitterBtn = document.getElementById('share-twitter');
const shareWhatsappBtn = document.getElementById('share-whatsapp');
const shareFacebookBtn = document.getElementById('share-facebook');
const sharePlayAgainBtn = document.getElementById('share-play-again');
const screenshotPreview = document.getElementById('screenshot-preview');
const previewScore = document.getElementById('preview-score');
const previewBest = document.getElementById('preview-best');

// Add screen to screens object
screens.share = shareScreen;

// Function to show share screen
function showShareScreen() {
    // Update preview with current scores
    previewScore.innerText = state.score;
    previewBest.innerText = highScore;
    
    switchScreen('share');
}

// Function to create and download screenshot
// Function to create and download screenshot
function downloadScreenshot() {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Load the frog image first
    const frogImage = new Image();
    frogImage.src = 'frog styling.png';

    frogImage.onload = function() {
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a2a1a');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.fillStyle = '#ff3b30';
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, 120);

        // Draw the frog image
        ctx.drawImage(frogImage, canvas.width / 2 - 40, 140, 80, 80);

        // Score label
        ctx.fillStyle = '#81c784';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('FINAL SCORE', canvas.width / 2, 300);

        // Score value - GREEN WITH GLOW effect
        ctx.fillStyle = '#39ff14';
        ctx.font = 'bold 80px Arial';
        ctx.fillText(state.score, canvas.width / 2, 400);

        // Best score
        ctx.fillStyle = '#81c784';
        ctx.font = '20px Arial';
        ctx.fillText(`Best: ${highScore}`, canvas.width / 2, 400);

        // Challenge text
        ctx.fillStyle = '#39ff14';
        ctx.font = '16px Arial';
        ctx.fillText('Can you beat this score?', canvas.width / 2, 460);

        // Footer
        ctx.fillStyle = '#999';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('🐸 FROG PRESS 🐸', canvas.width / 2, 660);

        // Download
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `frog-press-score-${state.score}.png`;
        link.click();
    };

    frogImage.onerror = function() {
        console.error('Failed to load frog styling.png');
        alert('Failed to load frog image. Please check if the file exists.');
    };
}

// Share functions
function shareViaTwitter() {
    downloadScreenshot();
    const text = `hey @mrpunkdoteth 🐸 I scored ${state.score} points in $FROG PRESS! Can you beat my score? 🎮 #frogs #FrogPress`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
}


// Event listeners for share buttons
downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadScreenshot();
});

shareTwitterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    shareViaTwitter();
});


sharePlayAgainBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetGame();
});

// Modify gameOver function to show share screen instead of end screen
// REPLACE the existing gameOver function with this:
function gameOver(reason) {
    state.isPlaying = false;
    cancelAnimationFrame(state.timerId);

    ui.frog.className = 'frog sad-anim';

    if (state.score > highScore) {
        highScore = state.score;
        localStorage.setItem('frog_high_score', highScore);
        ui.highScore.innerText = highScore;
    }

    ui.finalScore.innerText = state.score;

    setTimeout(() => {
        showShareScreen(); // Changed from switchScreen('end')
        playSound('fail');
    }, 1000);
}


// Start
init();
