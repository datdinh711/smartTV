import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, IonApp, IonHeader, IonToolbar, IonTitle, IonContent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'smartTV';
}
