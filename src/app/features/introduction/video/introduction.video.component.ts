import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from "@angular/core";
import { NavigatorService } from '@core/services';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from "@angular/common"; // thêm dòng này

@Component({
  selector: 'app-introduction-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './introduction.video.component.html',
  styleUrls: ['./introduction.video.component.scss'],
})
export class IntroductionVideoComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  videoPath: string = '';

  @ViewChild('player') player!: ElementRef<HTMLVideoElement>;

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _inactivityService: InactivityService,
  ) {}

  ngOnInit(): void {
    this._inactivityService.start();
    this._inactivityService.onInactive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        // xử lý khi người dùng không hoạt động
      });
  }

  ngOnDestroy(): void {
    this._inactivityService.stop();
    this._destroy$.next();
    this._destroy$.complete();
  }

  nextSlide() {
    this._navigatorService.goToKeyMilestones();
  }

  previousSlide() {
    this._navigatorService.goToDashboard();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.videoPath = URL.createObjectURL(file);

      setTimeout(() => {
        const videoEl = this.player.nativeElement;
        videoEl.onerror = (err) => {
          console.error("Video error:", err);
        };
        videoEl.onloadeddata = () => {
          videoEl.play().catch(err => {
            console.error("Play error:", err);
          });
        };
      });
    }
  }
}
