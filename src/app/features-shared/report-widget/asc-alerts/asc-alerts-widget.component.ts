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
  McsReportingService
} from '@app/core';
import {
  McsFilterInfo,
  McsReportAscAlerts
} from '@app/models';
import {
  createObject,
  isNullOrEmpty,
  setDateToFirstDayOftheMonth,
  setDateToLastDayOftheMonth
} from '@app/utilities';
import { StdDateFormatPipe } from '@app/shared';
import { ReportPeriod } from '../report-period.interface';

export interface AscAlertsWidgetConfig {
  period: Date
}

@Component({
  selector: 'mcs-asc-alerts-widget',
  templateUrl: './asc-alerts-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class AscAlertsWidgetComponent implements OnInit {
  @Input()
  public set config(value: AscAlertsWidgetConfig) {
    let validValue = !isNullOrEmpty(value)
      && JSON.stringify(this._config) !== JSON.stringify(value);
    if (!validValue) { return; }

    this._config = value;
    let selectedPeriod = this._setStartEndDate(value.period);
    this._startPeriod = selectedPeriod.from.toString();
    this._endPeriod = selectedPeriod.until.toString();
    this.retryDatasource();
  }

  @Output()
  public dataChange= new EventEmitter<McsReportAscAlerts[]>(null);

  public readonly dataSource: McsTableDataSource2<McsReportAscAlerts>;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'severity' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'affectedResource' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'startTime' })
  ];

  private _config: AscAlertsWidgetConfig;
  private _startPeriod: string = '';
  private _endPeriod: string = '';

  constructor(
    private _reportingService: McsReportingService,
    private _datePipe: StdDateFormatPipe
  ) {
    this.dataSource = new McsTableDataSource2(this._getAscAlerts.bind(this));
  }

  ngOnInit(): void {
    this._initializeDataColumns();
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _initializeDataColumns(): void {
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  private _getAscAlerts(): Observable<McsMatTableContext<McsReportAscAlerts>> {
    this.dataChange.emit(undefined);
    return this._reportingService.getAscAlerts(this._startPeriod, this._endPeriod).pipe(
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
      from: this._datePipe.transform(new Date(`${firstDateOfTheMonth} UTC`), 'tracksDateTime'),
      until: this._datePipe.transform(new Date(`${lastDateOfTheMonth} UTC`), 'tracksDateTime')
    }
  }
}