
import { Component, HostBinding, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-feed-dialog',
  standalone: true,
  imports: [],
  templateUrl: './feed.dialog.component.html',
  styleUrl: './feed.dialog.component.scss',
})
export class FeedDialogComponent {
  @HostBinding('class.is-closing') isClosing = false;

  @Output() closeEvent = new EventEmitter<void>();

  closeDialog(): void {
    this.isClosing = true;
  }

  onContentAnimationEnd(event: AnimationEvent): void {
    if (this.isClosing && event.target === event.currentTarget && event.animationName.includes('Leave')) {
      this.closeEvent.emit();
    }
  }
}