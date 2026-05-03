import { Component, EventEmitter, HostBinding, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-green-farming-dialog',
    standalone: true,
    imports: [TranslateModule],
    templateUrl: './green-farming-dialog.component.html',
    styleUrls: ['./green-farming-dialog.component.scss'],
})
export class GreenFarmingDialogComponent {
    @HostBinding('class.is-closing') isClosing = false;

    @Output() closeEvent = new EventEmitter<void>();

    closeDialog(): void {
        this.isClosing = true;
    }

    onContentAnimationEnd(event: AnimationEvent): void {
        if (
            this.isClosing &&
            event.target === event.currentTarget &&
            event.animationName.includes('Leave')
        ) {
            this.closeEvent.emit();
        }
    }
}
