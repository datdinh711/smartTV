import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationHistoryService {
  private _currentPath: string;
  private _previousPath: string = '';

  constructor(private readonly _router: Router) {
    this._currentPath = this._normalizePath(this._router.url);

    this._router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nextPath = this._normalizePath(event.urlAfterRedirects);

        if (nextPath === this._currentPath) {
          return;
        }

        this._previousPath = this._currentPath;
        this._currentPath = nextPath;
      });
  }

  getPreviousPath(): string {
    return this._previousPath;
  }

  private _normalizePath(path: string): string {
    return path.replace(/^\/+/, '');
  }
}
