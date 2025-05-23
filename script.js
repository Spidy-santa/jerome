// Game State
let score = 0;
let balloonsPopped = 0;
let candlesBlown = 0;
let soundEnabled = true;
let achievements = {
    firstBlow: false,
    allCandles: false,
    speedDemon: false,
    balloonMaster: false,
    wishMaker: false,
    scoreHunter: false
};

// Sound Effects (using Web Audio API for better performance)
let audioContext = null;
const sounds = {};

// Initialize audio context safely
function initAudioContext() {
    try {
        if (!audioContext && (window.AudioContext || window.webkitAudioContext)) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Handle audio context state for Chrome's autoplay policy
            if (audioContext.state === 'suspended') {
                const resumeAudio = () => {
                    audioContext.resume().then(() => {
                        console.log('Audio context resumed');
                        document.removeEventListener('click', resumeAudio);
                        document.removeEventListener('touchstart', resumeAudio);
                    }).catch(err => {
                        console.warn('Failed to resume audio context:', err);
                    });
                };
                document.addEventListener('click', resumeAudio);
                document.addEventListener('touchstart', resumeAudio);
            }
        }
    } catch (error) {
        console.warn('Web Audio API not supported or failed to initialize:', error);
        audioContext = null;
    }
}

// DOM Elements
const scoreElement = document.getElementById('score');
const blowButton = document.getElementById('blow-candles');
const balloonContainer = document.getElementById('balloon-container');
const newBalloonBtn = document.getElementById('new-balloon');
const balloonsCountElement = document.getElementById('balloons-popped');
const submitWishBtn = document.getElementById('submit-wish');
const visitorNameInput = document.getElementById('visitor-name');
const birthdayWishTextarea = document.getElementById('birthday-wish');
const wishesDisplay = document.getElementById('wishes-display');
const jeromePhoto = document.getElementById('jerome-photo');
const soundToggle = document.getElementById('sound-toggle');

// Sound System
function createSound(frequency, duration, type = 'sine') {
    if (!soundEnabled) return;

    // Initialize audio context if not already done
    if (!audioContext) {
        initAudioContext();
    }

    if (!audioContext || audioContext.state === 'suspended') {
        console.warn('Audio context not available or suspended');
        return;
    }

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.warn('Failed to create sound:', error);
    }
}

function playSound(soundType) {
    if (!soundEnabled) return;

    switch(soundType) {
        case 'blow':
            createSound(200, 0.3, 'sawtooth');
            setTimeout(() => createSound(150, 0.2, 'sine'), 100);
            break;
        case 'pop':
            createSound(800, 0.1, 'square');
            setTimeout(() => createSound(400, 0.1, 'triangle'), 50);
            break;
        case 'score':
            createSound(523, 0.2, 'sine'); // C note
            setTimeout(() => createSound(659, 0.2, 'sine'), 100); // E note
            break;
        case 'achievement':
            createSound(523, 0.15, 'sine');
            setTimeout(() => createSound(659, 0.15, 'sine'), 100);
            setTimeout(() => createSound(784, 0.15, 'sine'), 200);
            setTimeout(() => createSound(1047, 0.3, 'sine'), 300);
            break;
        case 'wish':
            createSound(440, 0.2, 'sine');
            setTimeout(() => createSound(554, 0.2, 'sine'), 150);
            setTimeout(() => createSound(659, 0.3, 'sine'), 300);
            break;
    }
}

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    // Initialize audio context early
    initAudioContext();

    loadWishes();
    loadAchievements();
    updateScore();
    createInitialBalloons();
    setupPhotoFallback();
    setupSoundToggle();
    setupMicrophoneBlowing();
    setupVotingPoll();

    // Add some initial confetti
    setTimeout(() => {
        createConfetti(20);
    }, 1000);

    // Load saved sound preference
    const savedSoundState = localStorage.getItem('jeromesBirthdaySoundEnabled');
    if (savedSoundState !== null) {
        soundEnabled = savedSoundState === 'true';
        updateSoundToggle();
    }
});

// Score Management
function updateScore() {
    scoreElement.textContent = score;

    // Save score to localStorage
    localStorage.setItem('jeromesBirthdayScore', score);

    // Check for score-based achievements
    checkScoreAchievements();

    // Trigger confetti for score milestones
    if (score > 0 && score % 100 === 0) {
        createConfetti(25);
        playSound('achievement');
    }
}

function addScore(points) {
    score += points;
    updateScore();
    playSound('score');

    // Show score popup
    showScorePopup(points);
}

function showScorePopup(points) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${points} points!`;
    popup.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(45deg, var(--accent-purple), var(--accent-cyan));
        color: white;
        padding: 12px 25px;
        border-radius: 25px;
        font-weight: bold;
        font-family: 'Space Grotesk', sans-serif;
        z-index: 1000;
        animation: scorePopup 2s ease forwards;
        box-shadow: 0 8px 25px var(--shadow-dark);
        backdrop-filter: blur(10px);
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 2000);
}

// Achievement System
function checkScoreAchievements() {
    if (score >= 100 && !achievements.scoreHunter) {
        unlockAchievement('scoreHunter', 'Score Hunter - Reached 100 points!');
    }
}

function unlockAchievement(achievementKey, message) {
    if (achievements[achievementKey]) return; // Already unlocked

    achievements[achievementKey] = true;
    saveAchievements();

    // Visual feedback
    const achievementElement = document.getElementById(achievementKey.replace(/([A-Z])/g, '-$1').toLowerCase());
    if (achievementElement) {
        achievementElement.classList.add('unlocked');
    }

    // Show achievement notification
    showAchievementNotification(message);
    playSound('achievement');
    createConfetti(30);
}

function showAchievementNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-desc">${message}</div>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--glass-bg);
        backdrop-filter: blur(15px);
        border: 1px solid var(--glass-border);
        color: var(--text-white);
        padding: 20px;
        border-radius: 15px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 8px 25px var(--shadow-dark);
        animation: slideIn 0.5s ease, slideOut 0.5s ease 4s forwards;
        max-width: 300px;
    `;

    const style = document.createElement('style');
    style.textContent = `
        .achievement-icon { font-size: 2rem; }
        .achievement-title { font-weight: 600; margin-bottom: 5px; }
        .achievement-desc { font-size: 0.9rem; opacity: 0.8; }
        @keyframes slideOut {
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 5000);
}

function loadAchievements() {
    const saved = localStorage.getItem('jeromesBirthdayAchievements');
    if (saved) {
        achievements = { ...achievements, ...JSON.parse(saved) };
        updateAchievementDisplay();
    }
}

function saveAchievements() {
    localStorage.setItem('jeromesBirthdayAchievements', JSON.stringify(achievements));
}

function updateAchievementDisplay() {
    Object.keys(achievements).forEach(key => {
        if (achievements[key]) {
            const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) {
                element.classList.add('unlocked');
            }
        }
    });
}

// Add CSS for score popup animation
const style = document.createElement('style');
style.textContent = `
    @keyframes scorePopup {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.8); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.1); }
        80% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.8); }
    }
`;
document.head.appendChild(style);

// Sound and Microphone Setup
function setupSoundToggle() {
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('jeromesBirthdaySoundEnabled', soundEnabled);
        updateSoundToggle();

        if (soundEnabled) {
            playSound('score');
        }
    });
}

function updateSoundToggle() {
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggle.title = soundEnabled ? 'Sound On' : 'Sound Off';
}

function setupMicrophoneBlowing() {
    // Check if we're on HTTPS or localhost (required for microphone access)
    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';

    if (!isSecureContext) {
        console.warn('Microphone access requires HTTPS or localhost');
        return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        })
            .then(stream => {
                // Use the global audio context or create a new one
                if (!audioContext) {
                    initAudioContext();
                }

                if (!audioContext) {
                    console.warn('Audio context not available for microphone');
                    return;
                }

                try {
                    const analyser = audioContext.createAnalyser();
                    const microphone = audioContext.createMediaStreamSource(stream);
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);

                    microphone.connect(analyser);
                    analyser.fftSize = 256;
                    analyser.smoothingTimeConstant = 0.8;

                    let blowDetected = false;
                    let isActive = true;

                    function detectBlow() {
                        if (!isActive) return;

                        try {
                            analyser.getByteFrequencyData(dataArray);
                            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

                            // Adjusted threshold for better detection
                            if (average > 40 && !blowDetected) {
                                blowDetected = true;
                                blowCandles();
                                setTimeout(() => { blowDetected = false; }, 1500);
                            }

                            requestAnimationFrame(detectBlow);
                        } catch (error) {
                            console.warn('Error in microphone detection:', error);
                            isActive = false;
                        }
                    }

                    detectBlow();

                    // Clean up on page unload
                    window.addEventListener('beforeunload', () => {
                        isActive = false;
                        stream.getTracks().forEach(track => track.stop());
                    });

                } catch (error) {
                    console.warn('Failed to setup microphone analysis:', error);
                    stream.getTracks().forEach(track => track.stop());
                }
            })
            .catch(err => {
                console.log('Microphone access denied or not available:', err.message);
                // Show user-friendly message
                if (err.name === 'NotAllowedError') {
                    console.log('Microphone permission denied. You can still use the button or spacebar to blow candles!');
                } else if (err.name === 'NotFoundError') {
                    console.log('No microphone found. You can still use the button or spacebar to blow candles!');
                }
            });
    } else {
        console.log('getUserMedia not supported. You can still use the button or spacebar to blow candles!');
    }
}

// Candle Blowing Game
blowButton.addEventListener('click', blowCandles);

// Add keyboard support for blowing candles
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        blowCandles();
    }
});

let blowStartTime = null;

function blowCandles() {
    const flames = document.querySelectorAll('.flame:not(.blown-out)');

    if (flames.length === 0) {
        // All candles are blown out, relight them
        relightCandles();
        return;
    }

    // Track timing for speed achievement
    if (flames.length === 5) {
        blowStartTime = Date.now();
    }

    // First blow achievement
    if (!achievements.firstBlow) {
        unlockAchievement('firstBlow', 'First Blow - You blew out your first candle!');
    }

    // Blow out a random candle with visual effect
    const randomFlame = flames[Math.floor(Math.random() * flames.length)];
    randomFlame.classList.add('blown-out');

    // Add smoke effect
    createSmokeEffect(randomFlame);

    candlesBlown++;
    addScore(15);
    playSound('blow');

    // Update button text
    const remainingFlames = document.querySelectorAll('.flame:not(.blown-out)').length;
    blowButton.querySelector('.btn-text').textContent =
        remainingFlames > 0 ? `Blow Candles (${remainingFlames} left)` : 'All Out!';

    // Check if all candles are blown out
    if (remainingFlames === 0) {
        setTimeout(() => {
            createConfetti(40);
            addScore(75); // Bonus for blowing out all candles
            blowButton.querySelector('.btn-text').textContent = 'Relight Candles';

            // Check for speed achievement
            if (blowStartTime && Date.now() - blowStartTime < 5000 && !achievements.speedDemon) {
                unlockAchievement('speedDemon', 'Speed Demon - Blew out all candles in under 5 seconds!');
            }

            // All candles achievement
            if (!achievements.allCandles) {
                unlockAchievement('allCandles', 'Wish Master - Blew out all candles!');
            }
        }, 500);
    }
}

function createSmokeEffect(flame) {
    const smoke = document.createElement('div');
    smoke.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, #666 0%, transparent 70%);
        border-radius: 50%;
        opacity: 0.7;
        animation: smokeRise 2s ease-out forwards;
        pointer-events: none;
        z-index: 20;
    `;

    flame.parentElement.appendChild(smoke);

    // Add smoke animation
    const smokeStyle = document.createElement('style');
    smokeStyle.textContent = `
        @keyframes smokeRise {
            0% {
                transform: translateX(-50%) translateY(0) scale(0.5);
                opacity: 0.7;
            }
            100% {
                transform: translateX(-50%) translateY(-50px) scale(1.5);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(smokeStyle);

    setTimeout(() => {
        smoke.remove();
        smokeStyle.remove();
    }, 2000);
}

function relightCandles() {
    const flames = document.querySelectorAll('.flame');
    flames.forEach(flame => {
        flame.classList.remove('blown-out');
    });
    blowButton.querySelector('.btn-text').textContent = 'Blow Candles';
    addScore(10); // Small bonus for relighting
    playSound('score');
    blowStartTime = null;
}

// Voting Poll System
function setupVotingPoll() {
    const pollOptions = document.querySelectorAll('.poll-option');
    const resetButton = document.getElementById('reset-poll');

    // Load existing votes
    loadVotes();

    // Add click handlers to poll options
    pollOptions.forEach(option => {
        option.addEventListener('click', () => {
            const optionKey = option.dataset.option;
            vote(optionKey);
        });
    });

    // Reset poll handler (only if reset button exists)
    if (resetButton) {
        resetButton.addEventListener('click', resetPoll);
    }
}

function vote(optionKey) {
    // Check if user has already voted
    const hasVoted = localStorage.getItem('jeromesBirthdayVoted');
    if (hasVoted) {
        showVoteMessage('You have already voted! Thank you for participating.', 'info');
        return;
    }

    // Get current votes
    let votes = JSON.parse(localStorage.getItem('jeromesBirthdayVotes') || '{}');

    // Initialize if doesn't exist
    if (!votes[optionKey]) {
        votes[optionKey] = 0;
    }

    // Add vote
    votes[optionKey]++;

    // Save votes and mark user as voted
    localStorage.setItem('jeromesBirthdayVotes', JSON.stringify(votes));
    localStorage.setItem('jeromesBirthdayVoted', 'true');

    // Update display
    updateVoteDisplay();

    // Visual feedback
    const option = document.querySelector(`[data-option="${optionKey}"]`);
    option.classList.add('voted');

    // Add score and sound
    addScore(20);
    playSound('score');
    createConfetti(15);

    showVoteMessage('Thank you for voting! 🎉', 'success');
}

function loadVotes() {
    updateVoteDisplay();
}

function updateVoteDisplay() {
    const votes = JSON.parse(localStorage.getItem('jeromesBirthdayVotes') || '{}');
    const options = ['tea-shop', 'bakery', 'hotel', 'adventure'];

    // Calculate total votes
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    document.getElementById('total-votes').textContent = totalVotes;

    // Update each option
    options.forEach(option => {
        const voteCount = votes[option] || 0;
        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

        // Update count display
        const countElement = document.getElementById(`${option}-count`);
        countElement.textContent = `${voteCount} vote${voteCount !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)`;

        // Update progress bar
        const fillElement = document.getElementById(`${option}-fill`);
        fillElement.style.width = `${percentage}%`;
    });

    // Mark as voted if user has voted
    const hasVoted = localStorage.getItem('jeromesBirthdayVoted');
    if (hasVoted) {
        document.querySelectorAll('.poll-option').forEach(option => {
            option.style.cursor = 'default';
            option.style.opacity = '0.8';
        });
    }
}

function resetPoll() {
    if (confirm('Are you sure you want to reset all votes? This action cannot be undone.')) {
        localStorage.removeItem('jeromesBirthdayVotes');
        localStorage.removeItem('jeromesBirthdayVoted');

        // Reset visual state
        document.querySelectorAll('.poll-option').forEach(option => {
            option.classList.remove('voted');
            option.style.cursor = 'pointer';
            option.style.opacity = '1';
        });

        updateVoteDisplay();
        showVoteMessage('Poll has been reset! 🔄', 'info');
        playSound('score');
    }
}

function showVoteMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `vote-message vote-message-${type}`;
    messageDiv.textContent = message;

    const colors = {
        success: 'var(--accent-cyan)',
        info: 'var(--accent-purple)',
        error: '#e74c3c'
    };

    messageDiv.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: ${colors[type]};
        color: var(--text-white);
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 8px 25px var(--shadow-dark);
        animation: slideIn 0.3s ease, slideOut 0.3s ease 2.5s forwards;
        max-width: 300px;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Balloon Game
newBalloonBtn.addEventListener('click', createBalloon);

function createInitialBalloons() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createBalloon(), i * 1000);
    }
}

function createBalloon() {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';

    // Enhanced balloon colors with gradients
    const colors = [
        'linear-gradient(135deg, #ff6b6b, #ee5a52)',
        'linear-gradient(135deg, #4ecdc4, #44a08d)',
        'linear-gradient(135deg, #45b7d1, #3498db)',
        'linear-gradient(135deg, #96ceb4, #85c1a3)',
        'linear-gradient(135deg, #feca57, #ff9ff3)',
        'linear-gradient(135deg, #a8e6cf, #88d8a3)',
        'linear-gradient(135deg, #ffd93d, #ff6b35)',
        'linear-gradient(135deg, #6c5ce7, #a29bfe)'
    ];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.background = randomColor;

    // Random position with better spacing
    const containerWidth = balloonContainer.offsetWidth;
    const balloonWidth = 70; // Updated balloon width
    const randomX = Math.random() * (containerWidth - balloonWidth - 20) + 10;
    balloon.style.left = randomX + 'px';
    balloon.style.bottom = '-120px';

    // Random animation delay for more natural movement
    const animationDelay = Math.random() * 2;
    balloon.style.animationDelay = animationDelay + 's';

    // Add touch and click events for mobile responsiveness
    balloon.addEventListener('click', function(e) {
        e.preventDefault();
        popBalloon(balloon);
    });

    balloon.addEventListener('touchstart', function(e) {
        e.preventDefault();
        popBalloon(balloon);
    });

    // Prevent context menu on long press (mobile)
    balloon.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    balloonContainer.appendChild(balloon);

    // Enhanced floating animation with random speed
    const floatSpeed = 3000 + Math.random() * 2000; // 3-5 seconds
    const floatHeight = 420 + Math.random() * 50; // Slight height variation

    setTimeout(() => {
        balloon.style.bottom = floatHeight + 'px';
        balloon.style.transition = `bottom ${floatSpeed}ms linear`;
    }, 100);

    // Remove balloon after animation with cleanup
    setTimeout(() => {
        if (balloon.parentNode) {
            balloon.remove();
        }
    }, floatSpeed + 500);
}

function popBalloon(balloon) {
    // Prevent multiple pops
    if (balloon.classList.contains('popping')) return;
    balloon.classList.add('popping');

    // Create enhanced pop effect
    const popEffect = document.createElement('div');
    popEffect.innerHTML = '💥';
    popEffect.style.cssText = `
        position: absolute;
        font-size: 2.5rem;
        pointer-events: none;
        animation: popEffect 0.8s ease forwards;
        z-index: 100;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    `;

    const rect = balloon.getBoundingClientRect();
    const containerRect = balloonContainer.getBoundingClientRect();
    popEffect.style.left = (rect.left - containerRect.left + 35) + 'px';
    popEffect.style.top = (rect.top - containerRect.top + 45) + 'px';

    balloonContainer.appendChild(popEffect);

    // Create particle burst effect
    createParticleBurst(rect.left - containerRect.left + 35, rect.top - containerRect.top + 45);

    // Remove balloon with animation
    balloon.style.transform = 'scale(0)';
    balloon.style.opacity = '0';

    setTimeout(() => {
        if (balloon.parentNode) {
            balloon.remove();
        }
    }, 300);

    setTimeout(() => {
        if (popEffect.parentNode) {
            popEffect.remove();
        }
    }, 800);

    // Update score and counter
    balloonsPopped++;
    balloonsCountElement.textContent = balloonsPopped;
    addScore(20);
    playSound('pop');

    // Check for balloon master achievement
    if (balloonsPopped >= 10 && !achievements.balloonMaster) {
        unlockAchievement('balloonMaster', 'Balloon Master - Popped 10 balloons!');
    }

    // Create new balloon after a delay
    setTimeout(createBalloon, Math.random() * 1500 + 800);
}

function createParticleBurst(x, y) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];

    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 99;
        `;

        balloonContainer.appendChild(particle);

        // Animate particles
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;

        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${endX - x}px, ${endY - y}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => particle.remove();
    }
}

// Add pop effect animation
const popStyle = document.createElement('style');
popStyle.textContent = `
    @keyframes popEffect {
        0% { transform: scale(0.5); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.8; }
        100% { transform: scale(2); opacity: 0; }
    }
`;
document.head.appendChild(popStyle);

// Comments System
submitWishBtn.addEventListener('click', submitWish);

function submitWish() {
    const name = visitorNameInput.value.trim();
    const wish = birthdayWishTextarea.value.trim();

    if (!name || !wish) {
        alert('Please enter both your name and a birthday wish!');
        return;
    }

    const wishData = {
        name: name,
        wish: wish,
        date: new Date().toLocaleDateString(),
        id: Date.now()
    };

    // Save to localStorage
    let wishes = JSON.parse(localStorage.getItem('jeromesBirthdayWishes') || '[]');
    wishes.unshift(wishData); // Add to beginning
    localStorage.setItem('jeromesBirthdayWishes', JSON.stringify(wishes));

    // Clear form
    visitorNameInput.value = '';
    birthdayWishTextarea.value = '';

    // Add score
    addScore(25);

    // Reload wishes display
    loadWishes();

    // Show success message
    showSuccessMessage();
}

function loadWishes() {
    const wishes = JSON.parse(localStorage.getItem('jeromesBirthdayWishes') || '[]');

    if (wishes.length === 0) {
        wishesDisplay.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No birthday wishes yet. Be the first to leave one!</p>';
        return;
    }

    wishesDisplay.innerHTML = wishes.map(wish => `
        <div class="wish-card">
            <div class="wish-header">
                <span class="wish-author">💝 ${wish.name}</span>
                <span class="wish-date">${wish.date}</span>
            </div>
            <div class="wish-content">${wish.wish}</div>
        </div>
    `).join('');
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.textContent = '🎉 Thank you for your birthday wish!';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #4ecdc4, #44a08d);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        animation: successMessage 3s ease forwards;
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 3000);

    // Trigger confetti
    createConfetti(20);
}

// Add success message animation
const successStyle = document.createElement('style');
successStyle.textContent = `
    @keyframes successMessage {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        15% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(successStyle);

// Confetti System
function createConfetti(count) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf'];

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

            document.getElementById('confetti-container').appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 100);
    }
}

// Photo and cake fallback system
function setupPhotoFallback() {
    // Jerome photo fallback
    if (jeromePhoto) {
        jeromePhoto.addEventListener('error', function() {
            // If the image fails to load, create a placeholder
            this.style.display = 'none';

            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 4rem;
                color: white;
                border: 8px solid #fff;
                box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            `;
            placeholder.textContent = '🎂';

            this.parentNode.insertBefore(placeholder, this);
        });
    }

    // Cake image fallback
    const cakeImage = document.querySelector('.cake-image');
    if (cakeImage) {
        cakeImage.addEventListener('error', function() {
            console.log('Cake image failed to load, showing CSS fallback');
            this.style.display = 'none';
            const fallback = document.querySelector('.css-cake-fallback');
            if (fallback) {
                fallback.style.display = 'flex';
            }
        });

        // Also check if the image loads successfully
        cakeImage.addEventListener('load', function() {
            console.log('Cake image loaded successfully');
            const fallback = document.querySelector('.css-cake-fallback');
            if (fallback) {
                fallback.style.display = 'none';
            }
        });
    }
}

// Load saved score on page load
window.addEventListener('load', function() {
    const savedScore = localStorage.getItem('jeromesBirthdayScore');
    if (savedScore) {
        score = parseInt(savedScore);
        updateScore();
    }
});
