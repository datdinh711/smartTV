import { Component, OnDestroy, OnInit, Inject, ViewChild, TemplateRef } from "@angular/core";
import { DOCUMENT } from '@angular/common';
import { NavigatorService } from '@core/services';
import { InactivityService } from '@shared/services';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DialogComponent } from './dialog/dialog.component'; // Import Dialog Component vào đây

@Component({
  selector: 'app-introduction',
  standalone: true,
    imports: [CommonModule,DialogComponent],
    templateUrl: './introduction.component.html',
    styleUrl: './introduction.component.scss',
})

export class IntroductionComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _baseHref = '/';
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
isDialogFeedOpen = false;
isDialogFoodOpen = false;
isDialogFarmOpen = false;

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
    
  }

  previousSlide() {
    
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
    console.log('Đang mở Feed dialog...')
    this.isDialogFeedOpen = true;
  }

  openDialogFood() {
    console.log('Đang mở Food dialog...')
    this.isDialogFoodOpen =
     true;
  }

  openDialogFarm() {
    console.log('Đang mở Farm dialog...')
    this.isDialogFarmOpen = true;
  }

  asset(path: string): string {
    return `${this._baseHref}assets/${path}`.replace(/([^:]?)\/\/+/, '$1/');
  }

  onWatchVideo(): void {
    const videoUrl = this.asset('videos/intro.mp4');
    try {
      window.open(videoUrl, '_blank');
    } catch (e) {
      console.warn('Unable to open video URL', videoUrl, e);
    }
  }
}