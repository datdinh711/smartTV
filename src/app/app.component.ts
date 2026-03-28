import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InactivityService } from '@shared/services';
import { NavigatorService, SlideshowService } from '@core/services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',

})
export class AppComponent implements OnInit, OnDestroy {
  title = 'smartTV';
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _inactivityService: InactivityService,
    private readonly _slideshowService: SlideshowService,
    private readonly _navigatorService: NavigatorService,
  ) {}

  ngOnInit(): void {
    this._inactivityService.start(30000); // 30s không có tương tác

    this._inactivityService.onInactive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        console.log('User is inactive, starting slideshow...');
        this._slideshowService.start();
      });

    this._inactivityService.onActive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        console.log('User is active, stopping slideshow...');
        if (this._slideshowService.isRunning()) {
          this._slideshowService.stop();
          this._navigatorService.goToDashboard();
        }
      });
  }

  ngOnDestroy(): void {
    this._inactivityService.stop();
    this._slideshowService.stop();
    this._destroy$.next();
    this._destroy$.complete();
  }


}
