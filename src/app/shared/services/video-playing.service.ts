import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VideoPlayingService {
  private _playingCount = 0;
  private readonly _stoppedSubject = new Subject<void>();

  readonly onVideoStopped$: Observable<void> = this._stoppedSubject.asObservable();

  markPlaying(): void {
    this._playingCount++;
  }

  markStopped(): void {
    const prev = this._playingCount;
    this._playingCount = Math.max(0, this._playingCount - 1);
    if (prev > 0 && this._playingCount === 0) {
      this._stoppedSubject.next();
    }
  }

  isVideoPlaying(): boolean {
    return this._playingCount > 0;
  }
}
