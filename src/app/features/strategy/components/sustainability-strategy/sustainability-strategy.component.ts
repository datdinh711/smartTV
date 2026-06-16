import { Component } from '@angular/core';
import { APP_ROUTES } from '@core/constants';
import { NavigatorService } from '@core/services';
import { STRATEGY_ROUTES } from '@features/strategy/constants';
import { TranslateModule } from '@ngx-translate/core';
import { HomeButtonComponent, NavigationButtonComponent } from '@shared/components';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sustainovation-business',
  standalone: true,
  imports: [NavigationButtonComponent, HomeButtonComponent, TranslateModule],
  templateUrl: './sustainability-strategy.component.html',
  styleUrl: './sustainability-strategy.component.scss',
})
export class SustainabilityStrategyComponent {
  APP_ROUTE = APP_ROUTES;
  STRATEGY_ROUTE = STRATEGY_ROUTES;

  private _destroy$ = new Subject<void>();
  constructor(
    private readonly _navigatorService: NavigatorService,
    //private readonly _inactivityService: InactivityService,
  ) { }

  ngOnInit(): void {
    // this._inactivityService.start();
    // this._inactivityService.onInactive$
    //   .pipe(takeUntil(this._destroy$))
    //   .subscribe(() => {

    //   });
  }

  ngOnDestroy(): void {
    // this._inactivityService.stop();
    // this._destroy$.next();
    // this._destroy$.complete();
  }

  onNavigateVdo(): void {
    this._navigatorService.goToPath(
      this.APP_ROUTE.STRATEGY + '/' + this.STRATEGY_ROUTE.SUSTAINABILITY_VDO,
    );
  }

  nextSlide() {
    // Logic to go to the next slide
  }

  previousSlide() {
    // Logic to go to the previous slide
  }
}
