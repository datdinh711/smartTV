import { Injectable, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { BehaviorSubject, Observable } from 'rxjs';

const CACHE_NAME = 'smart-tv-video-cache-v1';
const SKIPPED_VIDEO_CACHE_KEY = 'smart-tv-skipped-video-cache-v1';
const VIDEO_BASE_URL = 'https://storage.hndsinh.cv/video';
const VIDEO_NAMES = ['introduction', 'animal-health', 'sustainability-vdo'] as const;
const VIDEO_VERSIONS = ['vn', 'en'] as const;

export type VideoName = (typeof VIDEO_NAMES)[number];
export type VideoVersion = (typeof VIDEO_VERSIONS)[number];
export type VideoFileName = `${VideoName}-${VideoVersion}`;

export interface DownloadProgress {
  fileName: VideoFileName;
  progress: number; // 0-100
  loaded: number; // bytes
  total: number; // bytes
  status: 'pending' | 'downloading' | 'completed' | 'failed';
}

export function getVideoVersionFromLanguage(lang: string | null | undefined): VideoVersion {
  return lang === 'en' ? 'en' : 'vn';
}

@Injectable({ providedIn: 'root' })
export class VideoCacheService {
  private readonly _objectUrls = new Map<VideoFileName, string>();
  private readonly _loadPromises = new Map<VideoFileName, Promise<string>>();
  private readonly _downloadQueue: VideoFileName[] = [];
  private _isDownloading = false;

  // Videos to skip downloading
  private readonly _skippedDownloadNames = new Set<VideoFileName>(['introduction-en', 'animal-health-en']);

  // Progress tracking
  private readonly _downloadProgress = new Map<VideoFileName, DownloadProgress>();
  private readonly _progressSubject = new BehaviorSubject<Map<VideoFileName, DownloadProgress>>(new Map());

  constructor(private readonly _ngZone: NgZone) { }

  async getVideoUrl(name: VideoName, version: VideoVersion): Promise<string> {
    const preferredFileName = this._fileName(name, version);
    const fallbackFileName = this._fileName(name, this._fallbackVersion(version));

    try {
      return await this._getVideoFileUrl(preferredFileName);
    } catch (error) {
      console.warn(`Could not load video "${preferredFileName}". Trying fallback "${fallbackFileName}".`, error);
    }

    try {
      return await this._getVideoFileUrl(fallbackFileName);
    } catch (error) {
      console.error(`Could not load fallback video "${fallbackFileName}". Falling back to streaming URL.`, error);
      // Stream now, download in background so next load uses the cache
      this._scheduleBackgroundDownload(preferredFileName);
      return this._remoteUrl(preferredFileName);
    }
  }

  prefetchVideos(names: readonly VideoName[] = VIDEO_NAMES): void {
    VIDEO_VERSIONS.forEach((version) => {
      names.forEach((name) => {
        void this.getVideoUrl(name, version);
      });
    });
  }

  getDownloadProgress$(): Observable<Map<VideoFileName, DownloadProgress>> {
    return this._progressSubject.asObservable();
  }

  getRequiredVideoFiles(): VideoFileName[] {
    return VIDEO_NAMES.flatMap((name) =>
      VIDEO_VERSIONS.map((version) => this._fileName(name, version)),
    );
  }

  async getMissingRequiredVideoFiles(): Promise<VideoFileName[]> {
    const missingFiles: VideoFileName[] = [];

    for (const fileName of this.getRequiredVideoFiles()) {
      if (this.isVideoSkipped(fileName)) {
        continue;
      }

      if (this._skippedDownloadNames.has(fileName)) {
        continue;
      }

      if (!(await this.hasVideoFile(fileName))) {
        missingFiles.push(fileName);
      }
    }

    return missingFiles;
  }

  async hasVideoFile(fileName: VideoFileName): Promise<boolean> {
    if (this._objectUrls.has(fileName)) {
      return true;
    }

    if (await this._findBundledAssetUrl(fileName)) {
      return true;
    }

    // Check Cache API
    if ('caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(this._remoteUrl(fileName));
        if (cachedResponse) {
          return true;
        }
      } catch (err) {
        console.warn(`[VideoCacheService] Cache API error for ${fileName}:`, err);
      }
    }

    // Check Filesystem (mobile)
    if (this._isNativePlatform()) {
      try {
        const exists = await this._hasFileInFilesystem(fileName);
        if (exists) {
          return true;
        }
      } catch (err) {
        console.warn(`[VideoCacheService] Filesystem check error for ${fileName}:`, err);
      }
    }

    return false;
  }

  async downloadVideoFile(fileName: VideoFileName): Promise<void> {
    // Skip downloading for specific videos
    if (this._skippedDownloadNames.has(fileName)) {
      console.log(`[VideoCacheService] Skipping download for: ${fileName}`);
      return;
    }

    this._loadPromises.delete(fileName);

    // Initialize progress
    this._updateProgress(fileName, 0, 0, 'pending');

    // Add to queue for sequential download
    if (!this._downloadQueue.includes(fileName)) {
      this._downloadQueue.push(fileName);
    }

    await this._processDownloadQueue();
  }

  isVideoSkipped(fileName: VideoFileName): boolean {
    return this._getSkippedVideoFiles().includes(fileName);
  }

  markVideoSkipped(fileName: VideoFileName): void {
    const skippedFiles = new Set(this._getSkippedVideoFiles());
    skippedFiles.add(fileName);
    localStorage.setItem(SKIPPED_VIDEO_CACHE_KEY, JSON.stringify([...skippedFiles]));
  }

  private _getSkippedVideoFiles(): VideoFileName[] {
    try {
      const rawValue = localStorage.getItem(SKIPPED_VIDEO_CACHE_KEY);
      const parsedValue = rawValue ? JSON.parse(rawValue) : [];
      const requiredFiles = new Set(this.getRequiredVideoFiles());

      return Array.isArray(parsedValue)
        ? parsedValue.filter((value): value is VideoFileName => requiredFiles.has(value))
        : [];
    } catch {
      return [];
    }
  }

  private _scheduleBackgroundDownload(fileName: VideoFileName): void {
    // Remove any stale/rejected promise so a fresh attempt is made
    this._loadPromises.delete(fileName);

    const promise = this._resolveVideoFileUrl(fileName);
    this._loadPromises.set(fileName, promise);

    promise.then(
      () => console.log(`[VideoCacheService] Background download complete: ${fileName}`),
      (err) => {
        console.warn(`[VideoCacheService] Background download failed: ${fileName}`, err);
        if (this._loadPromises.get(fileName) === promise) {
          this._loadPromises.delete(fileName);
        }
      },
    );
  }

  private async _processDownloadQueue(): Promise<void> {
    if (this._isDownloading) {
      return;
    }

    this._isDownloading = true;

    while (this._downloadQueue.length > 0) {
      const fileName = this._downloadQueue.shift();
      if (!fileName) {
        break;
      }

      try {
        console.log(`[VideoCacheService] Starting sequential download: ${fileName}`);
        this._updateProgress(fileName, 0, 0, 'downloading');
        await this._getVideoFileUrl(fileName);
        console.log(`[VideoCacheService] Sequential download completed: ${fileName}`);
      } catch (error) {
        console.error(`[VideoCacheService] Sequential download failed: ${fileName}`, error);
        this._updateProgress(fileName, 0, 0, 'failed');
      }
    }

    this._isDownloading = false;
  }

  private _getVideoFileUrl(fileName: VideoFileName): Promise<string> {
    const existingPromise = this._loadPromises.get(fileName);
    if (existingPromise) {
      return existingPromise;
    }

    const loadPromise = this._resolveVideoFileUrl(fileName);
    this._loadPromises.set(fileName, loadPromise);

    // Remove rejected promises so future calls can retry instead of failing immediately
    loadPromise.catch(() => {
      if (this._loadPromises.get(fileName) === loadPromise) {
        this._loadPromises.delete(fileName);
      }
    });

    return loadPromise;
  }

  private async _resolveVideoFileUrl(fileName: VideoFileName): Promise<string> {
    const objectUrl = this._objectUrls.get(fileName);
    if (objectUrl) {
      return objectUrl;
    }

    const bundledAssetUrl = await this._findBundledAssetUrl(fileName);
    if (bundledAssetUrl) {
      return bundledAssetUrl;
    }

    // Native platform: serve via native URI — no large blob in JS memory
    if (this._isNativePlatform()) {
      // Check if already on disk
      const cachedUrl = await this._getNativePlaybackUrl(fileName);
      if (cachedUrl) {
        console.log(`[VideoCacheService] Found in Filesystem: ${fileName}`);
        this._objectUrls.set(fileName, cachedUrl);
        return cachedUrl;
      }

      if (this._skippedDownloadNames.has(fileName)) {
        throw new Error(`Video "${fileName}" is marked for skip download. Using streaming URL instead.`);
      }

      // Download directly to disk via Filesystem.downloadFile
      await this._downloadToFilesystem(fileName);

      const downloadedUrl = await this._getNativePlaybackUrl(fileName);
      if (!downloadedUrl) {
        throw new Error(`Failed to resolve video URL after download: ${fileName}`);
      }
      this._objectUrls.set(fileName, downloadedUrl);
      return downloadedUrl;
    }

    const cacheKey = this._remoteUrl(fileName);

    // Try Cache API (web)
    if ('caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
          console.log(`[VideoCacheService] Found in Cache API: ${fileName}`);
          return this._createObjectUrl(fileName, await cachedResponse.blob());
        }
      } catch (cacheErr) {
        console.warn(`[VideoCacheService] Cache API error: ${cacheErr}`);
      }
    }

    // Skip downloading for specific videos - throw error to use streaming fallback
    if (this._skippedDownloadNames.has(fileName)) {
      throw new Error(`Video "${fileName}" is marked for skip download. Using streaming URL instead.`);
    }

    // Web: download with progress tracking
    const response = await this._downloadVideoWithProgress(this._remoteUrl(fileName), fileName);
    if (!response.ok) {
      throw new Error(`Video download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    console.log(`[VideoCacheService] Downloaded blob: ${fileName}, size: ${blob.size} bytes`);

    // Save to Cache API (web)
    if ('caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(cacheKey, new Response(blob.slice(), { headers: { 'Content-Type': 'video/mp4' } }));
        console.log(`[VideoCacheService] Saved to Cache API: ${fileName}`);
      } catch (cacheErr) {
        console.warn(`[VideoCacheService] Failed to save to Cache API: ${cacheErr}`);
      }
    }

    return this._createObjectUrl(fileName, blob);
  }

  private async _findBundledAssetUrl(fileName: VideoFileName): Promise<string | null> {
    const assetPath = `assets/videos/${fileName}.mp4`;

    try {
      const response = await fetch(assetPath, {
        cache: 'no-store',
        method: 'HEAD',
      });

      return response.ok ? assetPath : null;
    } catch {
      return null;
    }
  }

  private _isNativePlatform(): boolean {
    try {
      // Check if Capacitor is available and platform is native
      if (!Capacitor || !Capacitor.isNativePlatform()) {
        return false;
      }

      // Also check if Filesystem plugin is available
      if (!Filesystem) {
        console.warn('[VideoCacheService] Filesystem plugin not available');
        return false;
      }

      return true;
    } catch (err) {
      console.warn('[VideoCacheService] Error checking native platform:', err);
      return false;
    }
  }

  private async _downloadVideoWithProgress(url: string, fileName: VideoFileName): Promise<Response> {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.body) {
      return response;
    }

    const total = parseInt(response.headers.get('content-length') || '0', 10);
    const reader = response.body.getReader();
    let loaded = 0;

    const chunks: Uint8Array[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        loaded += value.length;

        // Update progress
        this._updateProgress(fileName, loaded, total);
      }
    } finally {
      reader.releaseLock();
    }

    // Mark as completed
    this._updateProgress(fileName, loaded, total, 'completed');

    const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
    return new Response(blob, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  private _updateProgress(
    fileName: VideoFileName,
    loaded: number,
    total: number,
    status: 'pending' | 'downloading' | 'completed' | 'failed' = 'downloading',
  ): void {
    const progress: DownloadProgress = {
      fileName,
      progress: total > 0 ? Math.round((loaded / total) * 100) : 0,
      loaded,
      total,
      status,
    };

    this._downloadProgress.set(fileName, progress);
    // Run inside NgZone so Angular's change detection fires even when called
    // from Capacitor native callbacks that execute outside NgZone.
    this._ngZone.run(() => {
      this._progressSubject.next(new Map(this._downloadProgress));
    });
  }

  /**
   * Returns a web-accessible URL for a video stored in the native filesystem.
   * Uses Filesystem.getUri + Capacitor.convertFileSrc so the WebView streams
   * the file directly from disk — no large blob ever enters JS memory.
   */
  private async _getNativePlaybackUrl(fileName: VideoFileName): Promise<string | null> {
    try {
      if (!Filesystem?.getUri) return null;
      // stat() throws if the file does not exist
      await Filesystem.stat({ path: `videos/${fileName}.mp4`, directory: Directory.Data });
      const result = await Filesystem.getUri({ path: `videos/${fileName}.mp4`, directory: Directory.Data });
      return Capacitor.convertFileSrc(result.uri);
    } catch {
      return null;
    }
  }

  /**
   * Downloads a video to the device filesystem.
   * Primary: Filesystem.downloadFile (native HTTP, no JS memory).
   * Fallback: fetch() via WebView (Chromium SSL) + chunked appendFile (no OOM).
   */
  private async _downloadToFilesystem(fileName: VideoFileName): Promise<void> {
    const url = this._remoteUrl(fileName);
    console.log(`[VideoCacheService] Downloading to filesystem: ${url}`);
    this._updateProgress(fileName, 0, 0, 'downloading');

    // Primary: native download — file goes straight from network to disk
    const progressHandle = await Filesystem.addListener('progress', (event) => {
      if (event.url === url) {
        this._updateProgress(fileName, event.bytes, event.contentLength);
      }
    });
    try {
      await Filesystem.downloadFile({
        url,
        path: `videos/${fileName}.mp4`,
        directory: Directory.Data,
        recursive: true,
        progress: true,
      });
      this._updateProgress(fileName, 1, 1, 'completed');
      console.log(`[VideoCacheService] ✅ Downloaded to filesystem (native): ${fileName}`);
      return;
    } catch (nativeErr) {
      console.warn(`[VideoCacheService] Native download failed, falling back to fetch: ${nativeErr}`);
      this._updateProgress(fileName, 0, 0, 'downloading');
    } finally {
      await progressHandle.remove();
    }

    // Fallback: WebView fetch (Chromium SSL) → write in 768 KB chunks → no OOM
    await this._downloadToFilesystemViaFetch(fileName, url);
  }

  /**
   * Streams the video via fetch() and writes it to the filesystem in 768 KB
   * chunks using writeFile + appendFile. Each chunk is ≤1 MB in memory.
   * 768 KB = 3 × 256 × 1024, so each chunk base64-encodes without padding.
   */
  private async _downloadToFilesystemViaFetch(fileName: VideoFileName, url: string): Promise<void> {
    const CHUNK_SIZE = 3 * 256 * 1024; // 768 KB

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok || !response.body) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const total = parseInt(response.headers.get('content-length') || '0', 10);
    const reader = response.body.getReader();
    let isFirstChunk = true;
    let buffer = new Uint8Array(0);
    let loaded = 0;

    // Remove any partial file from a previous failed attempt
    try { await Filesystem.deleteFile({ path: `videos/${fileName}.mp4`, directory: Directory.Data }); } catch { /* ok if absent */ }

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (value) {
          const combined = new Uint8Array(buffer.length + value.length);
          combined.set(buffer, 0);
          combined.set(value, buffer.length);
          buffer = combined;
        }

        // On done flush everything; otherwise only flush complete CHUNK_SIZE pieces
        const flushSize = done
          ? buffer.length
          : Math.floor(buffer.length / CHUNK_SIZE) * CHUNK_SIZE;

        if (flushSize > 0) {
          const chunk = buffer.slice(0, flushSize);
          buffer = buffer.slice(flushSize);
          await this._writeChunkToFile(fileName, chunk, isFirstChunk);
          loaded += chunk.length;
          isFirstChunk = false;
          this._updateProgress(fileName, loaded, total);
        }

        if (done) break;
      }

      this._updateProgress(fileName, total || loaded, total || loaded, 'completed');
      console.log(`[VideoCacheService] ✅ Downloaded to filesystem (fetch): ${fileName}`);
    } catch (err) {
      // Clean up partial file so the next launch re-downloads cleanly
      try { await Filesystem.deleteFile({ path: `videos/${fileName}.mp4`, directory: Directory.Data }); } catch { /* ok */ }
      throw err;
    } finally {
      reader.releaseLock();
    }
  }

  private async _writeChunkToFile(fileName: VideoFileName, chunk: Uint8Array, isFirst: boolean): Promise<void> {
    // Build binary string in 32 KB batches to avoid O(n²) string concat and stack overflow
    const SPREAD_LIMIT = 32768;
    let binary = '';
    for (let offset = 0; offset < chunk.length; offset += SPREAD_LIMIT) {
      binary += String.fromCharCode.apply(
        null,
        chunk.subarray(offset, offset + SPREAD_LIMIT) as unknown as number[],
      );
    }
    const base64 = btoa(binary);
    const path = `videos/${fileName}.mp4`;

    if (isFirst) {
      await Filesystem.writeFile({ path, data: base64, directory: Directory.Data, recursive: true });
    } else {
      await Filesystem.appendFile({ path, data: base64, directory: Directory.Data });
    }
  }

  private async _hasFileInFilesystem(fileName: VideoFileName): Promise<boolean> {
    try {
      if (!Filesystem?.stat) return false;
      await Filesystem.stat({ path: `videos/${fileName}.mp4`, directory: Directory.Data });
      return true;
    } catch {
      return false;
    }
  }

  private _createObjectUrl(fileName: VideoFileName, blob: Blob): string {
    console.log(`[VideoCacheService] Creating object URL for ${fileName}, blob size: ${blob.size} bytes, type: ${blob.type}`);
    const objectUrl = URL.createObjectURL(blob);
    this._objectUrls.set(fileName, objectUrl);
    console.log(`[VideoCacheService] Created object URL: ${objectUrl}`);

    return objectUrl;
  }

  private _remoteUrl(fileName: VideoFileName): string {
    return `${VIDEO_BASE_URL}/${fileName}.mp4`;
  }

  private _fileName(name: VideoName, version: VideoVersion): VideoFileName {
    return `${name}-${version}`;
  }

  private _fallbackVersion(version: VideoVersion): VideoVersion {
    return version === 'en' ? 'vn' : 'en';
  }
}
