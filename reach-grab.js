/**
 * RehabVerse VR - Reach & Grab Simulation
 * Controls object spawning, arm manipulation, and collision logic
 */

document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const armLeft = document.getElementById('armLeft');
    const armRight = document.getElementById('armRight');
    const targetContainer = document.getElementById('targetContainer');
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');

    const repCountEl = document.getElementById('repCount');
    const accuracyEl = document.getElementById('accuracyVal');
    const romValEl = document.getElementById('romVal');
    const romFillEl = document.querySelector('.rom-fill');

    // Controls
    const btnDifficulty = document.querySelectorAll('.btn-toggle');
    const btnRestart = document.getElementById('btnRestart');
    const btnSlowMo = document.getElementById('btnSlowMo');

    // State
    let state = {
        reps: 0,
        attempts: 0,
        difficulty: 'medium', // easy, medium, hard
        isSlowMo: false,
        activeTarget: null,
        isReaching: false
    };

    // Configuration
    const CONFIG = {
        easy: { speed: 3000, radius: 100 },
        medium: { speed: 2000, radius: 150 },
        hard: { speed: 1200, radius: 180 }
    };

    let gameLoop;

    // Initialize
    init();

    function init() {
        spawnTarget();
        setupEventListeners();
    }

    function setupEventListeners() {
        // Difficulty Toggles
        btnDifficulty.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update UI
                btnDifficulty.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update State
                state.difficulty = btn.dataset.level;
                setStatus(`Difficulty set to ${state.difficulty.toUpperCase()}`, 'var(--primary-color)');
            });
        });

        // Restart
        btnRestart.addEventListener('click', resetSimulation);

        // Slow Mo
        btnSlowMo.addEventListener('click', () => {
            state.isSlowMo = !state.isSlowMo;
            btnSlowMo.classList.toggle('active');
            setStatus(state.isSlowMo ? 'Slow Motion Active' : 'Normal Speed', 'var(--accent-secondary)');
        });

        // Click on viewport to simulate "reach"
        const viewport = document.getElementById('simViewport');
        viewport.addEventListener('click', (e) => {
            if (!state.activeTarget || state.isReaching) return;
            handleReach(e);
        });
    }

    // --- Core Logic ---

    function spawnTarget() {
        if (state.activeTarget) return;

        const target = document.createElement('div');
        target.classList.add('target-obj');

        // Random Position (Front View)
        // Center is 50%, 50%
        // We want targets roughly around the shoulders/head area
        const settings = CONFIG[state.difficulty];
        const angle = Math.random() * Math.PI; // Top semi-circle
        const r = 100 + Math.random() * 100; // Radius from chest center

        // Convert polar to cartesian offsets relative to center (approx)
        // Adjusting for CSS % positioning
        const left = 50 + (Math.cos(angle) * 30); // Random visual distribution
        const top = 40 - (Math.sin(angle) * 20);

        target.style.left = `${left}%`;
        target.style.top = `${top}%`;

        targetContainer.appendChild(target);
        state.activeTarget = target;
        state.attempts++;

        // Update Accuracy
        updateStats();

        setStatus('Target Appeared - Reach!', 'var(--accent-secondary)');
    }

    function handleReach(event) {
        if (!state.activeTarget) return;

        state.isReaching = true;
        const target = state.activeTarget;
        const targetRect = target.getBoundingClientRect();

        // Determine which arm to use (Left or Right side of screen)
        const viewportRect = document.getElementById('simViewport').getBoundingClientRect();
        const centerX = viewportRect.left + viewportRect.width / 2;
        const isRightSide = targetRect.left + targetRect.width / 2 > centerX;

        const arm = isRightSide ? armRight : armLeft;

        // 1. Animate Arm (Simple Rotation Logic for visual effect)
        // Calculate angle to target
        const armRect = arm.getBoundingClientRect();
        const dy = targetRect.top - armRect.top;
        const dx = targetRect.left - armRect.left;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90; // Offset for default vertical pose

        // Clamp Angle so it looks realistic
        const reachAngle = Math.max(-160, Math.min(160, angle));

        // Apply Transform
        arm.style.transform = `rotate(${reachAngle}deg)`;
        arm.querySelector('.hand').classList.add('grabbing');

        // 2. Check Hit (Simulated Success for demo)
        setTimeout(() => {
            // Success!
            target.classList.add('grabbed');
            state.reps++;
            updateStats();

            // Random ROM increment
            const rom = 90 + Math.floor(Math.random() * 40);
            updateRom(rom);

            // Cleanup
            setTimeout(() => {
                target.remove();
                state.activeTarget = null;
                arm.style.transform = 'rotate(0deg)';
                arm.querySelector('.hand').classList.remove('grabbing');
                state.isReaching = false;

                // Spawn next
                setTimeout(spawnTarget, state.isSlowMo ? 1500 : 800);
            }, 500);

        }, state.isSlowMo ? 1000 : 500); // Travel time
    }

    // --- Helpers ---

    function updateStats() {
        repCountEl.textContent = state.reps;

        const acc = state.reps > 0 ? Math.round((state.reps / state.attempts) * 100) : 100;
        accuracyEl.textContent = `${acc}%`;
    }

    function updateRom(degrees) {
        romValEl.textContent = `${degrees}°`;
        romFillEl.style.width = `${Math.min(100, (degrees / 180) * 100)}%`;
    }

    function setStatus(text, color) {
        statusText.textContent = text;
        statusDot.style.backgroundColor = color;
        statusDot.style.boxShadow = `0 0 10px ${color}`;
    }

    function resetSimulation() {
        if (state.activeTarget) state.activeTarget.remove();
        state.activeTarget = null;
        state.reps = 0;
        state.attempts = 0;
        state.isReaching = false;

        armLeft.style.transform = 'rotate(0deg)';
        armRight.style.transform = 'rotate(0deg)';

        updateStats();
        updateRom(0);

        setTimeout(spawnTarget, 1000);
        setStatus('Simulation Restarted', 'var(--primary-color)');
    }

});
