import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare var YT: any;

interface Slide {
  type: 'image' | 'video';
  src: string;
  safeSrc?: SafeResourceUrl;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  slides: Slide[] = [];

  currentIndex = 0;
  previousIndex = -1;
  direction: 'next' | 'back' = 'next';
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private videoEndTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private player: any = null;
  private ytApiReady = false;
  private videoBaseUrls: Map<number, string> = new Map();

  constructor(
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
  ) {
    this.slides = [
      { type: 'image', src: 'assets/images/hinh-nen-1920-1080-thumbnail.jpg' },
      {
        type: 'image',
        src: 'assets/images/hinh-nen-1920-1080-thumbnail-2.jpg',
      },
      {
        type: 'video',
        src: 'https://www.youtube.com/embed/krDWc30PAGg',
        safeSrc: this.sanitizer.bypassSecurityTrustResourceUrl('about:blank'),
      },
    ];

    // Store base URLs for video slides
    this.slides.forEach((slide, i) => {
      if (slide.type === 'video') {
        this.videoBaseUrls.set(i, slide.src);
      }
    });

    this.loadYouTubeAPI();
  }

  ngOnInit(): void {
    this.handleSlideChange();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    this.clearVideoEndTimeout();
    this.player = null;
  }

  next(): void {
    this.direction = 'next';
    this.previousIndex = this.currentIndex;
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.handleSlideChange();
  }

  back(): void {
    this.direction = 'back';
    this.previousIndex = this.currentIndex;
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.handleSlideChange();
  }

  goTo(index: number): void {
    if (index === this.currentIndex) return;
    this.direction = index > this.currentIndex ? 'next' : 'back';
    this.previousIndex = this.currentIndex;
    this.currentIndex = index;
    this.handleSlideChange();
  }

  private handleSlideChange(): void {
    this.stopAutoSlide();
    this.clearVideoEndTimeout();
    this.player = null;

    // Reset all video slides to blank, set active video to real URL
    this.slides.forEach((slide, i) => {
      if (slide.type === 'video') {
        const baseUrl = this.videoBaseUrls.get(i)!;
        if (i === this.currentIndex) {
          slide.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
            baseUrl + '?enablejsapi=1',
          );
        } else {
          slide.safeSrc =
            this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
        }
      }
    });

    const currentSlide = this.slides[this.currentIndex];
    if (currentSlide.type === 'video') {
      // Wait for animation + iframe load, then attach YT player
      setTimeout(() => this.initVideoPlayer(), 1500);
    } else {
      this.startAutoSlide();
    }
  }

  private loadYouTubeAPI(): void {
    if ((window as any).YT && (window as any).YT.Player) {
      this.ytApiReady = true;
      return;
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      this.ngZone.run(() => {
        this.ytApiReady = true;
        if (this.slides[this.currentIndex]?.type === 'video') {
          this.initVideoPlayer();
        }
      });
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);
  }

  private initVideoPlayer(): void {
    if (!this.ytApiReady) return;

    const iframeId = 'video-iframe-' + this.currentIndex;
    const iframe = document.getElementById(iframeId);
    if (!iframe) return;

    this.player = new YT.Player(iframeId, {
      events: {
        onStateChange: (event: any) => {
          if (event.data === YT.PlayerState.ENDED) {
            this.ngZone.run(() => {
              // Wait 10s after video ends, then go to next slide
              this.videoEndTimeoutId = setTimeout(() => this.next(), 10000);
            });
          }
        },
      },
    });
  }

  private clearVideoEndTimeout(): void {
    if (this.videoEndTimeoutId) {
      clearTimeout(this.videoEndTimeoutId);
      this.videoEndTimeoutId = null;
    }
  }

  private startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.direction = 'next';
      this.previousIndex = this.currentIndex;
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
      this.handleSlideChange();
    }, 5000);
  }

  private stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
