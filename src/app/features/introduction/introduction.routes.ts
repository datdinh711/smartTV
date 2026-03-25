import { Routes } from '@angular/router';
import { IntroductionComponent } from './introduction.component';
import { IntroductionVideoComponent } from './video/introduction.video.component';
import { KeyMilestonesComponent } from './keyMilestones/key.milestones.component';

export const routes: Routes = [
  {
    path: '',
    component: IntroductionComponent,
    data: { animation: 'introduction' },
  },
  {
    path: 'video',
    component: IntroductionVideoComponent,
    data: { animation: 'video' },
  },
  {
    path: 'key-milestones',
    component: KeyMilestonesComponent,
    data: { animation: 'keyMilestones' },
  },
];
