class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.isMuted = false;
  }

  initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playBirth() {
    if (this.isMuted) return;
    this.initialize();
    this.playTone(440, 0.1); // A4 note
  }

  playDeath() {
    if (this.isMuted) return;
    this.initialize();
    this.playTone(220, 0.1); // A3 note
  }

  playTone(frequency, duration) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}

export default new SoundEffects();
