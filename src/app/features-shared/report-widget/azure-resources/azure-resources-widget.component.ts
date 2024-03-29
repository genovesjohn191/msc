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
import {
  ChartConfig,
  ChartItem
} from '@app/shared';
import { McsReportingService } from '@app/core';
import { catchError } from 'rxjs/operators';
import {
  CommonDefinition,
  unsubscribeSafely
} from '@app/utilities';
import { ReportWidgetBase } from '../report-widget.base';

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

export class AzureResourcesWidgetComponent extends ReportWidgetBase implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'bar',
    height: '380px'
  }

  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  public get cloudHealthUrl(): string  {
    return CommonDefinition.CLOUD_HEALTH_URL;
  }

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService)
  {
    super();
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
    this.updateChartUri(undefined);
    this._changeDetectorRef.markForCheck();

    this._reportingService.getAzureServicesReport()
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this.updateChartUri('');
      this._changeDetectorRef.markForCheck();
      return throwError('Azure resources endpoint failed.');
    }))
    .subscribe((result) => {
      if (result.length === 0) {
        this.updateChartUri('');
      };
      result = result.slice(0, maxResourcesToDisplay);
      this.dataBehavior.next(result);
      this.processing = false;
      this._changeDetectorRef.markForCheck();
    });
  }
}
