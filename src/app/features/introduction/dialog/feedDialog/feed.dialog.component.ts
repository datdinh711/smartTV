
import { Component, HostBinding, Output, EventEmitter } from '@angular/core';
import { feedDialogAnimation } from '@shared/animations';

@Component({
  selector: 'app-feed-dialog',
  standalone: true,
  imports: [],
  templateUrl: './feed.dialog.component.html',
  styleUrl: './feed.dialog.component.scss',
  animations: [feedDialogAnimation],
})
export class FeedDialogComponent {
  @HostBinding('@feedDialog') animationState = true;

  @Output() closeEvent = new EventEmitter<void>();

  closeDialog() {
    this.closeEvent.emit();
  }
}