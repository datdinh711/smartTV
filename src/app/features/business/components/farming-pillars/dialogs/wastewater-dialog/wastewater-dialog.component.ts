import { Component, EventEmitter, HostBinding, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-wastewater-dialog',
    standalone: true,
    imports: [TranslateModule],
    templateUrl: './wastewater-dialog.component.html',
    styleUrls: ['./wastewater-dialog.component.scss'],
})
export class WastewaterDialogComponent {
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
