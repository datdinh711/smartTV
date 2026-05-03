import { Component, EventEmitter, HostBinding, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-renewable-energy-dialog',
    standalone: true,
    imports: [TranslateModule],
    templateUrl: './renewable-energy-dialog.component.html',
    styleUrls: ['./renewable-energy-dialog.component.scss'],
})
export class RenewableEnergyDialogComponent {
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
