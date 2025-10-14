/**
 * Session Storage - Stores training session data
 */

export interface SessionData {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // seconds
  totalThrusts: number;
  averageForce: number;
  maxForce: number;
  averageRate: number; // thrusts per minute
  thrustHistory: ThrustData[];
  positionAccuracy: number; // percentage
}

export interface ThrustData {
  timestamp: number;
  force: number;
  position: { x: number; y: number };
  angle: number;
}

class SessionStorage {
  private currentSession: Partial<SessionData> | null = null;
  private lastCompletedSession: SessionData | null = null;
  private thrustHistory: ThrustData[] = [];
  private startTime: number = 0;
  private forceSum: number = 0;
  private forceCount: number = 0;
  private maxForce: number = 0;

  /**
   * Start a new training session
   */
  startSession() {
    this.startTime = Date.now();
    this.thrustHistory = [];
    this.forceSum = 0;
    this.forceCount = 0;
    this.maxForce = 0;

    this.currentSession = {
      id: `session-${this.startTime}`,
      startTime: this.startTime,
      totalThrusts: 0,
      averageForce: 0,
      maxForce: 0,
      averageRate: 0,
      thrustHistory: [],
      positionAccuracy: 0,
    };

    console.log('[Session] Started new session:', this.currentSession.id);
  }

  /**
   * Record a thrust during the session
   */
  recordThrust(force: number, position: { x: number; y: number }, angle: number) {
    if (!this.currentSession) {
      console.warn('[Session] No active session - starting one');
      this.startSession();
    }

    const thrustData: ThrustData = {
      timestamp: Date.now(),
      force,
      position,
      angle,
    };

    this.thrustHistory.push(thrustData);

    // Update statistics
    this.forceSum += force;
    this.forceCount += 1;
    this.maxForce = Math.max(this.maxForce, force);

    // Update current session
    if (this.currentSession) {
      this.currentSession.totalThrusts = this.thrustHistory.length;
      this.currentSession.averageForce = this.forceSum / this.forceCount;
      this.currentSession.maxForce = this.maxForce;
      this.currentSession.thrustHistory = this.thrustHistory;

      // Calculate position accuracy (how close to center)
      const targetPos = { x: 0.5, y: 0.45 };
      const accuracies = this.thrustHistory.map((thrust) => {
        const distance = Math.sqrt(
          Math.pow(thrust.position.x - targetPos.x, 2) +
          Math.pow(thrust.position.y - targetPos.y, 2)
        );
        return Math.max(0, 1 - distance); // Convert distance to accuracy (0-1)
      });
      const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
      this.currentSession.positionAccuracy = Math.round(avgAccuracy * 100);
    }

    console.log(`[Session] Thrust recorded: ${force.toFixed(1)}N at (${position.x.toFixed(2)}, ${position.y.toFixed(2)})`);
  }

  /**
   * Update session statistics (called periodically)
   */
  updateStats(currentForce: number, compressionRate: number) {
    if (!this.currentSession) return;

    // Track max force even if not a full thrust
    if (currentForce > this.maxForce) {
      this.maxForce = currentForce;
      this.currentSession.maxForce = currentForce;
    }

    // Update average rate
    this.currentSession.averageRate = compressionRate;
  }

  /**
   * End the current session and return the data
   */
  endSession(): SessionData | null {
    if (!this.currentSession) {
      console.warn('[Session] No active session to end');
      return null;
    }

    const endTime = Date.now();
    const duration = Math.floor((endTime - this.startTime) / 1000);

    const finalSession: SessionData = {
      id: this.currentSession.id!,
      startTime: this.currentSession.startTime!,
      endTime,
      duration,
      totalThrusts: this.currentSession.totalThrusts!,
      averageForce: this.currentSession.averageForce!,
      maxForce: this.currentSession.maxForce!,
      averageRate: this.currentSession.averageRate!,
      thrustHistory: this.currentSession.thrustHistory!,
      positionAccuracy: this.currentSession.positionAccuracy!,
    };

    console.log('[Session] Ended session:', {
      id: finalSession.id,
      duration: `${duration}s`,
      thrusts: finalSession.totalThrusts,
      avgForce: `${finalSession.averageForce.toFixed(1)}N`,
      maxForce: `${finalSession.maxForce.toFixed(1)}N`,
      accuracy: `${finalSession.positionAccuracy}%`,
    });

    // Save as last completed session for analytics
    this.lastCompletedSession = finalSession;
    this.currentSession = null;
    return finalSession;
  }

  /**
   * Get the current session data (or last completed if none active)
   */
  getCurrentSession(): Partial<SessionData> | SessionData | null {
    return this.currentSession || this.lastCompletedSession;
  }

  /**
   * Get the last completed session
   */
  getLastCompletedSession(): SessionData | null {
    return this.lastCompletedSession;
  }

  /**
   * Check if a session is active
   */
  isSessionActive(): boolean {
    return this.currentSession !== null;
  }

  /**
   * Get thrust history for the current session
   */
  getThrustHistory(): ThrustData[] {
    return this.thrustHistory;
  }
}

// Singleton instance
export const sessionStorage = new SessionStorage();
