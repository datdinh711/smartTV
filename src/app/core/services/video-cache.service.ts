import { Injectable } from '@angular/core';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const CACHE_NAME = 'smart-tv-video-cache-v1';
const SKIPPED_VIDEO_CACHE_KEY = 'smart-tv-skipped-video-cache-v1';
const VIDEO_BASE_URL = 'https://storage.hndsinh.cv/video';
const VIDEO_NAMES = ['introduction', 'animal-health', 'sustainability-vdo'] as const;
const VIDEO_VERSIONS = ['vn', 'en'] as const;

export type VideoName = (typeof VIDEO_NAMES)[number];
export type VideoVersion = (typeof VIDEO_VERSIONS)[number];
export type VideoFileName = `${VideoName}-${VideoVersion}`;

export function getVideoVersionFromLanguage(lang: string | null | undefined): VideoVersion {
  return lang === 'en' ? 'en' : 'vn';
}

@Injectable({ providedIn: 'root' })
export class VideoCacheService {
  private readonly _objectUrls = new Map<VideoFileName, string>();
  private readonly _loadPromises = new Map<VideoFileName, Promise<string>>();

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

    if (!('caches' in window)) {
      return false;
    }

    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(this._remoteUrl(fileName));

    return !!cachedResponse;
  }

  async downloadVideoFile(fileName: VideoFileName): Promise<void> {
    this._loadPromises.delete(fileName);
    await this._getVideoFileUrl(fileName);
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

    const cacheKey = this._remoteUrl(fileName);

    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        return this._createObjectUrl(fileName, await cachedResponse.blob());
      }
    }

    // Always attempt download regardless of Cache API availability —
    // creates an in-memory object URL when Cache API is absent (e.g. Tizen)
    const response = await this._downloadVideo(fileName);
    if (!response.ok) {
      throw new Error(`Video download failed with status ${response.status}`);
    }

    if ('caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(cacheKey, response.clone());
      } catch (cacheErr) {
        console.warn(`[VideoCacheService] Failed to persist "${fileName}" to cache:`, cacheErr);
      }
    }

    return this._createObjectUrl(fileName, await response.blob());
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

  private async _downloadVideo(fileName: VideoFileName): Promise<Response> {
    const url = this._remoteUrl(fileName);

    if (Capacitor.isNativePlatform()) {
      return this._downloadVideoWithNativeHttp(url);
    }

    return fetch(url, { cache: 'no-store' });
  }

  private async _downloadVideoWithNativeHttp(url: string): Promise<Response> {
    const response = await CapacitorHttp.get({
      url,
      responseType: 'blob',
      connectTimeout: 30000,
      readTimeout: 120000,
    });
    const contentType = response.headers['content-type'] ?? 'video/mp4';
    const blob = this._base64ToBlob(response.data, contentType);

    return new Response(blob, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  }

  private _base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays: Uint8Array[] = [];
    const sliceSize = 1024;

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
  }

  private _createObjectUrl(fileName: VideoFileName, blob: Blob): string {
    const objectUrl = URL.createObjectURL(blob);
    this._objectUrls.set(fileName, objectUrl);

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
