import { Component, OnDestroy, OnInit, Inject } from "@angular/core";
import { DOCUMENT, CommonModule } from '@angular/common';
import { NavigatorService } from '@core/services';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';
import { NavigationButtonComponent } from '@shared/components/navigation-button/navigation-button.component';
import { HomeButtonComponent } from '@shared/components/home-button/home-button.component';
import { VideoPlayerComponent } from '@shared/components/video-player/video-player.component';

@Component({
  selector: 'app-introduction-video',
  standalone: true,
  imports: [CommonModule, NavigationButtonComponent, HomeButtonComponent, VideoPlayerComponent],
  templateUrl: './introduction.video.component.html',
  styleUrls: ['./introduction.video.component.scss'],
})
export class IntroductionVideoComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private _baseHref = '/';

  videoPath: string = '';

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _inactivityService: InactivityService,
    @Inject(DOCUMENT) private readonly _document: Document,
  ) {
    const baseEl = this._document.getElementsByTagName('base')[0];
    const href = baseEl ? baseEl.getAttribute('href') : null;
    this._baseHref = href ?? '/';
    if (!this._baseHref.endsWith('/')) {
      this._baseHref += '/';
    }
    this.videoPath = this.asset('videos/720p.mp4');
  }

  ngOnInit(): void {
    this._inactivityService.start();
    this._inactivityService.onInactive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {});
  }

  ngOnDestroy(): void {
    this._inactivityService.stop();
    this._destroy$.next();
    this._destroy$.complete();
  }

  asset(path: string): string {
    return `${this._baseHref}assets/${path}`.replace(/([^:]?)\/\/+/, '$1/');
  }

  nextSlide(): void {
    this._navigatorService.goToKeyMilestones();
  }

  previousSlide(): void {
    this._navigatorService.goToDashboard();
  }
}
