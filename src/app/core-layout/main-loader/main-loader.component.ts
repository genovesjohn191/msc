import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import {
  Subject,
  timer
} from 'rxjs';
import {
  takeUntil,
  tap,
  distinctUntilChanged,
  debounceTime
} from 'rxjs/operators';
import { McsLoadingService } from '@app/core';
import {
  unsubscribeSafely,
  getRandomNumber
} from '@app/utilities';

const LOADER_INITIAL_MIN_VALUE = 5;
const LOADER_INITIAL_MAX_VALUE = 100;
const LOADER_MAX_VALUE = 1000;
const LOADER_INTERVAL_MS = 500;

@Component({
  selector: 'mcs-main-loader',
  templateUrl: './main-loader.component.html',
  styleUrls: ['./main-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'main-loader-wrapper'
  }
})

export class MainLoaderComponent implements OnInit, OnDestroy {
  public hidden: boolean = true;
  public progressValue = 0;
  public progressMax = LOADER_MAX_VALUE;

  private _destroySubject = new Subject<void>();
  private _progressSubject = new Subject<void>();

  constructor(
    private _loadingService: McsLoadingService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this._subscribeToLoadingStateChange();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._progressSubject);
  }

  /**
   * Event that emits when the progress bar completed
   */
  public onProgressCompleted(): void {
    this.hidden = true;
    this._changeDetectorRef.markForCheck();
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
    this.progressValue = getRandomNumber(LOADER_INITIAL_MIN_VALUE, LOADER_INITIAL_MAX_VALUE);
    this._updateProgressBar();
  }

  /**
   * Update progress bar value
   */
  private _updateProgressBar(): void {
    this._progressSubject.next();

    let progressTimer = timer(LOADER_INTERVAL_MS, LOADER_INTERVAL_MS).pipe(
      takeUntil(this._progressSubject),
      tap(() => {
        let percentageMax = this.progressMax * 0.9;
        this.progressValue = getRandomNumber(this.progressValue, percentageMax);
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
  }

  /**
   * Subscribe to the loading state change
   */
  private _subscribeToLoadingStateChange(): void {
    this._loadingService.loadingStateChange().pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged(),
      debounceTime(100),
      tap(this._setProgressBarVisibility.bind(this))
    ).subscribe();
  }
}
