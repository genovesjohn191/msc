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

const maxResourcesToDisplay = 10;
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
      result = result.slice(0, maxResourcesToDisplay);

      let data = [
        {
          name: '1',
          xValue: 'Virtual machines|4201.33',
          yValue: 17,
        },
        {
          name: '1',
          xValue: 'SQL Managed Instance|944.20',
          yValue: 14,
        },
        {
          name: '1',
          xValue: 'Apps|500.00',
          yValue: 13,
        },
        {
          name: '1',
          xValue: 'Extensions|1201.33',
          yValue: 7,
        },
        {
          name: '1',
          xValue: 'Workspace|944.20',
          yValue: 3,
        },
        {
          name: '1',
          xValue: 'Networking|-500.00',
          yValue: -1,
        },
        {
          name: '1',
          xValue: 'Firewall|1201.33',
          yValue: -3,
        },
        {
          name: '1',
          xValue: 'Disks|-944.20',
          yValue: -4,
        },
        {
          name: '1',
          xValue: 'Memory|-500.00',
          yValue: -8,
        },
        {
          name: '1',
          xValue: 'Solutions|-1200.00',
          yValue: -11,
        }
      ];

      this.dataBehavior.next(result);
      this.processing = false;
      this._changeDetectorRef.markForCheck();
    });
  }
}
