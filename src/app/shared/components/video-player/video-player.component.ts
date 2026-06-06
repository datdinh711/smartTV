import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) src: string = '';
  @Input() poster: string = '';
  @Input() loop: boolean = true;
  @Input() muted: boolean = true;
  @Input() loadingText: string = 'Loading...';
  @Input() errorText: string = 'Failed to load video. Please check your internet connection.';
  @Output() videoEnded = new EventEmitter<void>();

  isLoading = true;
  hasError = false;

  @ViewChild('videoElement')
  private readonly _videoElement?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    this._syncAndPlay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && !changes['src'].firstChange) {
      this.isLoading = true;
      this.hasError = false;
      this._resetVideoElement();
      this._syncAndPlay();
    }
  }

  ngOnDestroy(): void {
    this._teardownVideo();
  }

  onCanPlay(): void {
    this.isLoading = false;
    this.hasError = false;
    this._syncAndPlay();
  }

  onEnded(): void {
    this.videoEnded.emit();
  }

  onError(): void {
    this.isLoading = false;
    this.hasError = true;
  }

  private _syncAndPlay(): void {
    const video = this._videoElement?.nativeElement;

    if (!video || !this.src || this.hasError) {
      return;
    }

    video.muted = this.muted;
    video.loop = this.loop;

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay can still be blocked on some platforms until the kiosk shell allows it.
      });
    }
  }

  private _teardownVideo(): void {
    const video = this._videoElement?.nativeElement;

    if (!video) {
      return;
    }

    video.pause();
    video.removeAttribute('src');
    video.load();
  }

  private _resetVideoElement(): void {
    const video = this._videoElement?.nativeElement;

    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
    video.load();
  }
}
