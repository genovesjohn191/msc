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
  CloudHealthAlertType,
  PeriodicSchedule,
  periodicScheduleText,
  McsAzureResourceQueryParams,
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
import {
  CHAlertFieldType,
  CHAlertInputType,
  CHAlertInfo,
  CloudHealthPeriodRange
} from './cloudhealth-services.config';

@Component({
  selector: 'mcs-cloudhealth-services',
  templateUrl: './cloudhealth-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CloudHealthServicesComponent implements OnInit, OnDestroy {
  // Forms control
  public fgCloudhealth: FormGroup<any>;
  public fcCloudhealth: FormControl<any>;
  public fcDropdown: FormControl<any>;
  public fcCheckbox: FormControl<any>;
  public fcInputText: FormControl<any>;

  public cloudHealthPeriodRange$: Observable<McsOption[]>;
  public cloudHealthAlerts$: Observable<McsOption[]>;
  public dropdownOptions: McsOption[];

  public cloudHealthAlertOptions: McsCloudHealthOption[];
  public alertType: string = '';
  public chALertInfo: CHAlertInfo;
  public isChProcessing: boolean;
  public isChByIdProcessing: boolean;
  public selectedPeriod: PeriodRange;

  private _chAlertHeaderLabelMap = new Map<string, CHAlertInfo>();
  private _valueChangesSubject = new Subject<void>();
  private _formGroup: McsFormGroupDirective;
  private _storageAccountResources: McsOption[];

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

  public get periodicScheduleEnum(): any {
    return PeriodicSchedule;
  }

  public get cloudHealthAlertTypeEnum(): any {
    return CloudHealthAlertType;
  }

  public get chAlertFieldTypeEnum(): any {
    return CHAlertFieldType;
  }

  public get periodRangeEnum(): any {
    return PeriodRange;
  }

  public ngOnInit(): void {
    this._registerFormGroup();
    this._createCloudhealthPeriodRangeOptions();
    this._createStorageAccountDropdownOption();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._valueChangesSubject);
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
    this._createCloudHealthHeaderLabelMap();
    this.chALertInfo = this._chAlertHeaderLabelMap.get(cloudHealthAlert.value.type);
    this._getCloudHealthAlertById(cloudHealthAlert.value.id);
  }

  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  public isValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  private _resetFormControlValues(): void {
    this.fcCheckbox.setValue([]);
    this.fcDropdown.setValue([]);
    this.fcInputText.setValue([]);
  }

  private _notifyDataChange() {
    let changes: McsCloudHealthOption;
    switch(this.chALertInfo?.controlType) {
      case CHAlertFieldType.Dropdown:
        changes = getSafeProperty(this.fcDropdown, (obj) => obj.value);
        break;
      case CHAlertFieldType.Checkbox:
        changes = getSafeProperty(this.fcCheckbox, (obj) => obj.value);
        break;
      case CHAlertFieldType.Input:
        changes = getSafeProperty(this.fcInputText, (obj) => obj.value);
        break;
      default:
        break;
    }
    this.dataChange.emit(changes);
  }

  private _registerFormGroup(): void {
    this.fcDropdown = new FormControl<any>([], [CoreValidators.required]);
    this.fcCheckbox = new FormControl<any>([], [CoreValidators.required]);
    this.fcInputText = new FormControl<any>([], [CoreValidators.required]);
    this.fcCloudhealth = new FormControl<any>('', []);

    this.fgCloudhealth = this._formBuilder.group({
      fcDropdown: this.fcDropdown,
      fcCheckbox: this.fcCheckbox,
      fcInputText: this.fcInputText,
      fcCloudhealth: this.fcCloudhealth
    });
  }

  private _subscribeToValueChanges(): void {
    this._valueChangesSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._valueChangesSubject),
      tap(() => this._notifyDataChange())
    ).subscribe();
  }

  private _createCloudhealthPeriodRangeOptions(): void {
    this.cloudHealthPeriodRange$ = of(this._mapEnumToOption(this.periodRangeEnum, periodRangeText));
  }

  private _mapEnumToOption(enumeration: PeriodRange | PeriodicSchedule, enumText: any): McsOption[] {
    let options = Object.values(enumeration)
      .filter((objValue) => (typeof objValue === 'number') && objValue !== PeriodicSchedule.Weekly)
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
    };
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
          let alertTypeLabel = alert?.type === CloudHealthAlertType.ManagementTags ?
            this._translateService.instant('orderMsRequestChange.managementTags.text') : alert.type;
          options.push(createObject(McsOption, {
            text: `${alertTypeLabel} - ${timeStarted}`,
            value: alert
          }));
        });
        this.isChProcessing = false;
        return options;
      }),
      shareReplay(1)
    );
  }

  private _filterCloudHealthAlertsByRecognizedTypes(cloudHealthAlerts: McsCloudHealthAlert[]): McsCloudHealthAlert[] {
    let recognizedCHAlertTypes: string[] = Object.values(CloudHealthAlertType);
    return cloudHealthAlerts
      .filter((cloudHealthAlert) => recognizedCHAlertTypes.includes(cloudHealthAlert.type))
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
      this._setDropdownOptions(this.alertType);
      this._enableDisableFormControl(this.chALertInfo.controlType);
      let alertList = getSafeProperty(response, (obj) => obj.configurationItems) || [];
      this.cloudHealthAlertOptions = this._createAlertOptions(alertList);
      this._changeDetectorRef.markForCheck();
    });
  }

  private _createAlertOptions(alerts: McsCloudHealthAlertConfigurationItems[]): McsCloudHealthOption[] {
    if (alerts.length === 0) { return []; }
    let optionList = new Array<McsCloudHealthOption>();
    alerts.forEach((alert: McsCloudHealthAlertConfigurationItems) => {
      optionList.push(createObject(McsCloudHealthOption, {
        text: `${alert.name || this._translateService.instant('message.noName')}`,
        subText: this._setCloudhealthFieldLabel(alert, this.alertType),
        alertType: this.alertType,
        config: alert,
        actionLabel: this.chALertInfo.actionLabel
      }));
    });
    return optionList;
  }

  private _enableDisableFormControl(controlType: CHAlertFieldType): void {
    this._resetFormControlValues();
    switch(controlType) {
      case CHAlertFieldType.Dropdown:
        this.fcDropdown.enable();
        this.fcCheckbox.disable();
        this.fcInputText.disable();
        break;
      case CHAlertFieldType.Checkbox:
        this.fcDropdown.disable();
        this.fcCheckbox.enable();
        this.fcInputText.disable();
        break;
      case CHAlertFieldType.Input:
        this.fcDropdown.disable();
        this.fcCheckbox.disable();
        this.fcInputText.enable();
        break;
    }
  }

  private _setCloudhealthFieldLabel(alert: McsCloudHealthAlertConfigurationItems, alertType: string): string {
    const noSubName = this._translateService.instant('message.noSubName');
    const noGrpName = this._translateService.instant('message.noGrpName');
    const noServiceId = this._translateService.instant('message.noServiceId');
    switch(alertType) {
      case CloudHealthAlertType.ManagementTags:
      case CloudHealthAlertType.UnattachedDisks:
      case CloudHealthAlertType.StorageAccountSecureTransfer:
      case CloudHealthAlertType.StorageBlobContainerPublicAccess:
      case CloudHealthAlertType.SQLServerAuditingDisabled:
      case CloudHealthAlertType.StorageContainerActivityLogsPubliclyAccessible:
      case CloudHealthAlertType.SQLServerThreatDetectionDisabled:
      case CloudHealthAlertType.SQLServerVulnerabilityAssessmentNoStorageAccountConfigured:
      case CloudHealthAlertType.SQLServerVulnerabilityAssessmentPeriodicScansDisabled:
      case CloudHealthAlertType.SQLServerVulnerabilityAssessmentEmailNotConfigured:
      case CloudHealthAlertType.SQLServerVulnerabilityAssessmentEmailSubscriptionAdminsNotConfigured:
      case CloudHealthAlertType.LoggingDisabledforKeyVault:
        return `${alert.subscriptionName || noSubName}, ${alert.resourceGroupName || noGrpName}`;

      case CloudHealthAlertType.SecurityContactEmailNotConfigured:
      case CloudHealthAlertType.WindowsDefenderATPIntegrationNotSelected:
      case CloudHealthAlertType.AzureDefenderDisabledSQLServerMachine:
      case CloudHealthAlertType.AzureDefenderDisabledAppService:  
      case CloudHealthAlertType.AzureDefenderDisabledServer:
      case CloudHealthAlertType.AzureDefenderDisabledStorageAccount:
      case CloudHealthAlertType.AzureDefenderDisabledSQLDatabaseServer:
      case CloudHealthAlertType.AzureDefenderDisabledKeyVault:
      case CloudHealthAlertType.AzureDefenderDisabledKubernetesService:
      case CloudHealthAlertType.AzureDefenderDisabledContainerRegistry:
        return `${alert.serviceId || noServiceId}, ${alert.subscriptionId || noSubName}`;

      case CloudHealthAlertType.OldSnapshots:
        let size = !isNullOrEmpty(alert.sizeGB) ? `${alert.sizeGB} GB` : this._translateService.instant('message.noSize');
        return `${alert.subscriptionName || noSubName}, ${alert.resourceGroupName || noGrpName}, ${size}`;

      case CloudHealthAlertType.UnattachedIpAddresses:
        let ipAddress = !isNullOrEmpty(alert.ipAddress) ? alert.ipAddress : this._translateService.instant('message.noIpAddress');
        return `${alert.subscriptionName || noSubName}, ${alert.resourceGroupName || noGrpName}, ${ipAddress}`;
    }
  }

  private _createCloudHealthHeaderLabelMap(): void {
    this. _chAlertHeaderLabelMap = new Map();
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.ManagementTags, {
      description: this._translateService.instant('orderMsRequestChange.managementTags.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.managementTags.action'),
      controlType: CHAlertFieldType.Dropdown
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.UnattachedDisks, {
      description: this._translateService.instant('orderMsRequestChange.unattachedDisk.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.unattachedDisk.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.OldSnapshots, {
      description: this._translateService.instant('orderMsRequestChange.unattachedSnapshot.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.unattachedSnapshot.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.UnattachedIpAddresses, {
      description: this._translateService.instant('orderMsRequestChange.unattachedIps.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.unattachedIps.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.StorageAccountSecureTransfer, {
      description: this._translateService.instant('orderMsRequestChange.storageAccountSecureTransfer.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.storageAccountSecureTransfer.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.StorageBlobContainerPublicAccess, {
      description: this._translateService.instant('orderMsRequestChange.storageBlobContainerPublicAccess.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.storageBlobContainerPublicAccess.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.SQLServerAuditingDisabled, {
      description: this._translateService.instant('orderMsRequestChange.sqlAuditingDisabled.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.sqlAuditingDisabled.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.StorageContainerActivityLogsPubliclyAccessible, {
      description: this._translateService.instant('orderMsRequestChange.storageContainerActivityLogsPubliclyAccessible.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.storageContainerActivityLogsPubliclyAccessible.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.SecurityContactEmailNotConfigured, {
      description: this._translateService.instant('orderMsRequestChange.securityContactEmailNotConfigured.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.securityContactEmailNotConfigured.action'),
      controlType: CHAlertFieldType.Input,
      inputType: CHAlertInputType.Email
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.AzureDefenderDisabledStorageAccount, {
      description: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledStorageAccount.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledStorageAccount.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.WindowsDefenderATPIntegrationNotSelected, {
      description: this._translateService.instant('orderMsRequestChange.windowsDefenderATPIntegrationNotSelected.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.windowsDefenderATPIntegrationNotSelected.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.AzureDefenderDisabledSQLServerMachine, {
      description: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledSQLServerMachine.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledSQLServerMachine.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.AzureDefenderDisabledAppService, {
      description: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledAppService.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledAppService.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.AzureDefenderDisabledServer, {
      description: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledServer.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledServer.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.AzureDefenderDisabledSQLDatabaseServer, {
      description: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledSQLDatabaseServer.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledSQLDatabaseServer.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.AzureDefenderDisabledKeyVault, {
      description: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledKeyVault.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledKeyVault.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.AzureDefenderDisabledKubernetesService, {
      description: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledKubernetesService.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledKubernetesService.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.AzureDefenderDisabledContainerRegistry, {
      description: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledContainerRegistry.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.azureDefenderDisabledContainerRegistry.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.SQLServerThreatDetectionDisabled, {
      description: this._translateService.instant('orderMsRequestChange.sqlThreatDetectionDisabled.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.sqlThreatDetectionDisabled.action'),
      controlType: CHAlertFieldType.Checkbox
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.SQLServerVulnerabilityAssessmentNoStorageAccountConfigured, {
      description: this._translateService.instant('orderMsRequestChange.sqlVulnerabilityNoStorageAccountConfigured.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.sqlVulnerabilityNoStorageAccountConfigured.action'),
      controlType: CHAlertFieldType.Dropdown
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.SQLServerVulnerabilityAssessmentPeriodicScansDisabled, {
      description: this._translateService.instant('orderMsRequestChange.sqlVulnerabilityPeriodicScansDisabled.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.sqlVulnerabilityPeriodicScansDisabled.action'),
      controlType: CHAlertFieldType.Dropdown
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.SQLServerVulnerabilityAssessmentEmailNotConfigured, {
      description: this._translateService.instant('orderMsRequestChange.sqlVulnerabilityEmailNotConfigured.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.sqlVulnerabilityEmailNotConfigured.action'),
      controlType: CHAlertFieldType.Input,
      inputType: CHAlertInputType.Email
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.SQLServerVulnerabilityAssessmentEmailSubscriptionAdminsNotConfigured, {
      description: this._translateService.instant('orderMsRequestChange.sqlVulnerabilityEmailSubAdminsNotConfigured.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.sqlVulnerabilityEmailSubAdminsNotConfigured.action'),
      controlType: CHAlertFieldType.Input,
      inputType: CHAlertInputType.Email
    });
    this._chAlertHeaderLabelMap.set(CloudHealthAlertType.LoggingDisabledforKeyVault, {
      description: this._translateService.instant('orderMsRequestChange.loggingDisabledforKeyVault.label'),
      actionLabel: this._translateService.instant('orderMsRequestChange.loggingDisabledforKeyVault.action'),
      controlType: CHAlertFieldType.Input,
      inputType: CHAlertInputType.Number
    });
  }

  private _setDropdownOptions(alertType: string): void {
    switch (alertType){
      case CloudHealthAlertType.ManagementTags:
        this.dropdownOptions = this._mapEnumToOption(this.periodicScheduleEnum, periodicScheduleText);
        break;
      case CloudHealthAlertType.SQLServerVulnerabilityAssessmentNoStorageAccountConfigured:
        this.dropdownOptions = this._storageAccountResources;
        break;
      case CloudHealthAlertType.SQLServerVulnerabilityAssessmentPeriodicScansDisabled:
        this.dropdownOptions = this._createPeriodicScanDropdownOption();
        break;
    }
  }

  private _createPeriodicScanDropdownOption(): McsOption[] {
    let options = [];
    options.push(createObject(McsOption, { text: periodicScheduleText[PeriodicSchedule.NoChange], value: PeriodicSchedule.NoChange }));
    options.push(createObject(McsOption, { text: periodicScheduleText[PeriodicSchedule.Weekly], value: PeriodicSchedule.Weekly }));
    return options;
  }

  private _createStorageAccountDropdownOption(): void {
    let param = new McsAzureResourceQueryParams();
    param.type = 'microsoft.storage/storageaccounts';

    this._apiService.getAzureResources(param).pipe(
      catchError((error) => throwError(error)),
      shareReplay(1)
    ).subscribe((response) => {
      let resources = getSafeProperty(response, (obj) => obj.collection) || [];
      let options: McsOption[] = [];
      options.push(createObject(McsOption, { text: periodicScheduleText[PeriodicSchedule.NoChange], value: PeriodicSchedule.NoChange }));
      if (isNullOrEmpty(resources)) { return options; }
      resources.forEach((resource) => {
        if (isNullOrEmpty(resource.name)) { return; }
        options.push(createObject(McsOption, {
          text: resource.name,
          value: resource.name }
        ));
      })

      this._storageAccountResources = options;
    });
  }
}