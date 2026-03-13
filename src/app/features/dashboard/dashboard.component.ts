import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigatorService } from '@core/services';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _inactivityService: InactivityService,
  ) {}

  ngOnInit(): void {
    this._inactivityService.start();
    this._inactivityService.onInactive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this._navigatorService.goToSlideShow());
  }

  onNavigateInfoPage() {
    this._navigatorService.goToInfo();
  }

  onNavigateSlideShow() {
    this._navigatorService.goToSlideShow();
  }

  ngOnDestroy(): void {
    this._inactivityService.stop();
    this._destroy$.next();
    this._destroy$.complete();
  }
}
