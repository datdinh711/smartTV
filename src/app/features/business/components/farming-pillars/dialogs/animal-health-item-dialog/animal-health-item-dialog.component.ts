import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { getVideoVersionFromLanguage, VideoCacheService } from '@core/services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VideoPlayerComponent } from '@shared/components';

export interface AnimalHealthItem {
    id: number;
    badge: string;
    title: string;
    description: string;
    details: string[];
    images?: { vi: string[]; en: string[]; };
    video?: string;
}

@Component({
    selector: 'app-animal-health-item-dialog',
    standalone: true,
    imports: [CommonModule, TranslateModule, VideoPlayerComponent],
    templateUrl: './animal-health-item-dialog.component.html',
    styleUrls: ['./animal-health-item-dialog.component.scss'],
})
export class AnimalHealthItemDialogComponent implements OnChanges {
    constructor(
        private readonly _translate: TranslateService,
        private readonly _videoCacheService: VideoCacheService,
    ) { }
    @HostBinding('class.is-closing') isClosing = false;

    @Input() itemId: number = 1;
    @Output() closeEvent = new EventEmitter<void>();

    readonly items: AnimalHealthItem[] = [
        {
            id: 1,
            badge: '01',
            title: 'BUSINESS.ANIMAL_HEALTH_DIALOG.ITEM_1_TITLE',
            description: 'Placeholder mô tả cho mục 1.',
            details: ['Placeholder chi tiết 1', 'Placeholder chi tiết 2', 'Placeholder chi tiết 3'],
            images: {
                vi: ['assets/images/animal_health_1_1_vie.png', 'assets/images/animal_health_1_2_vie.png'],
                en: ['assets/images/animal_health_1_1_eng.png', 'assets/images/animal_health_1_2_eng.png'],
            },
        },
        {
            id: 2,
            badge: '02',
            title: 'BUSINESS.ANIMAL_HEALTH_DIALOG.ITEM_2_TITLE',
            description: 'Placeholder mô tả cho mục 2.',
            details: ['Placeholder chi tiết 1', 'Placeholder chi tiết 2', 'Placeholder chi tiết 3'],
            images: {
                vi: [
                    'assets/images/animal_health_2_1_vie.png',
                    'assets/images/animal_health_2_2_vie.png',
                    'assets/images/animal_health_2_3_vie.png',
                ],
                en: [
                    'assets/images/animal_health_2_1_eng.png',
                    'assets/images/animal_health_2_2_eng.png',
                    'assets/images/animal_health_2_3_eng.png',
                ],
            },
        },
        {
            id: 3,
            badge: '03',
            title: 'BUSINESS.ANIMAL_HEALTH_DIALOG.ITEM_3_TITLE',
            description: 'Placeholder mô tả cho mục 3.',
            details: ['Placeholder chi tiết 1', 'Placeholder chi tiết 2', 'Placeholder chi tiết 3'],
            images: {
                vi: ['assets/images/animal_health_3_1_vie.png'],
                en: ['assets/images/animal_health_3_1_eng.png'],
            },
        },
        {
            id: 4,
            badge: '04',
            title: 'BUSINESS.ANIMAL_HEALTH_DIALOG.ITEM_4_TITLE',
            description: 'Chẩn đoán và tư vấn ngay tại trại. Placeholder mô tả cho mục 4.',
            details: ['Placeholder chi tiết 1', 'Placeholder chi tiết 2', 'Placeholder chi tiết 3'],
            images: {
                vi: [
                    'assets/images/animal_health_4_1_vie.png',
                    'assets/images/animal_health_4_2_vie.png',
                ],
                en: [
                    'assets/images/animal_health_4_1_eng.png',
                    'assets/images/animal_health_4_2_eng.png',
                ],
            },
        },
        {
            id: 5,
            badge: '05',
            title: 'BUSINESS.ANIMAL_HEALTH_DIALOG.ITEM_5_TITLE',
            description: 'Placeholder mô tả cho mục 5.',
            details: [],
            video: 'animal-health',
        },
    ];

    get currentItem(): AnimalHealthItem | undefined {
        return this.items.find((i) => i.id === this.itemId);
    }

    get currentImages(): string[] {
        const lang = (this._translate.currentLang ?? this._translate.defaultLang ?? 'vi') as 'vi' | 'en';
        return this.currentItem?.images?.[lang] ?? [];
    }

    currentImageIndex = 0;
    currentVideoSrc = '';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['itemId']) {
            this.currentImageIndex = 0;
            void this._syncCurrentVideoSrc();
        }
    }

    private async _syncCurrentVideoSrc(): Promise<void> {
        this.currentVideoSrc = this.currentItem?.video
            ? await this._videoCacheService.getVideoUrl(
                'animal-health',
                getVideoVersionFromLanguage(this._translate.currentLang),
            )
            : '';
    }

    prevImage(): void {
        if (this.currentImageIndex > 0) this.currentImageIndex--;
    }

    nextImage(): void {
        if (this.currentImageIndex < this.currentImages.length - 1) this.currentImageIndex++;
    }

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
