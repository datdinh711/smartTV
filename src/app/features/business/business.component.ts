import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeButtonComponent } from '@shared/components';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [RouterModule, HomeButtonComponent],
  templateUrl: './business.component.html',
  styleUrl: './business.component.scss',
})
export class BusinessComponent {}
