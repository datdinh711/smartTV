import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeButtonComponent } from '@shared/components';

@Component({
  selector: 'app-strategy',
  standalone: true,
  imports: [RouterModule, HomeButtonComponent],
  templateUrl: './strategy.component.html',
  styleUrl: './strategy.component.scss',
})
export class StrategyComponent {}
