import { Component, HostBinding, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-food-dialog',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './food.dialog.component.html',
  styleUrls: ['./food.dialog.component.scss'],
})
export class FoodDialogComponent {
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
