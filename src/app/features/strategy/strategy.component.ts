import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigatorService } from '@core/services';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-strategy',
  standalone: true,
    imports: [],
    templateUrl: './strategy.component.html',
    styleUrl: './strategy.component.scss',
})

export class StrategyComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _inactivityService: InactivityService,
  ) {}

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
    this._navigatorService.goToDashboard();
  }

  nextSlide() {
    // Logic to go to the next slide
  }

  previousSlide() {
    // Logic to go to the previous slide
  }
}