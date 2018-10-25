import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  distinctUntilChanged,
  share
} from 'rxjs/operators';

@Injectable()
export class McsLoadingService {

  private _loadingStateChange: BehaviorSubject<boolean>;
  private _loadingTextChange: BehaviorSubject<string>;
  private _loadingText: string;

  constructor() {
    this._loadingStateChange = new BehaviorSubject(false);
    this._loadingTextChange = new BehaviorSubject('');
  }

  /**
   * An observable event that returns true when the loader should be visible
   */
  public loadingStateChange(): Observable<boolean> {
    return this._loadingStateChange.pipe(
      distinctUntilChanged()
    );
  }

  /**
   * An observable event that emits when the loading text has change
   */
  public loadingTextChange(): Observable<string> {
    return this._loadingTextChange.pipe(
      distinctUntilChanged(),
      share()
    );
  }

  /**
   * Text of the loader when it is displayed
   */
  public get loadingText(): string {
    return this._loadingText;
  }

  /**
   * Shows the loader
   */
  public showLoader(textContent?: string): void {
    this._loadingText = textContent;
    this._loadingStateChange.next(true);
    this._loadingTextChange.next(this._loadingText);
  }

  /**
   * Hides the loader
   */
  public hideLoader(): void {
    this._loadingStateChange.next(false);
    this._loadingText = '';
    this._loadingTextChange.next(this._loadingText);
  }
}
