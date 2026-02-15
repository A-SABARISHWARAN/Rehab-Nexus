/**
 * RehabVerse VR - Balance Walk Simulation
 * Controls animation states, UI feedback, and interactivity
 */

document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const humanModel = document.getElementById('humanModel');
    const football = document.getElementById('football');
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');
    const feedbackTooltip = document.getElementById('feedbackTooltip');
    const btnRestart = document.getElementById('btnRestart');
    const btnSlowMo = document.getElementById('btnSlowMo');
    const btnInsights = document.getElementById('btnInsights');
    const insightsPanel = document.getElementById('insightsPanel');

    // State
    let isKicking = false;
    let isSlowMo = false;
    let loopInterval;

    // Initialize
    startWalkingLoop();
    updateTooltip('Calibrating Gait...', 1000);

    // Event Listeners
    btnRestart.addEventListener('click', restartSimulation);
    btnSlowMo.addEventListener('click', toggleSlowMotion);
    btnInsights.addEventListener('click', () => {
        insightsPanel.classList.toggle('visible');
        btnInsights.classList.toggle('active');
    });

    // --- Core Logic ---

    function startWalkingLoop() {
        // Reset State
        isKicking = false;
        humanModel.classList.remove('kicking');
        football.classList.remove('kicked');
        football.style.opacity = '1';

        setStatus('Walking - Acquiring Balance', 'var(--accent-secondary)');

        // Random Kick Interval
        scheduleNextKick();
    }

    function scheduleNextKick() {
        if (loopInterval) clearTimeout(loopInterval);

        const randomDelay = Math.random() * 3000 + 3000; // 3-6 seconds

        loopInterval = setTimeout(() => {
            performKick();
        }, randomDelay);
    }

    function performKick() {
        if (humanModel.classList.contains('kicking')) return; // Prevent overlap
        isKicking = true;

        // 1. FREEZE: Stop walking immediately
        humanModel.classList.add('freezing');
        setStatus('Gait Pause - Stabilizing', 'var(--primary-light)');
        updateTooltip('Stabilizing...', 0);

        // 2. WIND-UP: After brief pause, start wind-up
        setTimeout(() => {
            humanModel.classList.remove('freezing');
            humanModel.classList.add('kicking'); // This plays the kick animation (windup -> kick -> return)

            setStatus('Single Leg Stance - Kicking', 'var(--primary-color)');
            updateTooltip('Kicking Motion Detect', 0);

            // 3. CONTACT: Synced with animation frame (approx 40% of 1.2s)
            setTimeout(() => {
                football.classList.add('kicked');
                playSound('swish');
            }, 600); // Timing matched to CSS keyframe release

            // 4. RESET: Animation ends
            setTimeout(() => {
                humanModel.classList.remove('kicking');
                football.classList.remove('kicked');
                football.style.left = ''; // Clear inline style to revert to CSS calc()
                football.style.opacity = '1';

                // Resume Walking
                startWalkingLoop();
            }, 1400); // 1.2s animation + buffer

        }, 300); // 300ms freeze time
    }

    function restartSimulation() {
        // Clear existing loops
        clearTimeout(loopInterval);

        // Reset Visuals
        humanModel.classList.remove('kicking');
        humanModel.style.animation = 'none';
        humanModel.offsetHeight; /* trigger reflow */
        humanModel.style.animation = null;

        football.classList.remove('kicked');
        football.style.opacity = '1';

        updateTooltip('Simulation Restarted', 2000);
        startWalkingLoop();
    }

    function toggleSlowMotion() {
        isSlowMo = !isSlowMo;
        const duration = isSlowMo ? '4s' : '2s'; // Normal is 2s, Slow is 4s

        // Update CSS variables for all animated children
        const animatedParts = document.querySelectorAll('.arm, .leg, .leg-right, .leg-left, .thigh, .calf');
        animatedParts.forEach(part => {
            part.style.animationDuration = duration;
        });

        btnSlowMo.classList.toggle('active');
        updateTooltip(isSlowMo ? 'Slow Motion Active' : 'Normal Speed', 1500);
    }

    // --- Helpers ---

    function setStatus(text, color) {
        statusText.textContent = text;
        statusDot.style.backgroundColor = color;
        statusDot.style.boxShadow = `0 0 10px ${color}`;
    }

    function updateTooltip(text, hideAfterMs = 0) {
        feedbackTooltip.textContent = text;
        feedbackTooltip.style.opacity = '1';

        if (hideAfterMs > 0) {
            setTimeout(() => {
                feedbackTooltip.style.opacity = '0';
            }, hideAfterMs);
        }
    }

    // Placeholder for sound
    function playSound(type) {
        // In real app, play audio buffer
    }

});
