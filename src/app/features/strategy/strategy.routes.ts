
import { Routes } from '@angular/router';
import { StrategyComponent } from './strategy.component';
import { SustainabilityCpfComponent, SustainabilityRegconigtionComponent, SustainabilityStrategyComponent, SustainabilityVdoComponent } from './components';
import { STRATEGY_ROUTES } from './constants';

export const routes: Routes = [
  {
    path: '',
    component: StrategyComponent,
    children: [
      {
        path: '',
        component: SustainabilityCpfComponent,
        pathMatch: 'full',
      },
      {
        path: STRATEGY_ROUTES.SUSTAINABILITY_VDO,
        component: SustainabilityVdoComponent,
      },
      {
        path: STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION,
        component: SustainabilityRegconigtionComponent,
      },
      {
        path: STRATEGY_ROUTES.SUSTAINABILITY_STRATEGY,
        component: SustainabilityStrategyComponent,
      },
      {
        path: STRATEGY_ROUTES.SUSTAINABILITY_CPF,
        component: SustainabilityCpfComponent,
      }
    ],
  },
];