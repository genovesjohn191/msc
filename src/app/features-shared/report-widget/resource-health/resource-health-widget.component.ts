import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { McsReportResourceHealth } from '@app/models';
import { ChartConfig } from '@app/shared';
import { unsubscribeSafely } from '@app/utilities';

@Component({
  selector: 'mcs-resource-health-widget',
  templateUrl: './resource-health-widget.component.html',
  styleUrls: ['./resource-health-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class ResourceHealthWidgetComponent implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'donut',
    labels: ['Healthy', 'Unhealthy', 'Not Applicable'],
    height: '380px'
  };

  public data$: Observable<McsReportResourceHealth>;
  public dataBehavior: BehaviorSubject<McsReportResourceHealth>;
  public hasError: boolean = false;
  public processing: boolean = true;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private reportingService: McsReportingService
  ) {
    this.getData();
  }

  ngOnInit(): void {
    this.dataBehavior = new BehaviorSubject<McsReportResourceHealth>(null);
    this.data$ = this.dataBehavior.asObservable();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.dataBehavior);
  }

  public getData(): void {
    this.hasError = false;
    this.processing = true;
    this._changeDetectorRef.markForCheck();

    this.reportingService.getResourceHealth()
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetectorRef.markForCheck();
      return throwError('Resource Health endpoint failed.');
    }))
    .subscribe((result) => {
      this.dataBehavior.next(result);
      this.processing = false;
      this._changeDetectorRef.markForCheck();
    });
  }
}
