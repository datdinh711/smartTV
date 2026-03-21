
import { Routes } from '@angular/router';
import { StrategyComponent } from './strategy.component';
import { SustainabilityRegconigtionComponent, SustainabilityStrategyComponent, SustainabilityVdoComponent } from './components';
import { STRATEGY_ROUTES } from './constants';

export const routes: Routes = [
  {
    path: '',
    component: StrategyComponent,
    children: [
      {
        path: '',
        component: SustainabilityStrategyComponent,
        pathMatch: 'full',
      },
      {
        path: STRATEGY_ROUTES.SUSTAINABILITY_VDO,
        component: SustainabilityVdoComponent,
      },
      {
        path: STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION,
        component: SustainabilityRegconigtionComponent,
      }
    ],
  },
];