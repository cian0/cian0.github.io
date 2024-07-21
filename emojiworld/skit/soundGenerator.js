let audioContext = null;

export function initializeAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

export function playTalkSound(text) {
    if (!audioContext) {
        initializeAudio();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();

    let i = 0;
    const intervalId = setInterval(() => {
        if (i < text.length) {
            const frequency = 200 + Math.random() * 100;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            i++;
        } else {
            clearInterval(intervalId);
            oscillator.stop();
            oscillator.disconnect();
            gainNode.disconnect();
        }
    }, 50);
}