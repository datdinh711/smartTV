import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InactivityService implements OnDestroy {
  private readonly _inactiveSubject = new Subject<void>();
  private _inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private _listening = false;

  private readonly _activityEvents: Array<keyof DocumentEventMap> = [
    // Mouse / Touch
    'click',
    'mousemove',
    'touchstart',
    'scroll',
    'pointerdown',
    'pointermove',

    // Keyboard + Remote control (Android TV / Tizen)
    'keydown',
    'keyup',
    'keypress',

    // D-pad navigation focus changes
    'focusin',

    // Wheel (một số remote có scroll)
    'wheel',
  ];

  readonly onInactive$: Observable<void> = this._inactiveSubject.asObservable();
  private readonly _activeSubject = new Subject<void>();
  readonly onActive$: Observable<void> = this._activeSubject.asObservable();
  private _timeoutMs = 60000;

  constructor(private readonly _ngZone: NgZone) {}

  /**
   * Start monitoring user inactivity. Calling again will reset the timer.
   * @param timeoutMs Inactivity duration in ms before emitting (default: 60 000 = 1 minute)
   */
  start(timeoutMs: number = 60000): void {
    this.stop();

    this._ngZone.runOutsideAngular(() => {
      this._activityEvents.forEach((event) => {
        document.addEventListener(event, this._onActivity, { passive: true });
      });
    });

    this._listening = true;
    this._timeoutMs = timeoutMs;
    this._resetTimer();
  }

  stop(): void {
    if (this._listening) {
      this._activityEvents.forEach((event) => {
        document.removeEventListener(event, this._onActivity);
      });
      this._listening = false;
    }

    this._clearTimer();
  }

  ngOnDestroy(): void {
    this.stop();
    this._inactiveSubject.complete();
  }

  private _onActivity = (): void => {
    this._ngZone.run(() => this._activeSubject.next());
    this._resetTimer();
  };

  private _resetTimer(): void {
    this._clearTimer();

    this._inactivityTimer = setTimeout(() => {
      this._ngZone.run(() => this._inactiveSubject.next());
    }, this._timeoutMs);
  }

  private _clearTimer(): void {
    if (this._inactivityTimer) {
      clearTimeout(this._inactivityTimer);
      this._inactivityTimer = null;
    }
  }
}
