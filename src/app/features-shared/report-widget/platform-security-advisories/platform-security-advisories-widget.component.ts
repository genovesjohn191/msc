import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';

import {
  Observable,
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  map,
  takeUntil
} from 'rxjs/operators';

import {
  McsMatTableContext,
  McsTableDataSource2,
  McsReportingService
} from '@app/core';
import {
  McsFilterInfo,
  McsReportParams,
  McsReportPlatformSecurityAdvisories
} from '@app/models';
import {
  CommonDefinition,
  compareStrings,
  createObject,
  isNullOrEmpty
} from '@app/utilities';
import { PeriodOption } from '@app/features-shared/form-fields/field-select-month-period/field-select-month-period.component';

@Component({
  selector: 'mcs-platform-security-advisories-widget',
  templateUrl: './platform-security-advisories-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class PlatformSecurityAdvisoriesWidgetComponent implements OnInit {

  @Output()
  public dataChange= new EventEmitter<McsReportPlatformSecurityAdvisories[]>(null);

  public readonly dataSource: McsTableDataSource2<McsReportPlatformSecurityAdvisories>;

  public fcMonthPeriod: FormControl;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'impactedServices' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'impactedRegions' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'startTime' })
  ];

  private _startPeriod: string = '';
  private _endPeriod: string = '';
  private _config: Date;

  private _destroySubject = new Subject<void>();

  constructor(private _reportingService: McsReportingService) {
    this._registerFormControl();
    this._subscribeToMonthPeriodControlChanges();
    this.dataSource = new McsTableDataSource2();
  }

  public get azurePortalSecurityAnnouncementUrl(): string  {
    return `${CommonDefinition.AZURE_PORTAL_URL}/Microsoft_Azure_Health/AzureHealthBrowseBlade/securityAnnouncements`;
  }

  ngOnInit(): void {
    this._initializeDataColumns();
  }

  public isMultipleValue(value: string[]): boolean {
    if (!Array.isArray(value)) { return; }
    return value?.length > 1;
  }

  public tooltipFormatter(value: string[]): string {
    return value.join(', ');
  }

  public multipleValueText(value: string[]): string {
    let count = value.length - 1;
    return `${value[0]} and ${count} more`;
  }

  public retryDatasource(): void {
    this.dataSource.updateDatasource(this._getPlatformSecurityAdvisories.bind(this));
  }

  private _initializeDataColumns(): void {
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  private _registerFormControl(): void {
    this.fcMonthPeriod = new FormControl('', []);
  }

  private _subscribeToMonthPeriodControlChanges(): void {
    this.fcMonthPeriod.valueChanges.pipe(
      takeUntil(this._destroySubject),
    ).subscribe(change => {
      this._onMonthlyPeriodChange(change);
    });
  }

  private _onMonthlyPeriodChange(selectedDate: PeriodOption): void {
    let sameValue = compareStrings(JSON.stringify(this._config), JSON.stringify(selectedDate.period.from)) === 0;
    let validValue = !isNullOrEmpty(selectedDate.period.from) && !sameValue;
    if (!validValue) { return; }

    this._config = selectedDate.period.from
    this._startPeriod = `${selectedDate.period.from.getFullYear()}-${selectedDate.period.from.getMonth() + 1}`;
    this._endPeriod = `${selectedDate.period.from.getFullYear()}-${selectedDate.period.from.getMonth() + 1}`;
    this.dataSource.updateDatasource(this._getPlatformSecurityAdvisories.bind(this));
  }

  private _getPlatformSecurityAdvisories(): Observable<McsMatTableContext<McsReportPlatformSecurityAdvisories>> {
    let apiQuery = new McsReportParams();
    apiQuery.periodStart = this._startPeriod;
    apiQuery.periodEnd = this._endPeriod;

    this.dataChange.emit(undefined);
    return this._reportingService.getPlatformSecurityAdvisories(apiQuery).pipe(
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
}