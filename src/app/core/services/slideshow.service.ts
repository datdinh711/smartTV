import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@core/constants';

interface SlideRoute {
  path: string;
  durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class SlideshowService implements OnDestroy {
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _currentIndex = 0;

  private _routeSequence: SlideRoute[] = [
    { path: `/${APP_ROUTES.WELCOME}`, durationMs: 5000 },
    { path: `/${APP_ROUTES.DASHBOARD}`, durationMs: 5000 },
  ];

  private _running = false;

  constructor(private readonly _router: Router) {}

  start(): void {
    if (this._running) {
      return;
    }

    this._running = true;
    this._currentIndex = 0;
    this.navigateToCurrent();
  }

  stop(): void {
    if (!this._running) {
      return;
    }

    this._running = false;
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  isRunning(): boolean {
    return this._running;
  }

  private get currentSlide(): SlideRoute {
    return this._routeSequence[this._currentIndex];
  }

  private navigateToCurrent(): void {
    if (!this._running) return;

    this._router
      .navigate([this.currentSlide.path])
      .then(() => {
        this._timer = setTimeout(
          () => this.next(),
          this.currentSlide.durationMs,
        );
      })
      .catch(() => {
        // nếu route không tồn tại hoặc lỗi, vẫn cố gắng next
        this._timer = setTimeout(
          () => this.next(),
          this.currentSlide.durationMs,
        );
      });
  }

  private next(): void {
    if (!this._running) return;

    this._currentIndex = (this._currentIndex + 1) % this._routeSequence.length;
    this.navigateToCurrent();
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
