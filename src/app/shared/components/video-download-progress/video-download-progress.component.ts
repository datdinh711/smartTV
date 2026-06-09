import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DownloadProgress, VideoCacheService, VideoFileName } from '@core/services';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-video-download-progress',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './video-download-progress.component.html',
    styleUrl: './video-download-progress.component.scss',
})
export class VideoDownloadProgressComponent implements OnInit, OnDestroy {
    downloadProgress = new Map<VideoFileName, DownloadProgress>();
    private readonly _destroy$ = new Subject<void>();

    constructor(private readonly _videoCacheService: VideoCacheService) { }

    ngOnInit(): void {
        this._videoCacheService
            .getDownloadProgress$()
            .pipe(takeUntil(this._destroy$))
            .subscribe((progress) => {
                this.downloadProgress = progress;
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    getProgressList(): DownloadProgress[] {
        return Array.from(this.downloadProgress.values());
    }

    getStatusText(progress: DownloadProgress): string {
        switch (progress.status) {
            case 'pending':
                return 'Waiting...';
            case 'downloading':
                return `Downloading... ${progress.progress}%`;
            case 'completed':
                return 'Completed ✓';
            case 'failed':
                return 'Failed ✗';
            default:
                return '';
        }
    }

    getStatusClass(status: DownloadProgress['status']): string {
        return `status-${status}`;
    }
}
