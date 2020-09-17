import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Injector} from '@angular/core';
import {
  Observable,
  Subject,
  Subscription,
  of,
  zip,
  forkJoin} from 'rxjs';
import {
  FormControl,
  FormGroup,
  FormBuilder} from '@angular/forms';
import {
  McsOrderWizardBase,
  CoreValidators,
  OrderRequester,
  IMcsFormGroup
} from '@app/core';
import {
  McsOption,
  McsOrderCreate,
  McsOrderItemCreate,
  OrderIdType,
  DeliveryType,
  McsOrderWorkflow,
  McsOptionGroup} from '@app/models';
import {
  SmacSharedFormConfig,
  SmacSharedDetails,
  OrderDetails} from '@app/features-shared';
import { McsFormGroupDirective } from '@app/shared';
import {
  CommonDefinition,
  getSafeProperty,
  createObject,
  Guid,
  isNullOrEmpty,
  addDaysToDate,
  getCurrentDate,
  formatStringToPhoneNumber,
  unsubscribeSafely,
  pluck} from '@app/utilities';
import {
  OrderCabinetLocation,
  orderRemoteHandsCabinetLocationText
} from '@app/models/enumerations/order-cabinet-location.enum';
import {
  takeUntil,
  filter,
  tap,
  map,
  shareReplay
} from 'rxjs/operators';
import { RemoteHandsService } from './remote-hands.service';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { isNullOrUndefined } from 'util';
import { TranslateService } from '@ngx-translate/core';

const MAX_INSTRUCTIONS_LENGTH = 850;
const VISIBILE_ROWS = 3;
const REMOTE_HANDS_ID = Guid.newGuid().toString();
const LOADING_TEXT = 'loading';

type RemoteHandRequestProperties = {
  locationWithinCabinet: string;
  floorLevel: string,
  rackNumber: string,
  rackIdentifier: string;
  remoteHandsInstructions: string,
  testCases: string[],
  phoneConfirmationRequired: boolean;
  customerReferenceNumber: string;
  notes: string;
};

@Component({
  selector: 'app-remote-hands',
  templateUrl: './remote-hands.component.html',
  providers: [RemoteHandsService]
})
export class RemoteHandsComponent  extends McsOrderWizardBase  implements OnInit, OnDestroy {

  public fgRemoteHands: FormGroup;
  public fcFloorLevel: FormControl;
  public fcRackNumber: FormControl;
  public fcRackService: FormControl;
  public fcCabinetLocation: FormControl;
  public fcInstruction: FormControl;

  public colocationGroups: McsOptionGroup[] = [];
  public cabinetLocationOption$: Observable<McsOption[]>;
  public smacSharedFormConfig$: Observable<SmacSharedFormConfig>;
  public remoteHandsStandardLeadTimeHours: number;

  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
  private _selectedRackServiceHandler: Subscription;
  private _smacSharedDetails: SmacSharedDetails;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get cabinetLocationEnum(): any {
    return OrderCabinetLocation;
  }

  public get maxInstructionsLength(): number {
    return MAX_INSTRUCTIONS_LENGTH;
  }

  public get instructionVisibleRows(): number {
    return VISIBILE_ROWS;
  }

  public get testCasePlaceHolder(): string {
    return this._translateService.instant('orderRemoteHands.detailsStep.testCasesInstructionsPlaceholder');
  }

  public get notesLabel(): string {
    return this._translateService.instant('orderRemoteHands.detailsStep.notesLabel');
  }

  public get loadingText(): string {
    return LOADING_TEXT;
  }
  public get loadingInProgress(): boolean {
    return this._isLoading;
  }
  public set loadingInProgress(value: boolean) {
    this._isLoading = value;
  }
  private _isLoading = false;

  public get hasServiceToDisplay(): boolean {
    return (this.colocationGroups.length > 0);
  }

  @ViewChild(McsFormGroupDirective, { static: false })
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }

  @ViewChild('fgSmacSharedForm', { static: false })
  public set fgSmacSharedForm(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgRemoteHands.contains('fgSmacSharedForm');
    if (isRegistered) { return; }
    this.fgRemoteHands.addControl('fgSmacSharedForm',
      value.getFormGroup().formGroup
    );
  }

  constructor(
    _injector: Injector,
    private _remoteHandsService: RemoteHandsService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService
  ) {
    super(
      _remoteHandsService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'ms-service-change-goto-provisioning-step',
          action: 'next-button'
        }
      }
      );
    this._smacSharedDetails = new SmacSharedDetails();
  }


  public ngOnInit(): void {
    this._registerFormGroup();
    this._subscribeToLeadTimeHours();
    this._subscribeToRackServices();
    this._subscribeToCabinetLocationOptions();
    this._subscribeToSmacSharedFormConfig();
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._selectedRackServiceHandler);
  }

  /**
   * Initialize the options for rack services control
   */
  private _subscribeToRackServices(): void {
      this.loadingInProgress = true;
      forkJoin(
          [this._apiService.getColocationRacks(),
          this._apiService.getColocationAntennas(),
          this._apiService.getColocationCustomDevices(),
          this._apiService.getColocationRooms(),
          this._apiService.getColocationStandardSqms()]
      ).subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        response.forEach((colocationResponseCollection) => {
          let colocationArray = getSafeProperty(colocationResponseCollection, (obj) => obj.collection);
          let colocationGroupName =  pluck(colocationArray, 'colocationGroup').find(_c => (!isNullOrUndefined(_c)));
          let optionsArray = new Array<McsOption>();
          this._mapArrayToOption(colocationArray, optionsArray);
          this.colocationGroups.push(createObject(McsOptionGroup, { groupName: colocationGroupName, options: optionsArray}));
        });
        this.loadingInProgress = false;
    });
  }

  /**
   * Initialize the options for cabinet location control
   */
  private _subscribeToCabinetLocationOptions(): void {
    this.cabinetLocationOption$ = of(this._mapEnumToOption(this.cabinetLocationEnum, orderRemoteHandsCabinetLocationText));
  }

  /**
   * Subscribe to Smac Shared Form Config
   */
  private _subscribeToSmacSharedFormConfig(): void {
    this.smacSharedFormConfig$ = this._apiService.getAccount().pipe(
      map((response) => {
        let testCaseConfig = { isIncluded: true, placeholder: this.testCasePlaceHolder };
        let notesConfig = { isIncluded: true, label: this.notesLabel };
        let contactConfig = { isIncluded: true, phoneNumber: formatStringToPhoneNumber(response.phoneNumber) };

        let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig);
        return config;
      })
    );
  }

  /**
   * Subscribe to form changes
   */
  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this._onRackServiceChanged())
    ).subscribe();
  }


 /**
  * Event listener whenever there is a change in billing information, delivery type or schedule
  */
  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._remoteHandsService.createOrUpdateOrder(
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

    this._remoteHandsService.submitOrderRequest();
  }

  /**
   * Event listener when there is a change in Shared SMAC Form
   */
  public onChangeSharedForm(formDetails: SmacSharedDetails): void {
    this._smacSharedDetails = formDetails;
  }


  /**
   * Event listener whenever there is a change in the form
   */
  private _onRackServiceChanged(): void {

    this._remoteHandsService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.ColocationRemoteHands,
            referenceId: REMOTE_HANDS_ID,
            serviceId: this.fcRackService.value.serviceId,
            deliveryType: DeliveryType.Standard, // set to Standard as default
            schedule: getCurrentDate().toISOString(),
            properties: {
              floorLevel: this.fcFloorLevel.value,
              locationWithinCabinet: orderRemoteHandsCabinetLocationText[this.fcCabinetLocation.value],
              rackIdentifier: this.fcRackNumber.value,
              remoteHandsInstructions: this.fcInstruction.value,
              testCases: this._smacSharedDetails.testCases,
              phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
              customerReferenceNumber: this._smacSharedDetails.referenceNumber,
              notes: this._smacSharedDetails.notes
            } as RemoteHandRequestProperties
          })
        ]
      })
    );
  }

  /**
   * Event listener whenever the order is submitted from the order details step
   */
  public onSubmitOrder(submitDetails: OrderDetails, serviceID: string): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: serviceID
    };
    this.submitOrderWorkflow(workflow);
  }

  /**
   * Event listener whenever a service is selected for a remote hands request
   */
  private _onSelectedServiceRequestChange(service: any): void {
    if (isNullOrEmpty(service)) { return; }
    this.fcRackService.setValue(service);
  }

  /**
   * Register all form groups
   */
  private _registerFormGroup(): void {
    this.fcFloorLevel = new FormControl('', [CoreValidators.required]);
    this.fcRackNumber = new FormControl('', [CoreValidators.required]);
    this.fcRackService = new FormControl('', [CoreValidators.required]);
    this.fcCabinetLocation = new FormControl('', [CoreValidators.required]);
    this.fcInstruction = new FormControl('', [CoreValidators.required]);

    this.fgRemoteHands = this._formBuilder.group({
      fcRackService: this.fcRackService,
      fcCabinetLocation: this.fcCabinetLocation,
      fcInstruction: this.fcInstruction
    });
  }


  /**
   * Register all external event listeners
   */
  private _registerEvents(): void {
    this._selectedRackServiceHandler = this._eventDispatcher.addEventListener(
      McsEvent.serviceRequestChangeSelectedEvent, this._onSelectedServiceRequestChange.bind(this));
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
   * Maps colocation array to target Options Array
   */
  private _mapArrayToOption(array: Array<any>, targetOptionsArray: Array<any>): void {
    if (isNullOrEmpty(array)) { return; }
    array.forEach((colocationObj) => {
      targetOptionsArray.push(createObject(McsOption, { text: colocationObj.serviceId, value: colocationObj }));
    });
  }

  private _subscribeToLeadTimeHours(): void {
    this.loadingInProgress = true;
    this.orderItemType$.subscribe(order => {
      this.remoteHandsStandardLeadTimeHours = order.standardLeadTimeHours;
      this.loadingInProgress = false;
    });
  }

}
