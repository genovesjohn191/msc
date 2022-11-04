import { Subject } from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { McsDataStatusFactory } from '@app/core';
import { DataStatus } from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  DataProcess,
  DataProcessStatus
} from '@app/utilities';

@Component({
  selector: 'mcs-report-widget-data-status',
  templateUrl: './report-widget-data-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'status-message-wrapper'
  }
})

export class ReportWidgetDataStatusComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public hasError: boolean = false;

  @Input()
  public processing: boolean = true;

  @Input()
  public dataStatus: McsDataStatusFactory<any> | DataProcess<any>;

  @Output()
  public retry = new EventEmitter<void>();

  private _destroySubject = new Subject<void>();

  constructor(private _changeDetectorRef: ChangeDetectorRef) {

  }

  public ngOnInit(): void {
    this._subscribeToDataStatusChange();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public tryAgain(): void {
    this.retry.next();
  }

  private _subscribeToDataStatusChange(): void {
    if (isNullOrEmpty(this.dataStatus)) { return; }

    if (this.dataStatus instanceof McsDataStatusFactory) {
      this.dataStatus.statusChanged.pipe(
        takeUntil(this._destroySubject),
        tap(status => {
          this._resetStatus();

          switch (status) {
            case DataStatus.PreActive:
            case DataStatus.Active:
              this.processing = true;
              break;

            case DataStatus.Empty:
              this.processing = false;
              break;

            case DataStatus.Error:
              this.hasError = true;
              break;
          }
          this._changeDetectorRef.markForCheck();
        })
      ).subscribe();

    } else {
      this.dataStatus.change.pipe(
        takeUntil(this._destroySubject),
        tap(status => {
          this._resetStatus();

          switch (status) {
            case DataProcessStatus.InProgress:
            case DataProcessStatus.NotYetStarted:
              this.processing = true;
              break;

            case DataProcessStatus.Success:
              this.processing = false;
              this.hasError = false;
              break;

            case DataProcessStatus.Failed:
              this.hasError = true;
              break;
          }
          this._changeDetectorRef.markForCheck();
        })
      ).subscribe();
    }
  }

  private _resetStatus(): void {
    this.hasError = false;
    this.processing = false;
    this._changeDetectorRef.markForCheck();
  }
}
