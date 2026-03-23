import { Routes } from '@angular/router';
import { IntroductionComponent } from './introduction.component';
import { IntroductionVideoComponent } from './video/introduction.video.component';
import { KeyMilestonesComponent } from './keyMilestones/key.milestones.component';

export const routes: Routes = [
  {
    path: '',
    component: IntroductionComponent,
  },
  {
    path: 'key-milestones',
    component: KeyMilestonesComponent,
  },
  {
    path: 'video',
    component: IntroductionVideoComponent,
  },
];
