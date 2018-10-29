import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs';
import { tap } from 'rxjs/operators';
import { McsLoadingService } from '@app/core';
import {
  unsubscribeSafely,
  animateFactory
} from '@app/utilities';

@Component({
  selector: 'mcs-content-panel',
  templateUrl: './content-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeOut
  ],
  host: {
    'class': 'content-panel-wrapper'
  }
})

export class ContentPanelComponent implements OnInit, OnDestroy {
  public isLoading$: Observable<boolean>;
  public loadingText$: Observable<string>;

  private _destroySubject = new Subject<void>();

  constructor(
    private _loaderService: McsLoadingService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this._subscribeToLoadingStateChange();
    this._subscribeToLoadingTextChange();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Subscribe to the loading state change
   */
  private _subscribeToLoadingStateChange(): void {
    this.isLoading$ = this._loaderService.loadingStateChange().pipe(
      tap(() => this._changeDetectorRef.markForCheck())
    );
  }

  /**
   * Subscribe to loading text changes
   */
  private _subscribeToLoadingTextChange(): void {
    this.loadingText$ = this._loaderService.loadingTextChange().pipe(
      tap(() => this._changeDetectorRef.markForCheck())
    );
  }
}
