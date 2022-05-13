import {
  ChangeDetectionStrategy,
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
  BehaviorSubject,
  Observable,
  of,
  Subject,
  zip
} from 'rxjs';
import {
  filter,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreValidators,
  IMcsFormGroup,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import {
  OrderDetails,
  SmacSharedDetails,
  SmacSharedFormConfig
} from '@app/features-shared';
import { McsFormGroupDirective } from '@app/shared';
import {
  CommonDefinition,
  createObject,
  formatStringToText,
  getCurrentDate,
  getSafeProperty,
  Guid,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import {
  DeliveryType,
  McsOption,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  orderCabinetLocationText,
  OrderCabinetLocation,
  OrderIdType
} from '@app/models';
import { ColocationDeviceRestartService } from './colocation-device-restart.service';

const DEVICE_RESTART_ID = Guid.newGuid().toString();
const RESTART_INSTRUCTION_ROWS = 3;
const RESTART_INSTRUCTION_LENGTH = 850;

type DeviceRestartProperties = {
  floorLevel: string,
  rackIdentifier: string,
  locationWithinCabinet: string,
  deviceMakeModel: string,
  label: string,
  restartInstructions: string,
  testCases: string[],
  customerReferenceNumber: string,
  phoneConfirmationRequired: boolean,
  notes: string
};

export type ColocationServiceConfig = {
  contextualHelpText: string,
  placeholderText: string,
  fallbackText: string
}

@Component({
  selector: 'mcs-colocation-device-restart',
  templateUrl: './colocation-device-restart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ColocationDeviceRestartService]
})
export class ColocationDeviceRestartComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgDeviceRestart: FormGroup;
  public fcColocationService: FormControl;
  public fcFloorLevel: FormControl;
  public fcRackNumber: FormControl;
  public fcLocationCabinet: FormControl;
  public fcDeviceMakeModel: FormControl;
  public fcDeviceNameLabel: FormControl;
  public fcRestartInstruction: FormControl;

  public colocationConfig: ColocationServiceConfig;
  public locationCabinetOptions$: Observable<McsOption[]>;
  public smacSharedFormConfig$: BehaviorSubject<SmacSharedFormConfig>;

  private _smacSharedDetails: SmacSharedDetails;
  private _formGroup: McsFormGroupDirective;

  private _valueChangesSubject = new Subject<void>();

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }

  @ViewChild('fgSmacSharedForm')
  public set fgSmacSharedForm(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgDeviceRestart.contains('fgSmacSharedForm');
    if (isRegistered) { return; }
    this.fgDeviceRestart.addControl('fgSmacSharedForm',
      value.getFormGroup().formGroup
    );
  }

  constructor(
    _injector: Injector,
    private _deviceRestartService: ColocationDeviceRestartService,
    private _formBuilder: FormBuilder,
    private _translateService: TranslateService
  ) {
    super(
      _deviceRestartService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'colocation-device-restart-goto-provisioning-step',
          action: 'next-button'
        }
      }
    );
    this._smacSharedDetails = new SmacSharedDetails();
    this._registerFormGroup();
  }

  ngOnInit(): void {
    this._setColocationServiceConfig();
    this._subscribeToCabinetLocationOptions();
    this._subscribeToSmacSharedFormConfig();
  }

  ngOnDestroy(): void {
    unsubscribeSafely(this._valueChangesSubject);
  }

  public get maxRestartInstructionsLength(): number {
    return RESTART_INSTRUCTION_LENGTH;
  }

  public get maxRestartInstructionsRows(): number {
    return RESTART_INSTRUCTION_ROWS;
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get cabinetLocationEnum(): any {
    return OrderCabinetLocation;
  }

  public get testCasePlaceHolder(): string {
    return this._translateService.instant('orderColocationDeviceRestart.detailsStep.testCasesPlaceholder');
  }

  public get notesLabel(): string {
    return this._translateService.instant('label.notes');
  }

  public get testCasesHelpText(): string {
    return this._translateService.instant('orderColocationDeviceRestart.detailsStep.testCasesHelpText');
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  /**
   * Event listener when there is a change in Shared SMAC Form
   */
  public onChangeSharedForm(formDetails: SmacSharedDetails): void {
    this._smacSharedDetails = formDetails;
  }

  /**
   * Event listener whenever there is a change in billing information, delivery type or schedule
   */
  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._deviceRestartService.createOrUpdateOrder(
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

    this._deviceRestartService.submitOrderRequest();
  }

  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: this.fcColocationService?.value?.serviceId
    };
    this.submitOrderWorkflow(workflow);
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
      filter(() => this.formIsValid),
      tap(() => this.notifyDataChange())
    ).subscribe();
  }

  private _registerFormGroup(): void {
    this.fcColocationService = new FormControl('', [CoreValidators.required]);
    this.fcFloorLevel = new FormControl('', [CoreValidators.required]);
    this.fcRackNumber = new FormControl('', [CoreValidators.required]);
    this.fcLocationCabinet = new FormControl('', [CoreValidators.required]);
    this.fcDeviceMakeModel = new FormControl('', [CoreValidators.required]);
    this.fcDeviceNameLabel = new FormControl('', [CoreValidators.required]);
    this.fcRestartInstruction = new FormControl('', [CoreValidators.required]);

    this.fgDeviceRestart = this._formBuilder.group({
      fcColocationService: this.fcColocationService,
      fcFloorLevel: this.fcFloorLevel,
      fcRackNumber: this.fcRackNumber,
      fcLocationCabinet: this.fcLocationCabinet,
      fcDeviceMakeModel: this.fcDeviceMakeModel,
      fcDeviceNameLabel: this.fcDeviceNameLabel,
      fcRestartInstruction: this.fcRestartInstruction
    });

    this.fcColocationService.valueChanges.pipe(
      tap((value) => {
        if (!isNullOrEmpty(value)) {
          this.fcRackNumber.setValue(value.rackIdentifier);
        }
      })
    ).subscribe();
  }

  /**
   * Event that emits when an input has been changed
   */
  private notifyDataChange() {
    this._deviceRestartService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            serviceId: this.fcColocationService.value.serviceId,
            itemOrderType: OrderIdType.ColocationDeviceRestart,
            referenceId: DEVICE_RESTART_ID,
            deliveryType: DeliveryType.Standard, // set to Standard as default
            schedule: getCurrentDate().toISOString(),
            properties: {
              floorLevel: formatStringToText(this.fcFloorLevel.value),
              rackIdentifier: formatStringToText(this.fcRackNumber.value),
              locationWithinCabinet: orderCabinetLocationText[this.fcLocationCabinet.value],
              deviceMakeModel: formatStringToText(this.fcDeviceMakeModel.value),
              label: formatStringToText(this.fcDeviceNameLabel.value),
              restartInstructions: formatStringToText(this.fcRestartInstruction.value),
              testCases: this._smacSharedDetails.testCases,
              customerReferenceNumber: formatStringToText(this._smacSharedDetails.referenceNumber),
              phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
              notes: formatStringToText(this._smacSharedDetails.notes)
            } as DeviceRestartProperties
          })
        ]
      })
    );
  }

  private _setColocationServiceConfig(): void {
    this.colocationConfig = {
      contextualHelpText: this._translateService.instant('orderColocationDeviceRestart.detailsStep.colocationServiceHelpText'),
      placeholderText: this._translateService.instant('orderColocationDeviceRestart.detailsStep.colocationServicePlaceholder'),
      fallbackText: this._translateService.instant('orderColocationDeviceRestart.fallback.colocationService'),
    }
  }

  /**
   * Initialize the options for cabinet location control
   */
  private _subscribeToCabinetLocationOptions(): void {
    this.locationCabinetOptions$ = of(this._mapEnumToOption(this.cabinetLocationEnum, orderCabinetLocationText));
  }

  /**
   * Maps enumeration to Options Array
   */
  private _mapEnumToOption(enumeration: OrderCabinetLocation, enumText: any): McsOption[] {
    let options = Object.values(enumeration)
      .filter((objValue) => (typeof objValue === 'number'))
      .map(objValue => createObject(McsOption, { text: enumText[objValue], value: objValue }));
    return options;
  }

  /**
   * Subscribe to Smac Shared Form Config
   */
  private _subscribeToSmacSharedFormConfig(): void {
    let testCaseConfig = { isIncluded: true, isRequired: true, placeholder: this.testCasePlaceHolder, helpText: this.testCasesHelpText };
    let notesConfig = { isIncluded: true, label: this.notesLabel, isRequired: false };
    let contactConfig = { isIncluded: true };
    let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig);
    this.smacSharedFormConfig$ = new BehaviorSubject<SmacSharedFormConfig>(config);
  }
}
