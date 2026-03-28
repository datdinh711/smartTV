import { Component, HostBinding, Output, EventEmitter } from '@angular/core';
import { foodDialogAnimation } from '@shared/animations';

@Component({
  selector: 'app-food-dialog',
  standalone: true,
  imports: [],
  templateUrl: './food.dialog.component.html',
  styleUrls: ['./food.dialog.component.scss'],
  animations: [foodDialogAnimation],
})
export class FoodDialogComponent {
  @HostBinding('@foodDialog') animationState = true;

  @Output() closeEvent = new EventEmitter<void>();

  closeDialog() {
    this.closeEvent.emit();
  }
}
