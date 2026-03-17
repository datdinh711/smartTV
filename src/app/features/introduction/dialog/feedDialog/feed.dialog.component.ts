
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-feed-dialog',
  standalone: true,
  imports: [],
  templateUrl: './feed.dialog.component.html',
  styleUrl: './feed.dialog.component.scss'
})
export class FeedDialogComponent {
  // @Output tạo ra một EventEmitter để phát sự kiện ra bên ngoài component
  @Output() closeEvent = new EventEmitter<void>();

  closeDialog() {
    this.closeEvent.emit();
  }
}