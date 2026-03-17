import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-farm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './farm.dialog.component.html',
  styleUrls: ['./farm.dialog.component.scss']
})
export class FarmDialogComponent {
  @Output() closeEvent = new EventEmitter<void>();

  closeDialog() {
    this.closeEvent.emit();
  }
}
