import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { NavigatorService } from '@core/services';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slideshow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slideshow.component.html',
  styleUrl: './slideshow.component.scss',
})
export class SlideshowComponent implements OnInit, OnDestroy {
    @ViewChild('slideTrack') slideTrack!: ElementRef;
    
    private _destroy$ = new Subject<void>();
    constructor(
      private readonly _navigatorService: NavigatorService,
      private readonly _inactivityService: InactivityService,
    ) {}
  
  // Sample images - thay đổi với dữ liệu thực tế của bạn
  originalImages: string[] = [
    'assets/images/hinh-nen-1920-1080-thumbnail.jpg',
    'assets/images/hinh-nen-1920-1080-thumbnail-2.jpg',
    'assets/images/hinh-nen-1920-1080-thumbnail.jpg',
    'assets/images/hinh-nen-1920-1080-thumbnail-2.jpg',
  ];

  // Infinite carousel - lặp lại hình ảnh
  images: string[] = [];
  currentIndex = 0;
  autoPlayDelay = 5000; // 5 giây

  // Touch/Drag detection
  touchStartX = 0;
  touchCurrentX = 0;
  touchStartTime = 0;
  isTransitioning = false;
  isDragging = false;
  dragOffset = 0;
  
  // Slide dimensions
  slideWidth = 0;
  isAnimating = false;

  ngOnInit(): void {
    this.initializeInfiniteCarousel();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  initializeInfiniteCarousel(): void {
    if (this.originalImages.length === 0) return;
    
    this.images = [
      this.originalImages[this.originalImages.length - 1],
      ...this.originalImages,
      this.originalImages[0],
    ];
    
    // Bắt đầu từ index 1 (slide thực tế đầu tiên)
    this.currentIndex = 1;
    
    // Lấy chiều rộng slide
    setTimeout(() => {
      if (this.slideTrack) {
        this.slideWidth = this.slideTrack.nativeElement.offsetWidth;
      }
    }, 100);
  }


  /**
   * Chuyển sang slide tiếp theo
   */
  nextSlide(): void {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.currentIndex++;
      this.updateCarouselPosition(true);
      
      // Kiểm tra nếu vượt quá giới hạn
      setTimeout(() => {
        this.checkAndResetPosition();
        this.isAnimating = false;
      }, 300);
    }
  }

  /**
   * Chuyển sang slide trước đó
   */
  previousSlide(): void {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.currentIndex--;
      this.updateCarouselPosition(true);
      
      // Kiểm tra nếu vượt quá giới hạn
      setTimeout(() => {
        this.checkAndResetPosition();
        this.isAnimating = false;
      }, 300);
    }
  }

  /**
   * Cập nhật vị trí carousel
   */
  private updateCarouselPosition(withAnimation: boolean): void {
    if (this.slideTrack) {
      const track = this.slideTrack.nativeElement;
      const offset = -this.currentIndex * 100;
      
      if (withAnimation) {
        track.style.transition = 'transform 0.3s ease-in-out';
      } else {
        track.style.transition = 'none';
      }
      track.style.transform = `translateX(${offset}%)`;
    }
  }

  /**
   * Kiểm tra và reset vị trí nếu đến cuối
   */
  private checkAndResetPosition(): void {
    // Nếu đến slide "clone cuối"
    if (this.currentIndex >= this.images.length - 1) {
      setTimeout(() => {
        this.currentIndex = 1;
        this.updateCarouselPosition(false);
      }, 0);
    }
    // Nếu đến slide "clone đầu"
    else if (this.currentIndex <= 0) {
      setTimeout(() => {
        this.currentIndex = this.originalImages.length;
        this.updateCarouselPosition(false);
      }, 0);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    console.log('keydown', event.key, event.code);
    if (event.key === 'ArrowRight') {
      this.nextSlide();
    } else if (event.key === 'ArrowLeft') {
      this.previousSlide();
    }
  }

  onTouchStart(event: TouchEvent): void {
    if (this.isAnimating) return;
    
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchCurrentX = this.touchStartX;
    this.touchStartTime = Date.now();
    this.isDragging = true;
    this.dragOffset = 0;
    
    // Tắt animation khi bắt đầu drag
    if (this.slideTrack) {
      this.slideTrack.nativeElement.style.transition = 'none';
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || this.isAnimating) return;
    
    this.touchCurrentX = event.changedTouches[0].screenX;
    this.dragOffset = this.touchCurrentX - this.touchStartX;
    
    // Áp dụng drag effect
    if (this.slideTrack) {
      const offset = (-this.currentIndex * 100) + (this.dragOffset / window.innerWidth * 100);
      this.slideTrack.nativeElement.style.transform = `translateX(${offset}%)`;
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    const diff = this.touchStartX - this.touchCurrentX;
    const dragDuration = Date.now() - this.touchStartTime;
    const velocity = Math.abs(diff) / dragDuration;
    const swipeThreshold = 20; // Giảm threshold để dễ trigger
    const velocityThreshold = 0.3; // Tốc độ tối thiểu

    // Nếu drag đủ xa hoặc đủ nhanh
    if (Math.abs(diff) > swipeThreshold || velocity > velocityThreshold) {
      // Swipe trái (next)
      if (diff > 0) {
        this.nextSlide();
      }
      // Swipe phải (previous)
      else if (diff < 0) {
        this.previousSlide();
      }
    } else {
      // Nếu drag không đủ, quay lại vị trí cũ
      this.updateCarouselPosition(true);
    }
  }

  /**
   * Xử lý mouse swipe (cho PC/kiosk)
   */
  onMouseDown(event: MouseEvent): void {
    if (this.isAnimating) return;
    
    this.touchStartX = event.clientX;
    this.touchCurrentX = this.touchStartX;
    this.touchStartTime = Date.now();
    this.isDragging = true;
    this.dragOffset = 0;
    
    // Tắt animation khi bắt đầu drag
    if (this.slideTrack) {
      this.slideTrack.nativeElement.style.transition = 'none';
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || this.isAnimating || event.buttons !== 1) return;
    
    this.touchCurrentX = event.clientX;
    this.dragOffset = this.touchCurrentX - this.touchStartX;
    
    // Áp dụng drag effect
    if (this.slideTrack) {
      const offset = (-this.currentIndex * 100) + (this.dragOffset / window.innerWidth * 100);
      this.slideTrack.nativeElement.style.transform = `translateX(${offset}%)`;
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    const diff = this.touchStartX - this.touchCurrentX;
    const dragDuration = Date.now() - this.touchStartTime;
    const velocity = Math.abs(diff) / dragDuration;
    const swipeThreshold = 20;
    const velocityThreshold = 0.3;

    if (Math.abs(diff) > swipeThreshold || velocity > velocityThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else if (diff < 0) {
        this.previousSlide();
      }
    } else {
      this.updateCarouselPosition(true);
    }
  }

  onMouseLeave(event: MouseEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.updateCarouselPosition(true);
    }
  }

  getCurrentImage(): string {
    return this.images[this.currentIndex];
  }

  hasNextSlide(): boolean {
    return this.originalImages.length > 1;
  }

  setAutoPlayDelay(delay: number): void {
    this.autoPlayDelay = delay;
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.originalImages.length && !this.isAnimating) {
      this.isAnimating = true;
      // +1 vì images có 1 ảnh clone ở đầu
      this.currentIndex = index + 1;
      this.updateCarouselPosition(true);
      
      setTimeout(() => {
        this.isAnimating = false;
      }, 300);
    }
  }

  getActualIndex(): number {
    return this.currentIndex - 1;
  }
}
