import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  Observable,
  of,
  Subject,
  throwError,
  zip
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  ManagementTag,
  managementTagText,
  McsCloudHealthAlert,
  McsCloudHealthAlertConfigurationItems,
  McsCloudHealthOption,
  McsOption,
  PeriodRange,
  periodRangeText
} from '@app/models';
import {
  createObject,
  getCurrentDate,
  getDayinMonth,
  getFirstDateOfTheMonth,
  getFirstDateOfTheWeek,
  getFirstDateOfTheYear,
  getLastDateOfThePreviousYear,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  CoreValidators,
  McsDateTimeService
} from '@app/core';
import { McsFormGroupDirective } from '@app/shared';
import { CloudHealthAlertType } from './cloudhealth-services';

interface CloudHealthPeriodRange {
  from: Date;
  until: Date;
}

@Component({
  selector: 'mcs-cloudhealth-services',
  templateUrl: './cloudhealth-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CloudHealthServicesComponent implements OnInit, OnDestroy {
  // Forms control
  public fgCloudhealth: FormGroup;
  public fcCloudhealth: FormControl;
  public fcDropdown: FormControl;
  public fcCheckbox: FormControl;

  public cloudHealthPeriodRange$: Observable<McsOption[]>;
  public cloudHealthAlerts$: Observable<McsOption[]>;
  public managementTagOptions$: Observable<McsOption[]>;

  public cloudHealthAlertOptions: McsCloudHealthOption[];
  public alertType: string = '';
  public alertLabel: string = '';
  public alertSubLabel: string = '';
  public isChProcessing: boolean;
  public isChByIdProcessing: boolean;
  public selectedPeriod: PeriodRange;

  private _valueChangesSubject = new Subject<void>();
  private _formGroup: McsFormGroupDirective;

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }

  @Output()
  public dataChange = new EventEmitter<McsCloudHealthOption>();

  constructor(
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dateTimeService: McsDateTimeService,
    private _formBuilder: FormBuilder,
    private _translateService: TranslateService,
  ) { }

  public get managementTagEnum(): any {
    return ManagementTag;
  }

  public get periodRangeEnum(): any {
    return PeriodRange;
  }

  public get cloudhealthAlertTypes(): string[] {
    return Object.values(CloudHealthAlertType);
  }

  public ngOnInit(): void {
    this._registerFormGroup();
    this._subscribeToCloudhealthPeriodRangeOptions();
    this._subscribeToManagementTagOptions();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._valueChangesSubject);
  }

  public get alertManagementTag(): string {
    return CloudHealthAlertType.ManagementTags;
  }

  public onClickPeriodRange(period: McsOption): void {
    let periodRange = this._setPeriodRange(period);
    let periodStart = this._convertPeriodDateToString(periodRange?.from);
    let periodEnd = this._convertPeriodDateToString(periodRange?.until);
    this._resetFormControlValues();
    this.cloudHealthAlertOptions = [];
    this.alertType = '';
    this._getCloudHealthAlerts(periodStart, periodEnd);
  }

  public onClickCloudHealthAlert(cloudHealthAlert: McsOption): void {
    this.cloudHealthAlertOptions = [];
    this._getCloudHealthAlertById(cloudHealthAlert.value);
  }

  /**
   * Returns the form group
   */
  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Returns true if form group is valid
   */
  public isValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  private _resetFormControlValues(): void {
    this.fcCheckbox.setValue([]);
    this.fcDropdown.setValue([]);
  }

  /**
   * Event that emits when an input has been changed
   */
  private notifyDataChange() {
    let changes: McsCloudHealthOption;
    if (this.alertType === CloudHealthAlertType.ManagementTags) {
      changes = getSafeProperty(this.fcDropdown, (obj) => obj.value);
    } else {
      changes = getSafeProperty(this.fcCheckbox, (obj) => obj.value);
    }
    this.dataChange.emit(changes);
  }

  /**
   * Register form group elements for custom type
   */
   private _registerFormGroup(): void {
    this.fcDropdown = new FormControl([], [CoreValidators.required]);
    this.fcCheckbox = new FormControl([], [CoreValidators.required]);
    this.fcCloudhealth = new FormControl('', []);

    this.fgCloudhealth = this._formBuilder.group({
      fcDropdown: this.fcDropdown,
      fcCheckbox: this.fcCheckbox,
      fcCloudhealth: this.fcCloudhealth
    });
  }

  /**
   * Subscribe to the form changes
   */
  private _subscribeToValueChanges(): void {
    this._valueChangesSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._valueChangesSubject),
      tap(() => this.notifyDataChange())
    ).subscribe();
  }

  /**
   * Initialize the options for management tag dropdown list
   */
  private _subscribeToManagementTagOptions(): void {
    this.managementTagOptions$ = of(this._mapEnumToOption(this.managementTagEnum, managementTagText));
  }

  /**
   * Initialize the options for cloudhealth list period range
   */
  private _subscribeToCloudhealthPeriodRangeOptions(): void {
    this.cloudHealthPeriodRange$ = of(this._mapEnumToOption(this.periodRangeEnum, periodRangeText));
  }

  private _mapEnumToOption(enumeration: PeriodRange | ManagementTag, enumText: any): McsOption[] {
    let options = Object.values(enumeration)
      .filter((objValue) => (typeof objValue === 'number'))
      .map(objValue => createObject(McsOption, { text: enumText[objValue], value: objValue }));
    return options;
  }

  private _convertPeriodDateToString(periodRange: Date): string {
    return !isNullOrEmpty(periodRange) ?
      `${periodRange.getFullYear()}-${periodRange.getMonth() + 1}-${periodRange.getDate()}` : null;
  }

  private _setPeriodRange(period: McsOption): CloudHealthPeriodRange {
    this.selectedPeriod = period.value;
    let startDate: Date = null;
    let endDate: Date = null;
    let yesterday = getCurrentDate().setDate(getDayinMonth() - 1);
    switch(this.selectedPeriod) {
      case PeriodRange.Today:
        startDate = getCurrentDate();
        endDate = getCurrentDate();
        break;
      case PeriodRange.Yesterday:
        startDate = new Date(yesterday);
        endDate = new Date(yesterday);
        break;
      case PeriodRange.EarlierThisWeek:
        startDate = new Date(getCurrentDate().setDate(getFirstDateOfTheWeek()));
        endDate = new Date(getCurrentDate().setDate(getDayinMonth() - 2));
        break;
      case PeriodRange.EarlierThisMonth:
        startDate = new Date(getCurrentDate().setDate(getFirstDateOfTheMonth()));
        // if first date of the week minus 1 day is equal to yesterday return true
        let monthSameEndDate = getCurrentDate().setDate(getFirstDateOfTheWeek() - 1) === yesterday;
        let reduceDays = monthSameEndDate ? 2 : 1;
        endDate = new Date(getCurrentDate().setDate(getFirstDateOfTheWeek() - reduceDays));
        break;
      case PeriodRange.EarlierThisYear:
        startDate = getFirstDateOfTheYear();
        // if first date of the month minus 1 day is equal to yesterday return true
        let yearSameEndDate = getCurrentDate().setDate(getFirstDateOfTheMonth() - 1) === yesterday;
        let setEndDate = yearSameEndDate ? getFirstDateOfTheWeek() : getFirstDateOfTheMonth();
        endDate = new Date(getCurrentDate().setDate(setEndDate - 1));
        break;
      case PeriodRange.Older:
        startDate = null;
        endDate = getLastDateOfThePreviousYear();
        break;
      default:
        break;
    }
    return this._createPeriodRangeObject(startDate, endDate);
  }

  private _createPeriodRangeObject(startDate: Date, endDate: Date): CloudHealthPeriodRange {
    return {
      from: !isNullOrEmpty(startDate) ? startDate : null,
      until: !isNullOrEmpty(endDate) ? endDate : null
    };
  }

  private _convertCloudHealthAlertTimeStarted(createdOn: Date): string {
    let dateFormat = this.selectedPeriod === PeriodRange.Older ? 'longDateShortTime' : 'noYearDateShortTime';
    return this._dateTimeService.formatDate(createdOn, dateFormat);
  }

  private _getCloudHealthAlerts(periodStart: string, periodEnd: string): void {
    this.isChProcessing = true;
    this.cloudHealthAlerts$ = this._apiService.getCloudHealthAlerts(periodStart, periodEnd).pipe(
      catchError((error) => {
        this.isChProcessing = false;
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      }),
      map((cloudHealthCollection) => {
        let cloudHealthAlerts = getSafeProperty(cloudHealthCollection, (obj) => obj.collection) || [];
        let filteredCloudHealthAlerts = this._filterCloudHealthAlertsByRecognizedTypes(cloudHealthAlerts);
        let options: McsOption[] = [];
        filteredCloudHealthAlerts.forEach((alert) => {
          let timeStarted = this._convertCloudHealthAlertTimeStarted(alert?.createdOn);
          const managementText = this._translateService.instant('orderMsRequestChange.detailsStep.managementTags.text');
          let alertType = alert?.type === CloudHealthAlertType.ManagementTags ? managementText : alert.type;
          let textValue = `${alertType} - ${timeStarted}`;
          options.push(createObject(McsOption, { text: textValue, value: alert.id }));
        });
        this.isChProcessing = false;
        return options;
      }),
      shareReplay(1)
    );
  }

  private _filterCloudHealthAlertsByRecognizedTypes(cloudHealthAlerts: McsCloudHealthAlert[]): McsCloudHealthAlert[] {
    return cloudHealthAlerts
      .filter((cloudHealthAlert) => this.cloudhealthAlertTypes.includes(cloudHealthAlert.type))
      // sort alerts by date (latest to oldest)
      .sort((alertA, alertB) => new Date(alertB.createdOn).getTime() - new Date(alertA.createdOn).getTime());
  }

  private _getCloudHealthAlertById(id: string): void {
    this.isChByIdProcessing = true;
    this._apiService.getCloudHealthAlertById(id).pipe(
      catchError((error) => {
        this.isChByIdProcessing = false;
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      })
    ).subscribe((response) => {
      this.alertType = response.type;
      this.isChByIdProcessing = false;
      this._setAlertHeaderLabels(this.alertType);
      this._enableDisableFormControl(this.alertType);
      let alertList = getSafeProperty(response, (obj) => obj.configurationItems) || [];
      if (alertList.length === 0) { return; }
      let optionList = new Array<McsCloudHealthOption>();
      alertList.forEach((alert: McsCloudHealthAlertConfigurationItems) => {
        let subLabel = this._setAlertOptionsSubLabel(alert, this.alertType);
        const noName = this._translateService.instant('orderMsRequestChange.detailsStep.noName');
        optionList.push(createObject(McsCloudHealthOption, {
          text: `${alert.name || noName}`,
          subText: subLabel,
          alertType: this.alertType,
          config: alert
        }));
      });
      this.cloudHealthAlertOptions = optionList;
      this._changeDetectorRef.markForCheck();
    });
  }

  private _enableDisableFormControl(alertType: string): void {
    this._resetFormControlValues();
    if (alertType === this.alertManagementTag) {
      this.fcDropdown.enable();
      this.fcCheckbox.disable();
    } else {
      this.fcDropdown.disable();
      this.fcCheckbox.enable();
    }
  }

  private _setAlertHeaderLabels(alertType: string): void {
    switch(alertType) {
      case CloudHealthAlertType.ManagementTags:
        this.alertLabel =  this._translateService.instant('orderMsRequestChange.detailsStep.managementTags.label');
        this.alertSubLabel = this._translateService.instant('orderMsRequestChange.detailsStep.managementTags.subLabel');
        break;
      case CloudHealthAlertType.UnattachedDisks:
        this.alertLabel =  this._translateService.instant('orderMsRequestChange.detailsStep.unattachedDisk.label');
        this.alertSubLabel = this._translateService.instant('orderMsRequestChange.detailsStep.unattachedDisk.subLabel');
        break;
      case CloudHealthAlertType.OldSnapshots:
        this.alertLabel =  this._translateService.instant('orderMsRequestChange.detailsStep.unattachedSnapshot.label');
        this.alertSubLabel = this._translateService.instant('orderMsRequestChange.detailsStep.unattachedSnapshot.subLabel');
        break;
      case CloudHealthAlertType.UnattachedIpAddresses:
        this.alertLabel =  this._translateService.instant('orderMsRequestChange.detailsStep.unattachedIps.label');
        this.alertSubLabel = this._translateService.instant('orderMsRequestChange.detailsStep.unattachedIps.subLabel');
        break;
      default:
        break;
    }
  }

  private _setAlertOptionsSubLabel(alert: McsCloudHealthAlertConfigurationItems, alertType: string): string {
    let subText: string = '';
    const noSubName = this._translateService.instant('orderMsRequestChange.detailsStep.noSubName');
    const noGrpName = this._translateService.instant('orderMsRequestChange.detailsStep.noGrpName');
    switch(alertType) {
      case CloudHealthAlertType.ManagementTags:
        subText = `${alert.subscriptionName || noSubName}, ${alert.resourceGroupName || noGrpName}`;
        break;
      case CloudHealthAlertType.UnattachedDisks:
        subText = `${alert.subscriptionName || noSubName}, ${alert.resourceGroupName || noGrpName}`;
        break;
      case CloudHealthAlertType.OldSnapshots:
        const noSize = this._translateService.instant('orderMsRequestChange.detailsStep.noSize');
        let size = !isNullOrEmpty(alert.sizeGB) ? `${alert.sizeGB} GB` : noSize;
        subText = `${alert.subscriptionName || noSubName}, ${alert.resourceGroupName || noGrpName}, ${size}`;
        break;
      case CloudHealthAlertType.UnattachedIpAddresses:
        const noIp = this._translateService.instant('orderMsRequestChange.detailsStep.noIpAddress');
        let ipAddress = !isNullOrEmpty(alert.ipAddress) ? alert.ipAddress : noIp;
        subText = `${alert.subscriptionName || noSubName}, ${alert.resourceGroupName || noGrpName}, ${ipAddress}`;
        break;
      default:
        break;
    }
    return subText;
  }
}
