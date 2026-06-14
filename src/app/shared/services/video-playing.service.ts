import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VideoPlayingService {
  /**
   * Check if any video element on the page is currently playing
   */
  isVideoPlaying(): boolean {
    const videos = Array.from(document.querySelectorAll('video'));
    for (const video of videos) {
      if (!video.paused) {
        return true;
      }
    }
    return false;
  }
}
