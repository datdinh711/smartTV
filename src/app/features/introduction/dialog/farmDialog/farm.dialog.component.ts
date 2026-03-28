import { Component, HostBinding, Output, EventEmitter } from '@angular/core';
import { farmDialogAnimation } from '@shared/animations';

@Component({
  selector: 'app-farm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './farm.dialog.component.html',
  styleUrls: ['./farm.dialog.component.scss'],
  animations: [farmDialogAnimation],
})
export class FarmDialogComponent {
  @HostBinding('@farmDialog') animationState = true;

  @Output() closeEvent = new EventEmitter<void>();

  closeDialog() {
    this.closeEvent.emit();
  }
}
