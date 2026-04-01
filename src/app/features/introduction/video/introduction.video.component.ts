import { Component, OnDestroy, OnInit, AfterViewInit, Inject } from "@angular/core";
import { DOCUMENT, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnimationEvent } from '@angular/animations';
import { NavigatorService } from '@core/services';
import { NavigationSource } from '@core/enums';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';
import { NavigationButtonComponent } from '@shared/components/navigation-button/navigation-button.component';
import { HomeButtonComponent } from '@shared/components/home-button/home-button.component';
import { VideoPlayerComponent } from '@shared/components/video-player/video-player.component';
import { doorLeftAnimation, doorRightAnimation } from '@shared/animations';

@Component({
  selector: 'app-introduction-video',
  standalone: true,
  imports: [CommonModule, NavigationButtonComponent, HomeButtonComponent, VideoPlayerComponent],
  templateUrl: './introduction.video.component.html',
  styleUrls: ['./introduction.video.component.scss'],
  animations: [doorLeftAnimation, doorRightAnimation],
})
export class IntroductionVideoComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private _baseHref = '/';

  videoPath = '';

  // ── Navigation source ───────────────────────────────────────────────────────
  // Read from router state in the constructor (the only safe window).
  // Determines what "next" does:
  //   introduction  →  next goes to KeyMilestonesComponent
  //   keyMilestones →  next goes to StrategyComponent
  readonly rootNavigateComponent: NavigationSource;

  // ── Door animation state machine ────────────────────────────────────────────
  animPhase: 'closed' | 'open' = 'closed';
  showDoors = true;

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _inactivityService: InactivityService,
    private readonly _router: Router,
    @Inject(DOCUMENT) private readonly _document: Document,
  ) {
    // getCurrentNavigation() is only valid inside the constructor.
    const navState = this._router.getCurrentNavigation()?.extras?.state;
    this.rootNavigateComponent =
      (navState?.['rootNavigateComponent'] as NavigationSource) ??
      NavigationSource.introduction;

    const baseEl = this._document.getElementsByTagName('base')[0];
    const href = baseEl ? baseEl.getAttribute('href') : null;
    this._baseHref = href ?? '/';
    if (!this._baseHref.endsWith('/')) {
      this._baseHref += '/';
    }
    this.videoPath = this.asset('videos/Cp-vdo.mp4');
  }

  ngOnInit(): void {
    this._inactivityService.start();
    this._inactivityService.onInactive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {});
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.animPhase = 'open');
  }

  ngOnDestroy(): void {
    this._inactivityService.stop();
    this._destroy$.next();
    this._destroy$.complete();
  }

  asset(path: string): string {
    return `${this._baseHref}assets/${path}`.replace(/([^:]?)\/\/+/, '$1/');
  }

  // ── Door animation callback ─────────────────────────────────────────────────

  onDoorDone(event: AnimationEvent): void {
    if (event.toState === 'open') {
      this.showDoors = false;
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  nextSlide(): void {
    if (this.rootNavigateComponent === NavigationSource.introduction) {
      // Came from Introduction → go to KeyMilestones, tagging video as source
      this._navigatorService.goToKeyMilestonesFrom(NavigationSource.video);
    } else {
      // Came from KeyMilestones → go to Strategy
      this._navigatorService.goToStrategy();
    }
  }

  previousSlide(): void {
    this._navigatorService.goToDashboard();
  }
}
