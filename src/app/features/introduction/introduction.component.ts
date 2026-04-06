import { Component, OnDestroy, OnInit, Inject } from "@angular/core";
import { DOCUMENT, CommonModule } from '@angular/common';
import { NavigatorService } from '@core/services';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';
import { FeedDialogComponent } from './dialog/feedDialog/feed.dialog.component';
import { FarmDialogComponent } from './dialog/farmDialog/farm.dialog.component';
import { FoodDialogComponent } from './dialog/foodDialog/food.dialog.component';
import { NavigationButtonComponent } from '@shared/components/navigation-button/navigation-button.component';
import { HomeButtonComponent } from '@shared/components/home-button/home-button.component';
import { NavigationSource } from '@core/enums';

@Component({
  selector: 'app-introduction',
  standalone: true,
  imports: [CommonModule, FeedDialogComponent, FarmDialogComponent, FoodDialogComponent, NavigationButtonComponent, HomeButtonComponent],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss',
})

export class IntroductionComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _baseHref = '/';
  isDialogFeedOpen = false;
  isDialogFoodOpen = false;
  isDialogFarmOpen = false;

  // Stage 1: set to true when Watch Video is clicked.
  // The *ngIf overlay enters the DOM and the void → 'active' transition fires.
  isCircleActive = false;
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
  }

  ngOnInit(): void {
    this._inactivityService.start();
    this._inactivityService.onInactive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        
      });
  }

  ngOnDestroy(): void {
    this._inactivityService.stop();
    this._destroy$.next();
    this._destroy$.complete();
  }

  onNavigateDashboard(): void {
    console.log('Dialog closed with aaaaaaaaa');
    this._navigatorService.goToDashboard();
  }

  nextSlide() {
    this._navigatorService.goToKeyMilestonesFrom(NavigationSource.introduction);
  }

  previousSlide() {
    this._navigatorService.goToDashboard();
  }

  closeDialogFood() {
    this.isDialogFoodOpen = false;
  }

  closeDialogFeed() {
    this.isDialogFeedOpen = false;
  }

  closeDialogFarm() {
    this.isDialogFarmOpen = false;
  }

  openDialogFeed() {
    this.isDialogFeedOpen = true;
  }

  openDialogFood() {
    this.isDialogFoodOpen =
     true;
  }

  openDialogFarm() {
    this.isDialogFarmOpen = true;
  }

  asset(path: string): string {
    return `${this._baseHref}assets/${path}`.replace(/([^:]?)\/\/+/, '$1/');
  }

  // Stage 1: show the circle overlay; navigation happens in onCircleDone().
  onWatchVideo(): void {
    this.isCircleActive = true;
  }

  // Called by (@circlePullUp.done) when the circle has fully covered the screen.
  onCircleDone(): void {
    this._navigatorService.goToIntroductionVideoFrom(NavigationSource.introduction);
  }
}