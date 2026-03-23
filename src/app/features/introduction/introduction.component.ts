import { Component, OnDestroy, OnInit, Inject, ViewChild, TemplateRef } from "@angular/core";
import { DOCUMENT } from '@angular/common';
import { NavigatorService } from '@core/services';
import { InactivityService } from '@shared/services';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FeedDialogComponent } from './dialog/feedDialog/feed.dialog.component';
import { FarmDialogComponent } from './dialog/farmDialog/farm.dialog.component';
import { FoodDialogComponent } from './dialog/foodDialog/food.dialog.component';

@Component({
  selector: 'app-introduction',
  standalone: true,
    imports: [CommonModule,FeedDialogComponent,FarmDialogComponent,FoodDialogComponent],
    templateUrl: './introduction.component.html',
    styleUrl: './introduction.component.scss',
})

export class IntroductionComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _baseHref = '/';
  isDialogFeedOpen = false;
  isDialogFoodOpen = false;
  isDialogFarmOpen = false;
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
    this._navigatorService.goToIntroductionVideo();
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

  onWatchVideo(): void {
    this._navigatorService.goToIntroductionVideo();
  }
}