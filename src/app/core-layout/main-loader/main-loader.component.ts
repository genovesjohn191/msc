import {
  timer,
  Subject,
  Subscription
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  animateFactory,
  getRandomNumber,
  unsubscribeSafely
} from '@app/utilities';

const LOADER_MAX_VALUE = 100;
const LOADER_INTERVAL_MS = 700;
const LOADER_INITIAL_MIN_VALUE = 5;
const LOADER_INITIAL_MAX_VALUE = LOADER_MAX_VALUE * 0.2;

@Component({
  selector: 'mcs-main-loader',
  templateUrl: './main-loader.component.html',
  styleUrls: ['./main-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.fadeOut
  ],
  host: {
    'class': 'main-loader-wrapper'
  }
})

export class MainLoaderComponent implements OnInit, OnDestroy {
  public hidden: boolean = true;
  public progressValue = 0;
  public progressMax = LOADER_MAX_VALUE;

  private _loadingStateChange = new Subject<boolean>();
  private _destroySubject = new Subject<void>();
  private _progressSubject = new Subject<void>();

  private _showLoaderHandler: Subscription;
  private _hideLoaderHandler: Subscription;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this._registerEvents();
    this._subscribeToLoadingStateChange();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._progressSubject);
    unsubscribeSafely(this._showLoaderHandler);
    unsubscribeSafely(this._hideLoaderHandler);
  }

  /**
   * Returns the progress in scale
   */
  public getProgressScale() {
    let scale = this.progressValue / this.progressMax;
    return { transform: `scaleX(${scale})` };
  }

  /**
   * Set progress bar visibility
   * @param isLoading Loading flag
   */
  private _setProgressBarVisibility(isLoading: boolean): void {
    if (!isLoading) {
      this._endProgressBar();
      return;
    }
    this.hidden = false;
    this._initializeProgressBar();
    this._updateProgressBar();
  }

  /**
   * Initializes the progress bar value
   */
  private _initializeProgressBar(): void {
    if (this.progressValue !== 0) { return; }
    this.progressValue = getRandomNumber(LOADER_INITIAL_MIN_VALUE, LOADER_INITIAL_MAX_VALUE);
  }

  /**
   * Update progress bar value
   */
  private _updateProgressBar(): void {
    this._progressSubject.next();

    let progressTimer = timer(LOADER_INTERVAL_MS, LOADER_INTERVAL_MS).pipe(
      takeUntil(this._progressSubject),
      tap(() => {
        let randomProgressValue = Math.round(getRandomNumber(this.progressValue, this.progressValue + 15));
        this.progressValue = Math.min(
          Math.max(randomProgressValue, this.progressValue),
          LOADER_MAX_VALUE * 0.9
        );
        this._changeDetectorRef.markForCheck();
      })
    );
    progressTimer.subscribe();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Ends the progress bar
   */
  private _endProgressBar(): void {
    this.progressValue = LOADER_MAX_VALUE;
    this._progressSubject.next();
    this._changeDetectorRef.markForCheck();
    setTimeout(() => this._onProgressCompleted(), 250);
  }

  /**
   * Event that emits when the progress bar completed
   */
  private _onProgressCompleted(): void {
    this.hidden = true;
    this.progressValue = 0;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Registers events
   */
  private _registerEvents(): void {
    this._showLoaderHandler = this._eventDispatcher.addEventListener(
      McsEvent.loaderShow, this._onShowLoader.bind(this));

    this._hideLoaderHandler = this._eventDispatcher.addEventListener(
      McsEvent.loaderHide, this._onHideLoader.bind(this));
  }

  /**
   * Shows loader with message
   * @param _message Message to be displayed
   */
  private _onShowLoader(_message: string): void {
    this._loadingStateChange.next(true);
  }

  /**
   * Hides the loader
   */
  private _onHideLoader(): void {
    this._loadingStateChange.next(false);
  }

  /**
   * Subscribe to the loading state change
   */
  private _subscribeToLoadingStateChange(): void {
    this._loadingStateChange.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged(),
      debounceTime(100),
      tap(this._setProgressBarVisibility.bind(this))
    ).subscribe();
  }
}
