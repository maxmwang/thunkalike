class TimerManager {
  private static readonly TICK_INTERVAL = 200;

  private tickCallback: (time: string) => void;

  private stopTime!: number;

  private intervalId!: NodeJS.Timeout;

  constructor(tickCallback: (time: string) => void) {
    this.tickCallback = tickCallback;
  }

  /*
   * Starts the timer.
   * @param duration - The duration of the timer in milliseconds.
  */
  start(duration: number) {
    if (this.intervalId) {
      this.stop();
    }

    this.stopTime = Date.now() + duration;
    this.intervalId = setInterval(this.tick.bind(this), TimerManager.TICK_INTERVAL);
  }

  tick() {
    const timeLeftInSeconds = (Math.abs((this.stopTime - Date.now())) / 1000).toFixed(1);
    this.tickCallback(timeLeftInSeconds);
    if (Date.now() > this.stopTime) {
      this.stop();
    }
  }

  stop() {
    clearInterval(this.intervalId);
  }
}

export default TimerManager;
