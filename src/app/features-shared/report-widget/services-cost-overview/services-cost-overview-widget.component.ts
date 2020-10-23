import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  Input
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ChartItem } from '@app/shared';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { ReportPeriod } from '../report-period.interface';

@Component({
  selector: 'mcs-services-cost-overview-widget',
  templateUrl: './services-cost-overview-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ServicesCostOverviewWidgetComponent implements OnInit, OnDestroy {
  @Input()
  public set subscriptionIds(value: string[]) {
    if (value === this._subscriptionIds) {
      return;
    }

    this._subscriptionIds = value;
    this.getData();
  }

  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _subscriptionIds: string[] = [];
  private _startPeriod: string = '';
  private _endPeriod: string = '';

  public constructor(private _changeDetector: ChangeDetectorRef, private reportingService: McsReportingService) {
    this._initializePeriod();
  }

  public ngOnInit() {
    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this.data$ = this.dataBehavior.asObservable();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.dataBehavior);
  }

  public getData(): void {
    this.hasError = false;
    this.processing = true;
    this._changeDetector.markForCheck();

    this.reportingService.getServicesCostOverviewReport(this._startPeriod, this._endPeriod, this._subscriptionIds)
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetector.markForCheck();
      return throwError('Services cost overview endpoint failed.');
    }))
    .subscribe((result) => {
      this.dataBehavior.next(result);
      this.processing = false;
      this._changeDetector.markForCheck();
    });
  }

  private _initializePeriod(): void {
    let from = new Date(new Date().setMonth(new Date().getMonth() - 12));
    let until = new Date(new Date().setMonth(new Date().getMonth()));

    this._startPeriod = `${from.getFullYear()}-${from.getMonth() + 1}`;
    this._endPeriod = `${until.getFullYear()}-${until.getMonth() + 1}`;
  }
}