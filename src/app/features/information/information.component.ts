import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigatorService } from '@core/services';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [],
  templateUrl: './information.component.html',
  styleUrl: './information.component.scss',
})
export class InformationComponent implements OnInit, OnDestroy {
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
        this.onNavigateToDashboard();
      });
  }

  onNavigateToDashboard() {
    this._navigatorService.goToDashboard();
  }

  ngOnDestroy(): void {
    this._inactivityService.stop();
    this._destroy$.next();
    this._destroy$.complete();
  }
}
