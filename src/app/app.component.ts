import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  NavigatorService,
  SlideshowService,
  VideoCacheService,
  VideoFileName,
} from '@core/services';
import { TranslateService } from '@ngx-translate/core';
import { VideoDownloadProgressComponent } from '@shared/components/video-download-progress/video-download-progress.component';
import { InactivityService, VideoPlayingService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';

const LANG_KEY = 'app_lang';
const DEFAULT_LANG = 'vi';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, VideoDownloadProgressComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'smartTV';
  private readonly _destroy$ = new Subject<void>();

  isVideoBootstrapComplete = false;
  isCheckingVideoCache = true;
  isDownloadingVideoCache = false;
  videoBootstrapTotal = 0;
  videoBootstrapCompleted = 0;
  videoBootstrapFailedFiles: VideoFileName[] = [];

  constructor(
    private readonly _inactivityService: InactivityService,
    private readonly _slideshowService: SlideshowService,
    private readonly _navigatorService: NavigatorService,
    private readonly _videoCacheService: VideoCacheService,
    private readonly _videoPlayingService: VideoPlayingService,
    private readonly _translate: TranslateService
  ) {
    const saved = localStorage.getItem(LANG_KEY) as 'en' | 'vi' | null;
    const lang = saved ?? DEFAULT_LANG;
    this._translate.use(lang);
  }

  ngOnInit(): void {
    void this._bootstrapVideoCache();
  }

  ngOnDestroy(): void {
    this._inactivityService.stop();
    this._slideshowService.stop();
    this._destroy$.next();
    this._destroy$.complete();
  }

  get videoBootstrapProgress(): number {
    if (this.videoBootstrapTotal === 0) {
      return this.isCheckingVideoCache ? 0 : 100;
    }

    return Math.round((this.videoBootstrapCompleted / this.videoBootstrapTotal) * 100);
  }

  get videoBootstrapStatusText(): string {
    if (this.isCheckingVideoCache) {
      return 'Checking video cache...';
    }

    if (this.videoBootstrapFailedFiles.length > 0) {
      return 'Some videos could not be downloaded.';
    }

    return `Downloading videos ${this.videoBootstrapCompleted}/${this.videoBootstrapTotal}`;
  }

  skipFailedVideo(fileName: VideoFileName): void {
    this._videoCacheService.markVideoSkipped(fileName);
    this.videoBootstrapFailedFiles = this.videoBootstrapFailedFiles.filter((file) => file !== fileName);

    if (this.videoBootstrapFailedFiles.length === 0) {
      this._completeVideoBootstrap();
    }
  }

  skipAllFailedVideos(): void {
    this.videoBootstrapFailedFiles.forEach((fileName) => {
      this._videoCacheService.markVideoSkipped(fileName);
    });
    this.videoBootstrapFailedFiles = [];
    this._completeVideoBootstrap();
  }

  retryFailedVideos(): void {
    const failedFiles = [...this.videoBootstrapFailedFiles];
    this.videoBootstrapFailedFiles = [];
    void this._downloadMissingVideoFiles(failedFiles);
  }

  private async _bootstrapVideoCache(): Promise<void> {
    try {
      this.isCheckingVideoCache = true;
      this.isDownloadingVideoCache = false;

      const missingFiles = await this._videoCacheService.getMissingRequiredVideoFiles();

      if (missingFiles.length === 0) {
        this._completeVideoBootstrap();
        return;
      }

      await this._downloadMissingVideoFiles(missingFiles);
    } catch (error) {
      console.error('[AppComponent] Error during video cache bootstrap:', error);
      // Continue with app initialization even if video cache fails
      this._completeVideoBootstrap();
    }
  }

  private async _downloadMissingVideoFiles(files: VideoFileName[]): Promise<void> {
    this.isCheckingVideoCache = false;
    this.isDownloadingVideoCache = true;
    this.videoBootstrapTotal = files.length;
    this.videoBootstrapCompleted = 0;

    // Subscribe to download progress to track completed files
    this._videoCacheService
      .getDownloadProgress$()
      .pipe(takeUntil(this._destroy$))
      .subscribe((progressMap) => {
        // Count completed files
        let completed = 0;
        progressMap.forEach((progress) => {
          if (progress.status === 'completed' || progress.status === 'failed') {
            completed += 1;
          }
        });
        this.videoBootstrapCompleted = completed;
      });

    // Queue all downloads
    const results = await Promise.allSettled(
      files.map((fileName) => this._videoCacheService.downloadVideoFile(fileName)),
    );

    this.videoBootstrapFailedFiles = files.filter((_, index) => results[index].status === 'rejected');
    this.isDownloadingVideoCache = false;

    if (this.videoBootstrapFailedFiles.length === 0) {
      this._completeVideoBootstrap();
    }
  }

  private _completeVideoBootstrap(): void {
    this.isCheckingVideoCache = false;
    this.isDownloadingVideoCache = false;
    this.isVideoBootstrapComplete = true;
    this._startAppServices();
  }

  private _startAppServices(): void {
    this._navigatorService.goToWelcome();
    this._inactivityService.start(30000);

    this._inactivityService.onInactive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        if (this.isDownloadingVideoCache || this.isCheckingVideoCache) {
          console.log('User is inactive but video download in progress, skipping slideshow...');
          return;
        }
        if (this._videoPlayingService.isVideoPlaying()) {
          console.log('User is inactive but video is playing, skipping slideshow...');
          return;
        }
        console.log('User is inactive, starting slideshow...');
        this._slideshowService.start();
      });

    this._inactivityService.onActive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        console.log('User is active, stopping slideshow...');
        if (this._slideshowService.isRunning()) {
          this._slideshowService.stop();
          this._navigatorService.goToWelcome();
        }
      });
  }
}
