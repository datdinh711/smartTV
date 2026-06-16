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
import { VideoPlayingService } from '@shared/services';

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
  private _isPlaying = false;

  @ViewChild('videoElement')
  private readonly _videoElement?: ElementRef<HTMLVideoElement>;

  constructor(private readonly _videoPlayingService: VideoPlayingService) { }

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
    this._setPlaying(false);
    this.videoEnded.emit();
  }

  onPause(): void {
    // this._setPlaying(false);
  }

  onError(): void {
    this._setPlaying(false);
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
      playPromise.then(() => {
        this._setPlaying(true);
      }).catch(() => {
        // Autoplay can still be blocked on some platforms until the kiosk shell allows it.
      });
    }
  }

  private _teardownVideo(): void {
    const video = this._videoElement?.nativeElement;

    if (!video) {
      return;
    }

    this._setPlaying(false);
    video.pause();
    video.removeAttribute('src');
    video.load();
  }

  private _resetVideoElement(): void {
    const video = this._videoElement?.nativeElement;

    if (!video) {
      return;
    }

    this._setPlaying(false);
    video.pause();
    video.currentTime = 0;
    video.load();
  }

  private _setPlaying(playing: boolean): void {
    if (playing === this._isPlaying) return;
    this._isPlaying = playing;
    if (playing) {
      this._videoPlayingService.markPlaying();
    } else {
      this._videoPlayingService.markStopped();
    }
  }
}
