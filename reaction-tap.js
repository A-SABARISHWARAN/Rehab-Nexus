/**
 * RehabVerse VR - Reaction Tap Simulation
 * Controls game loop, target spawning, scoring, and reaction analysis
 */

document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const tapLayer = document.getElementById('tapLayer');
    const overlay = document.getElementById('gameOverlay');
    const armLeft = document.getElementById('armLeft');
    const armRight = document.getElementById('armRight');

    const scoreVal = document.getElementById('scoreVal');
    const comboVal = document.getElementById('comboVal');
    const avgTimeEl = document.getElementById('avgTime');
    const focusFill = document.getElementById('focusFill');
    const gradeVal = document.getElementById('gradeVal');
    const statusMsg = document.getElementById('statusMsg');

    // Controls
    const btnStart = document.getElementById('btnStartGame');
    const btnRestart = document.getElementById('btnRestart');
    const btnSpeed = document.getElementById('btnSpeed');

    // State
    let gameActive = false;
    let score = 0;
    let combo = 1;
    let reactionTimes = [];
    let isSpeedMode = false;
    let targetTimeout;

    // Config
    const CONFIG = {
        baseDelay: 2000,
        speedDelay: 800,
        decay: 0.95 // Speed increases slightly each hit
    };

    let currentDelay = CONFIG.baseDelay;

    // Initialize
    btnStart.addEventListener('click', startGame);
    btnRestart.addEventListener('click', resetGame);
    btnSpeed.addEventListener('click', () => {
        isSpeedMode = !isSpeedMode;
        btnSpeed.classList.toggle('active');
        statusMsg.textContent = isSpeedMode ? 'Speed Mode Ready!' : 'Normal Mode Ready';
    });

    // --- Core Logic ---

    function startGame() {
        gameActive = true;
        overlay.classList.add('hidden');
        statusMsg.textContent = 'Focus...';

        currentDelay = isSpeedMode ? CONFIG.speedDelay : CONFIG.baseDelay;

        scheduleNextTarget();
    }

    function scheduleNextTarget() {
        if (!gameActive) return;

        const delay = Math.random() * 1000 + currentDelay;

        targetTimeout = setTimeout(() => {
            spawnTarget();
        }, delay);
    }

    function spawnTarget() {
        if (!gameActive) return;

        // Position Logic (Random within viewport)
        // 10% - 90% range to avoid edges
        const left = 10 + Math.random() * 80;
        const top = 10 + Math.random() * 60; // Keep in upper section

        const target = document.createElement('div');
        target.classList.add('tap-target');
        target.style.left = `${left}%`;
        target.style.top = `${top}%`;

        const spawnTime = Date.now();

        // Click Listener
        target.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent double triggers
            handleHit(target, spawnTime);
        });

        // Auto-remove if missed (Timeout)
        const lifetime = isSpeedMode ? 1500 : 3000;
        setTimeout(() => {
            if (target && target.parentNode) {
                handleMiss(target);
            }
        }, lifetime);

        tapLayer.appendChild(target);
    }

    function handleHit(target, spawnTime) {
        if (target.classList.contains('hit')) return;

        // 1. Calculate Reaction
        const reactionTime = Date.now() - spawnTime;
        reactionTimes.push(reactionTime);

        // 2. Score & Combo
        combo = Math.min(combo + 1, 10);
        const points = Math.round((1000 / reactionTime) * 10) * combo;
        score += points;

        // 3. Visuals
        target.classList.add('hit');
        animateArm(target);

        // 4. Feedback Logic
        updateHUD();
        currentDelay *= CONFIG.decay; // Increase speed

        // Cleanup
        setTimeout(() => target.remove(), 200);

        // Next
        scheduleNextTarget();
    }

    function handleMiss(target) {
        target.remove();
        combo = 1; // Reset combo
        statusMsg.textContent = 'Missed!';
        statusMsg.style.color = 'red';
        setTimeout(() => {
            if (gameActive) {
                statusMsg.textContent = 'Keep going!';
                statusMsg.style.color = '';
            }
        }, 500);
        updateHUD();
        scheduleNextTarget();
    }

    function animateArm(targetEl) {
        // Quick visual reaction from nearest arm
        const targetRect = targetEl.getBoundingClientRect();
        const viewportRect = document.getElementById('gameViewport').getBoundingClientRect();

        // Decide left/right arm
        const isRight = (targetRect.left + targetRect.width / 2) > (viewportRect.left + viewportRect.width / 2);
        const arm = isRight ? armRight : armLeft;

        // Add "Punch/Tap" animation class
        arm.style.transform = `scaleY(0.9) translateY(-10px) rotate(${isRight ? -10 : 10}deg)`;
        setTimeout(() => {
            arm.style.transform = 'none';
        }, 100);
    }

    // --- Helpers ---

    function updateHUD() {
        scoreVal.textContent = score.toLocaleString();
        comboVal.textContent = `x${combo}`;

        if (reactionTimes.length > 0) {
            const avg = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
            avgTimeEl.textContent = `${avg} ms`;

            // Grading
            let grade = 'C';
            if (avg < 400) grade = 'B';
            if (avg < 300) grade = 'A';
            if (avg < 250) grade = 'S';
            gradeVal.textContent = grade;

            // Focus Bar (based on combo)
            focusFill.style.width = `${Math.min(100, combo * 10)}%`;
        }
    }

    function resetGame() {
        clearTimeout(targetTimeout);
        tapLayer.innerHTML = '';
        gameActive = false;
        score = 0;
        combo = 1;
        reactionTimes = [];
        currentDelay = CONFIG.baseDelay;

        updateHUD();
        overlay.classList.remove('hidden');
        statusMsg.textContent = 'Game Reset';
    }

});
