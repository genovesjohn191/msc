import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  throwError
} from 'rxjs';
import { ChartItem } from '@app/shared';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { catchError } from 'rxjs/operators';
import { unsubscribeSafely } from '@app/utilities';

@Component({
  selector: 'mcs-azure-resources-widget',
  templateUrl: './azure-resources-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class AzureResourcesWidgetComponent implements OnInit, OnDestroy {
  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private reportingService: McsReportingService) {
  }

  public ngOnInit() {
    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this.data$ = this.dataBehavior.asObservable();

    this.getData();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.dataBehavior);
  }

  public getData(): void {
    this.hasError = false;
    this.processing = true;
    this._changeDetectorRef.markForCheck();

    this.reportingService.getAzureServicesReport()
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetectorRef.markForCheck();
      return throwError('Azure resources endpoint failed.');
    }))
    .subscribe((result) => {
      this.dataBehavior.next(result);
      this.processing = false;
      this._changeDetectorRef.markForCheck();
    });
  }
}
