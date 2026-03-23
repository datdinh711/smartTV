import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-food-dialog',
  standalone: true,
  imports: [],
  templateUrl: './food.dialog.component.html',
  styleUrls: ['./food.dialog.component.scss']
})
export class FoodDialogComponent {
  @Output() closeEvent = new EventEmitter<void>();

  closeDialog() {
    this.closeEvent.emit();
  }
}
