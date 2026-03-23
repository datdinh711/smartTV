import { Routes } from '@angular/router';
import { BusinessComponent } from './business.component';
import { FarmingPillarsComponent } from './components/farming-pillars/farming-pillars.component';
import { SustainovationBusinessComponent } from './components/sustainovation-business/sustainovation-business.component';

export const routes: Routes = [
  {
    path: '',
    component: BusinessComponent,
    children: [
      {
        path: '',
        component: SustainovationBusinessComponent,
        pathMatch: 'full',
      },
      {
        path: ':businessId',
        component: FarmingPillarsComponent,
      },
    ],
  },
];
