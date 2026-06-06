import { Injectable } from '@angular/core';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const CACHE_NAME = 'smart-tv-video-cache-v1';
const VIDEO_BASE_URL = 'https://storage.hndsinh.cv/video';
const VIDEO_NAMES = ['introduction', 'animal-health', 'sustainability-vdo'] as const;
const VIDEO_VERSIONS = ['vn', 'en'] as const;

export type VideoName = (typeof VIDEO_NAMES)[number];
export type VideoVersion = (typeof VIDEO_VERSIONS)[number];
type VideoFileName = `${VideoName}-${VideoVersion}`;

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
      return this._remoteUrl(preferredFileName);
    }
  }

  prefetchVideos(version: VideoVersion, names: readonly VideoName[] = VIDEO_NAMES): void {
    names.forEach((name) => {
      void this.getVideoUrl(name, version);
    });
  }

  private _getVideoFileUrl(fileName: VideoFileName): Promise<string> {
    const existingPromise = this._loadPromises.get(fileName);
    if (existingPromise) {
      return existingPromise;
    }

    const loadPromise = this._resolveVideoFileUrl(fileName);
    this._loadPromises.set(fileName, loadPromise);

    return loadPromise;
  }

  private async _resolveVideoFileUrl(fileName: VideoFileName): Promise<string> {
    const objectUrl = this._objectUrls.get(fileName);
    if (objectUrl) {
      return objectUrl;
    }

    const cacheKey = this._remoteUrl(fileName);
    const bundledAssetUrl = await this._findBundledAssetUrl(fileName);
    if (bundledAssetUrl) {
      return bundledAssetUrl;
    }

    if (!('caches' in window)) {
      return cacheKey;
    }

    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      return this._createObjectUrl(fileName, await cachedResponse.blob());
    }

    const response = await this._downloadVideo(fileName);
    if (!response.ok) {
      throw new Error(`Video download failed with status ${response.status}`);
    }

    await cache.put(cacheKey, response.clone());
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
