import { Component, HostBinding, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-farm-dialog',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './farm.dialog.component.html',
  styleUrls: ['./farm.dialog.component.scss'],
})
export class FarmDialogComponent {
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
