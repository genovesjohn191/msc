import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';
import {
  McsMatTableContext,
  McsTableDataSource2,
  McsReportingService,
  McsNavigationService,
  McsAccessControlService
} from '@app/core';
import {
  McsFilterInfo,
  McsPermission,
  McsReportDefenderCloudAlerts,
  RouteKey
} from '@app/models';
import {
  CommonDefinition,
  createObject,
  isNullOrEmpty,
  setDateToFirstDayOftheMonth,
  setDateToLastDayOftheMonth
} from '@app/utilities';
import {
  DialogActionType,
  DialogService2,
  StdDateFormatPipe
} from '@app/shared';
import { ReportPeriod } from '../report-period.interface';
import { TranslateService } from '@ngx-translate/core';

export interface DefenderCloudAlertsWidgetConfig {
  period: Date
}

@Component({
  selector: 'mcs-defender-cloud-alerts-widget',
  templateUrl: './defender-cloud-alerts-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class DefenderCloudAlertsWidgetComponent implements OnInit {
  @Input()
  public set config(value: DefenderCloudAlertsWidgetConfig) {
    let validValue = !isNullOrEmpty(value)
      && JSON.stringify(this._config) !== JSON.stringify(value);
    if (!validValue) { return; }

    this._config = value;
    let selectedPeriod = this._setStartEndDate(value.period);
    this._startPeriod = this._datePipe.transform(selectedPeriod.from, 'tracksDateTime');
    this._endPeriod = this._datePipe.transform(new Date(selectedPeriod.until), 'tracksDateTime');
    this.retryDatasource();
  }

  @Output()
  public dataChange= new EventEmitter<McsReportDefenderCloudAlerts[]>(null);

  public readonly dataSource: McsTableDataSource2<McsReportDefenderCloudAlerts>;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'severity' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'affectedResource' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'startTime' })
  ];

  private _config: DefenderCloudAlertsWidgetConfig;
  private _startPeriod: string = '';
  private _endPeriod: string = '';

  constructor(
    private _accessControlService: McsAccessControlService,
    private _dialogService: DialogService2,
    private _datePipe: StdDateFormatPipe,
    private _reportingService: McsReportingService,
    private _navigationService: McsNavigationService,
    private _translateService: TranslateService
  ) {
    this.dataSource = new McsTableDataSource2(this._getDefenderCloudAlerts.bind(this));
  }

  public get defenderCloudAlertsAzurePortalUrl(): string  {
    return `${CommonDefinition.AZURE_PORTAL_URL}/Microsoft_Azure_Security/SecurityMenuBlade/7`;
  }

  public get hasTicketPermission(): boolean {
    return this._accessControlService.hasPermission([McsPermission.TicketView]);
  }

  ngOnInit(): void {
    this._initializeDataColumns();
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public onClickTicketLink(): void {
    this._navigationService.navigateTo(RouteKey.Tickets, [], {
      queryParams: {
        filter: this._translateService.instant('reports.insights.techReview.defenderCloudAlerts.ticketSearchKeyword')
      }
    });
  }

  public onRowClick(alert: McsReportDefenderCloudAlerts): void {
    this._dialogService.openMessage({
      type: DialogActionType.Info,
      title: alert.title || this._translateService.instant('message.noAlertTitleDialog'),
      message: alert.description || this._translateService.instant('message.noAlertDescriptionDialog'),
      okText: this._translateService.instant('action.dismiss')
    });
  }

  private _initializeDataColumns(): void {
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  private _getDefenderCloudAlerts(): Observable<McsMatTableContext<McsReportDefenderCloudAlerts>> {
    this.dataChange.emit(undefined);
    return this._reportingService.getDefenderCloudAlerts(this._startPeriod, this._endPeriod).pipe(
      map((response) => {
        let dataSourceContext = new McsMatTableContext(response, response?.length);
        this.dataChange.emit(dataSourceContext?.dataRecords);
        return dataSourceContext;
      }),
      catchError((error) => {
        this.dataChange.emit([]);
        return throwError(error);
      })
    );
  }

  private _setStartEndDate(selectedPeriod: Date): ReportPeriod {
    let firstDateOfTheMonth =  new Date(setDateToFirstDayOftheMonth(selectedPeriod));
    let lastDateOfTheMonth = new Date(setDateToLastDayOftheMonth(selectedPeriod).setHours(23, 59, 59));
    return {
      from: new Date(new Date(firstDateOfTheMonth).toUTCString().substr(0, 25)),
      until: new Date(new Date(lastDateOfTheMonth).toUTCString().substr(0, 25))
    }
  }
}