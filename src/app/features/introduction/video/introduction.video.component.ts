import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { NavigationSource } from '@core/enums';
import { getVideoVersionFromLanguage, NavigatorService, VideoCacheService } from '@core/services';
import { TranslateService } from '@ngx-translate/core';
import { HomeButtonComponent } from '@shared/components/home-button/home-button.component';
import { NavigationButtonComponent } from '@shared/components/navigation-button/navigation-button.component';
import { VideoPlayerComponent } from '@shared/components/video-player/video-player.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-introduction-video',
  standalone: true,
  imports: [CommonModule, NavigationButtonComponent, HomeButtonComponent, VideoPlayerComponent],
  templateUrl: './introduction.video.component.html',
  styleUrls: ['./introduction.video.component.scss'],
})
export class IntroductionVideoComponent implements OnInit {
  private _destroy$ = new Subject<void>();
  private _baseHref = '/';

  videoPath = '';

  // ── Navigation source ───────────────────────────────────────────────────────
  // Read from router state in the constructor (the only safe window).
  // Determines what "next" does:
  //   introduction  →  next goes to KeyMilestonesComponent
  //   keyMilestones →  next goes to StrategyComponent
  readonly rootNavigateComponent: NavigationSource;

  showDoors = true;

  constructor(
    private readonly _navigatorService: NavigatorService,
    //private readonly _inactivityService: InactivityService,
    private readonly _router: Router,
    private readonly _videoCacheService: VideoCacheService,
    private readonly _translate: TranslateService,
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
  }

  async ngOnInit(): Promise<void> {
    this.videoPath = await this._videoCacheService.getVideoUrl(
      'introduction',
      getVideoVersionFromLanguage(this._translate.currentLang),
    );
  }

  // ngOnDestroy(): void {
  //   this._destroy$.next();
  //   this._destroy$.complete();
  // }

  asset(path: string): string {
    return `${this._baseHref}assets/${path}`.replace(/([^:]?)\/\/+/, '$1/');
  }

  // ── Door animation callback ─────────────────────────────────────────────────

  onDoorDone(): void {
    this.showDoors = false;
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

  onVideoEnded(): void {
    if (this.rootNavigateComponent === NavigationSource.introduction) {
      // Came from Introduction → go to KeyMilestones, tagging video as source
      this._navigatorService.goToKeyMilestonesFrom(NavigationSource.video);
    } else {
      // Came from KeyMilestones → go to Strategy
      this._navigatorService.goToStrategy();
    }
  }
}
