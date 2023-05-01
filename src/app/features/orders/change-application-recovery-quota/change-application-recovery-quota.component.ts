import {
  zip,
  Subject,
  Subscription,
  Observable,
  of
} from 'rxjs';
import {
  filter,
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  CoreValidators,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import {
  OrderDetails
} from '@app/features-shared';
import {
  ApplicationRecoveryType,
  DeliveryType,
  FieldErrorMessage,
  HttpStatusCode,
  McsOption,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  OrderIdType,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid,
  formatStringToText,
  convertTbToGb,
  convertGbToTb,
  isNullOrUndefined
} from '@app/utilities';

import { ChangeApplicationRecoveryQuotaService } from './change-application-recovery-quota.service';

const CHANGE_APP_RECOVERY_QUOTA_ID = Guid.newGuid().toString();
const LOADING_TEXT = 'Loading';
const NUMBER_OF_VMS_MIN = 1;
const NUMBER_OF_VMS_MAX = 100;

type ChangeApplicationRecoveryQuotaProperties = {
  journalSizeGB: any,
  journalHistory: string;
  numberOfVMs: number;
};

type JournalSizeScale = {
  size: number,
  unit: 'GB' | 'TB'
}

const JOURNAL_HISTORY_OPTIONS_COMMON: string[] = [
  "4 Hours",
  "1 Day",
  "2 Days",
  "3 Days",
  "4 Days",
  "5 Days"
];

const JOURNAL_HISTORY_OPTIONS_AZURE: string[] = [
  "4 Hours",
  "1 Day",
  "2 Days",
  "3 Days",
  "4 Days",
  "5 Days",
  "10 Days",
  "15 Days",
  "20 Days",
  "25 Days",
  "30 Days",
];

@Component({
  selector: 'mcs-order-change-application-recovery-quota',
  templateUrl: './change-application-recovery-quota.component.html',
  providers: [ChangeApplicationRecoveryQuotaService]
})
export class ChangeApplicationRecoveryQuotaComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgChangeApplicationRecoveryQuota: FormGroup<any>;
  public fcService: FormControl<any>;
  public fcJournalSize: FormControl<any>;
  public fcJournalHistory: FormControl<string>;
  public fcNumberOfVMs: FormControl<number>;

  public services: McsOption[] = [];
  public journalHistoryOptions: string[] = JOURNAL_HISTORY_OPTIONS_COMMON;

  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
  private _destroySubject = new Subject<void>();
  private _selectedServiceHandler: Subscription;
  private _errorStatus: number;
  private _servicesCount: number;
  private _itemOrderType: OrderIdType.PrivateApplicationRecoveryChange | OrderIdType.PublicApplicationRecoveryChange;
  private _journalSizeApplicable: boolean = true;

  public sliderValueIndex: number;
  public sliderValue: JournalSizeScale;
  public sliderTable: JournalSizeScale[];
  public currentJournalSize: JournalSizeScale;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._servicesCount === 0;
  }

  public get journalSizeApplicable(): boolean {
    return this._journalSizeApplicable;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get loadingInProgress(): boolean {
    return this._isLoading;
  }
  public set loadingInProgress(value: boolean) {
    this._isLoading = value;
  }
  private _isLoading = false;

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public get loadingText(): string {
    return LOADING_TEXT;
  }

  public get numberOfVmsMin(): number {
    return NUMBER_OF_VMS_MIN;
  }

  public get numberOfVmsMax(): number {
    return NUMBER_OF_VMS_MAX;
  }

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }

  constructor(
    _injector: Injector,
    private _changeApplicationRecoveryQuotaService: ChangeApplicationRecoveryQuotaService,
    private _formBuilder: FormBuilder,
    private _changeDetector: ChangeDetectorRef,
    private _apiService: McsApiService
  ) {
    super(
      _changeApplicationRecoveryQuotaService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'change-app-recovery-quota-goto-provisioning-step',
          action: 'next-button'
        }
      }
    );
  }

  public ngOnInit(): void {
    this.loadingInProgress = true;
    this._registerFormGroup();
    this._subscribeToServices();
    this._createSliderTable();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._selectedServiceHandler);
  }

  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this.notifyDataChange()
      )
    ).subscribe();
  }

  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._changeApplicationRecoveryQuotaService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing,
      orderDetails.deliveryType,
      orderDetails.schedule
    );

    this._changeApplicationRecoveryQuotaService.submitOrderRequest();
  }

  public numberOfVMsErrorMessages(): FieldErrorMessage {
    return createObject(FieldErrorMessage, {
      required: this.translateService.instant('orderChangeApplicationRecoveryQuota.detailsStep.errors.numberOfVMsRequired'),
      numeric: this.translateService.instant('orderChangeApplicationRecoveryQuota.detailsStep.numberOfVMsNumeric'),
      min: this.translateService.instant('orderChangeApplicationRecoveryQuota.detailsStep.numberOfVMsMinimum',
        { min_value: this.numberOfVmsMin }),
      max: this.translateService.instant('orderChangeApplicationRecoveryQuota.detailsStep.numberOfVMsMaximum',
        { max_value: this.numberOfVmsMax }),
    });
  }

  private notifyDataChange(): void {
    this._changeApplicationRecoveryQuotaService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: this._itemOrderType,
            referenceId: CHANGE_APP_RECOVERY_QUOTA_ID,
            serviceId: this.fcService.value.value,
            deliveryType: DeliveryType.Standard,
            properties: {
              journalSizeGB: this.journalSizeApplicable? this.fcJournalSize.value : null,
              journalHistory: formatStringToText(this.fcJournalHistory.value).toLowerCase(),
              numberOfVMs: this.fcNumberOfVMs.value
            } as ChangeApplicationRecoveryQuotaProperties
          })
        ]
      })
    );
  }

  public onSubmitOrder(submitDetails: OrderDetails, serviceID: string): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription
    };
    this.submitOrderWorkflow(workflow);
  }

  private _registerFormGroup(): void {
    this.fcService = new FormControl<any>('', [CoreValidators.required]);
    this.fcJournalSize = new FormControl<any>(null, [CoreValidators.required]);
    this.fcJournalHistory = new FormControl<string>('', []);
    this.fcNumberOfVMs = new FormControl<number>(null, [
      CoreValidators.required,
      CoreValidators.numeric,
      CoreValidators.min(1),
      CoreValidators.max(100)
    ]);

    this.fgChangeApplicationRecoveryQuota = this._formBuilder.group({
      fcService: this.fcService,
      fcJournalSize: this.fcJournalSize,
      fcJournalHistory: this.fcJournalHistory,
      fcNumberOfVMs: this.fcNumberOfVMs
    });

    this.fcService.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap((value) => {
        let selectedService = value?.data;
        switch (selectedService?.productType) {
          case ApplicationRecoveryType.ApplicationRecovery:
            this.journalHistoryOptions = JOURNAL_HISTORY_OPTIONS_COMMON;
            this._journalSizeApplicable = true;
            this._itemOrderType = OrderIdType.PrivateApplicationRecoveryChange;
            break;
          case ApplicationRecoveryType.AzureApplicationRecovery:
            this.journalHistoryOptions = JOURNAL_HISTORY_OPTIONS_AZURE;
            this._journalSizeApplicable = false;
            this._itemOrderType = OrderIdType.PublicApplicationRecoveryChange;
            break;
          default:
            this._itemOrderType = null;
            break;
        }
        this.fcJournalHistory.setValue(selectedService?.ApplicationRecoveryJournalHistoryLabel);
        this.fcNumberOfVMs.setValue(selectedService?.virtualMachineQuantity);
        this._setCurrentJournalSizeGB(selectedService?.journalSizeGB);
        this._changeDetector.markForCheck();
      })
    ).subscribe();
  }

  private _setCurrentJournalSizeGB(journalSizeGB: number): void {
    if (journalSizeGB > convertTbToGb(1)) {
      this.currentJournalSize = {
        size: convertGbToTb(journalSizeGB),
        unit: 'TB'
      } as JournalSizeScale;
    }
    else {
      this.currentJournalSize = {
        size: journalSizeGB,
        unit: 'GB'
      } as JournalSizeScale;
    }
    this.fcJournalSize.setValue(journalSizeGB);
    this._setSliderValue(this.currentJournalSize);
  }

  private _subscribeToServices(): void {
    this._servicesCount = 0;
    this._apiService.getApplicationRecovery().pipe(
      map((servicesCollection) => {
        let services = getSafeProperty(servicesCollection, (obj) => obj.collection) || [];

        services.forEach((service) => {
          let option: McsOption = {
            value: service.serviceId,
            text: `${service.billingDescription} - ${service.serviceId}`,
            disabled: !service.serviceChangeAvailable,
            data: service
          };
          this.services.push(option);
        });

        this.loadingInProgress = false;
        this._servicesCount = services?.length;
      })
    ).subscribe();
  }

  /**
   * Event that emits when the slider value has changed
   * @param index Slider value as index
   */
  public onSliderChanged(index: number) {
    this.sliderValueIndex = index;
    this.sliderValue = this.sliderTable[this.sliderValueIndex];
    if (!isNullOrUndefined(this.sliderValue)) {
      let sizeGb = this.sliderValue?.unit === 'TB' ? convertTbToGb(this.sliderValue?.size) : this.sliderValue?.size;
      this.fcJournalSize.setValue(sizeGb);
    }
  }

  private _setSliderValue(currentJournalSize: JournalSizeScale) {
    if (isNullOrEmpty(this.sliderTable)) { return }
    let selectedJournalSize = this.sliderTable.findIndex(item => item.size === currentJournalSize.size && item.unit === currentJournalSize.unit);
    if (selectedJournalSize < 0) {
      this.sliderValueIndex = this._snapSliderValue(currentJournalSize);
    }
    else {
      this.sliderValueIndex = selectedJournalSize;
    }
  }

  private _snapSliderValue(currentJournalSize: JournalSizeScale): number {
    let currentSize = currentJournalSize.size;
    let firstScaleValue = this.sliderTable[0];
    let lastScaleValue = this.sliderTable[this.sliderTable.length - 1];

    if (currentJournalSize.unit == 'TB') {
      // Snap to last scale value when current value is larger than max value
      if (currentSize > lastScaleValue.size) {
        return this.sliderTable.length - 1;
      }

      // Special case for snapping between 1-1.5 TB
      if (currentSize > 1 && currentSize < 1.5) {
        if(currentSize < 1.25) {
          return this.sliderTable.findIndex(item => item.size === 1 && item.unit === 'TB');
        }
        else {
          return this.sliderTable.findIndex(item => item.size === 1.5 && item.unit === 'TB');
        }
      }

      // Round off value
      let roundedValue = Math.round(currentSize);
      return this.sliderTable.findIndex(item => item.size === roundedValue && item.unit === 'TB');
    }

    if (currentSize < this.sliderTable[0].size) {
      // Snap to lowest scale value when current value is lower than min value
      this.sliderValue = firstScaleValue;
      return 0;
    }
    else {
      // Round off value
      let roundedValue = Math.round(currentSize / 100) * 100;
      return this.sliderTable.findIndex(item => item.size === roundedValue && item.unit === 'GB');
    }
  }

  /**
   * Creates the slider table for slider
   */
  private _createSliderTable(): void {
    // Create table definitions
    let table = new Array<JournalSizeScale>();
    table.push({ size: 50, unit: 'GB' });
    table.push({ size: 100, unit: 'GB' });
    table.push({ size: 200, unit: 'GB' });
    table.push({ size: 300, unit: 'GB' });
    table.push({ size: 400, unit: 'GB' });
    table.push({ size: 500, unit: 'GB' });
    table.push({ size: 600, unit: 'GB' });
    table.push({ size: 700, unit: 'GB' });
    table.push({ size: 800, unit: 'GB' });
    table.push({ size: 900, unit: 'GB' });
    table.push({ size: 1, unit: 'TB' });
    table.push({ size: 1.5, unit: 'TB' });
    table.push({ size: 2, unit: 'TB' });
    table.push({ size: 3, unit: 'TB' });
    table.push({ size: 4, unit: 'TB' });
    table.push({ size: 5, unit: 'TB' });
    this.sliderTable = table;
  }
}
