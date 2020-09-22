import {
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import {
  Subject,
  zip,
  Observable,
  of,
  Subscription
} from 'rxjs';
import {
  filter,
  tap,
  takeUntil,
  map,
  shareReplay
} from 'rxjs/operators';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  McsOrderWizardBase,
  CoreValidators,
  OrderRequester,
  IMcsFormGroup,
  McsDateTimeService
} from '@app/core';
import {
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty,
  createObject,
  Guid,
  formatStringToPhoneNumber,
  getCurrentDate,
  pluck
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import {
  OrderDetails,
  SmacSharedDetails,
  SmacSharedFormConfig
} from '@app/features-shared';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import {
  McsOrderWorkflow,
  McsOption,
  McsOrderCreate,
  McsOrderItemCreate,
  OrderIdType,
  McsAzureService,
  AzureProducts,
  Complexity,
  FormResponse,
  azureProductsText,
  complexityText,
  formResponseText,
  DeliveryType
} from '@app/models';
import { MsRequestChangeService } from './ms-request-change.service';
import { TranslateService } from '@ngx-translate/core';

const MAX_DESCRIPTION_LENGTH = 850;
const VISIBILE_ROWS = 3;
const MS_REQUEST_SERVICE_CHANGE = Guid.newGuid().toString();
const MULTI_SELECT_LIMIT = 5;
const LOADING_TEXT = 'loading';

type MsRequestChangeProperties = {
  complexity: string;
  category: string;
  resourceIdentifiers: string[];
  phoneConfirmationRequired: boolean;
  customerReferenceNumber: string;
  requestDescription: string;
};

@Component({
  selector: 'mcs-ms-request-change',
  templateUrl: 'ms-request-change.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MsRequestChangeService]
})

export class MsRequestChangeComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgMsServiceChange: FormGroup;
  public fcMsService: FormControl;
  public fcAzureProduct: FormControl;
  public fcComplexity: FormControl;
  public fcAzureResource: FormControl;

  public azureProductOptions$: Observable<McsOption[]>;
  public azureResourcesOptions$: Observable<McsOption[]>;
  public complexityOptions$: Observable<McsOption[]>;
  public contactOptions$: Observable<McsOption[]>;
  public azureServices$: Observable<McsOption[]>;
  public smacSharedFormConfig$: Observable<SmacSharedFormConfig>;
  public selectedScheduleDate: Date;

  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
  private _selectedServiceHandler: Subscription;
  private _smacSharedDetails: SmacSharedDetails;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get azureProductsEnum(): any {
    return AzureProducts;
  }

  public get complexityEnum(): any {
    return Complexity;
  }

  public get formResponseEnum(): any {
    return FormResponse;
  }

  public get maxDescriptionLength(): number {
    return MAX_DESCRIPTION_LENGTH;
  }

  public get maxSelectionLimit(): number {
    return MULTI_SELECT_LIMIT;
  }


  public get isOtherProductSelected(): boolean {
    return this.fcAzureProduct.value === AzureProducts.Other;
  }

  public get descriptionVisibleRows(): number {
    return VISIBILE_ROWS;
  }

  public get enableAzureResources(): boolean {
    return this._enableAzureResources;
  }
  public set enableAzureResources(value: boolean) {
    this._enableAzureResources = value;
  }
  private _enableAzureResources: boolean = false;

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

  public get requestDescriptionPlaceHolder(): string {
    return this._translateService.instant('orderMsRequestChange.detailsStep.requestDescriptionPlaceholder');
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

    let isRegistered = this.fgMsServiceChange.contains('fgSmacSharedForm');
    if (isRegistered) { return; }
    this.fgMsServiceChange.addControl('fgSmacSharedForm',
      value.getFormGroup().formGroup
    );
  }

  constructor(
    _injector: Injector,
    private _msRequestChangeService: MsRequestChangeService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService
  ) {
    super(
      _msRequestChangeService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'ms-service-change-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._smacSharedDetails = new SmacSharedDetails();
    this._registerFormGroup();
  }

  public ngOnInit(): void {
    this._subscribeToAzureProductOptions();
    this._subscribeToContactOptions();
    this._subscribeToSubscriptions();
    this._subscribeToSmacSharedFormConfig();
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._selectedServiceHandler);
  }

  /**
   * Event listener whenever there is a change in billing information, delivery type or schedule
   */
  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._msRequestChangeService.createOrUpdateOrder(
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

    this._msRequestChangeService.submitOrderRequest();
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
   * Event listener when there is a change in Shared SMAC Form
   */
  public onChangeSharedForm(formDetails: SmacSharedDetails): void {
    this._smacSharedDetails = formDetails;
  }

  /**
   * Event listener whenever a service is selected for a change request
   */
  private _onSelectedServiceRequestChange(service: McsAzureService): void {
    if (isNullOrEmpty(service)) { return; }
    this.fcMsService.setValue(service);
  }

  private _resetAzureResources(service: McsAzureService): void {
    this._subscribeToAzureResources(service.id);
  }

  public onServiceChange(service: McsAzureService): void {
    this._resetAzureResources(service);
  }

  /**
   * Maps enumeration to Options Array
   */
  private _mapEnumToOption(enumeration: AzureProducts, enumText: any): McsOption[] {
    let options = Object.values(enumeration)
      .filter((objValue) => (typeof objValue === 'number'))
      .map(objValue => createObject(McsOption, { text: enumText[objValue], value: objValue }));
    return options;
  }

  /**
   * Register all form groups
   */
  private _registerFormGroup(): void {
    this.fcMsService = new FormControl('', [CoreValidators.required]);
    this.fcAzureProduct = new FormControl('', [CoreValidators.required]);
    this.fcAzureResource = new FormControl('', [CoreValidators.required]);

    this.fgMsServiceChange = this._formBuilder.group({
      fcMsService: this.fcMsService,
      fcAzureProduct: this.fcAzureProduct,
      fcAzureResource: this.fcAzureResource
    });
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
      tap(() => this._onServiceRequestDetailsFormChange())
    ).subscribe();
  }

  /**
   * Event listener whenever there is a change in the form
   */
  private _onServiceRequestDetailsFormChange(): void {
    let selectedResources = pluck(this.fcAzureResource.value, 'azureId');
    this._msRequestChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.MsRequestChange,
            referenceId: MS_REQUEST_SERVICE_CHANGE,
            serviceId: this.fcMsService.value.serviceId,
            deliveryType: DeliveryType.Standard, // set to Standard as default
            schedule: getCurrentDate().toISOString(),
            properties: {
              complexity: complexityText[Complexity.Simple], // temporarily set complexity value to simple by default
              category: azureProductsText[this.fcAzureProduct.value],
              resourceIdentifiers: selectedResources,
              phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
              customerReferenceNumber: this._smacSharedDetails.referenceNumber,
              requestDescription: this._smacSharedDetails.notes
            } as MsRequestChangeProperties
          })
        ]
      })
    );
  }

  /**
   * Initialize the options for category control
   */
  private _subscribeToAzureProductOptions(): void {
    this.azureProductOptions$ = of(this._mapEnumToOption(this.azureProductsEnum, azureProductsText));
  }

  /**
   * Initialize the options for complexity control
   * TODO: implement once complexity is ready
   */
  private _subscribeToComplexityOptions(): void {
    this.complexityOptions$ = of(this._mapEnumToOption(this.complexityEnum, complexityText));
  }

  /**
   * Initialize the options for contact control
   */
  private _subscribeToContactOptions(): void {
    this.contactOptions$ = of(this._mapEnumToOption(this.formResponseEnum, formResponseText));
  }

  /**
   * Subscribe to Smac Shared Form Config
   */
  private _subscribeToSmacSharedFormConfig(): void {
    this.smacSharedFormConfig$ = this._apiService.getAccount().pipe(
      map((response) => {
        let testCaseConfig = { isIncluded: false };
        let notesConfig = { isIncluded: true, validators: [CoreValidators.required],
                            placeholder: this.requestDescriptionPlaceHolder,
                            isRequired: true };
        let contactConfig = { isIncluded: true, phoneNumber: formatStringToPhoneNumber(response.phoneNumber) };

        let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig);
        return config;
      })
    );
  }

  /**
   * Subscribe and get Subscriptions from API
   */
  private _subscribeToSubscriptions(): void {
    this.azureServices$ = this._apiService.getAzureServices().pipe(
      map((subscriptionCollection) => {
        let subscriptions = getSafeProperty(subscriptionCollection, (obj) => obj.collection) || [];
        let subscriptionOptions: McsOption[] = [];
        subscriptions.forEach((subscription) => {
          let textValue = (!isNullOrEmpty(subscription.serviceId)) ? `${subscription.friendlyName} - ${subscription.serviceId}`
            : `${subscription.friendlyName}`;
          subscriptionOptions.push(createObject(McsOption,
            { text: textValue, value: subscription }));
        });
        return subscriptionOptions;
      }),
      shareReplay(1),
      tap(() => this._eventDispatcher.dispatch(McsEvent.serviceRequestChangeSelectedEvent))
    );
  }

  /**
   * Subscribe and get Azure Resources from API
   */
  private _subscribeToAzureResources(subscriptionId: string = null): void {
    this.loadingInProgress = true;
    this.azureResourcesOptions$ = this._apiService.getAzureResourcesBySubscriptionId(subscriptionId).pipe(
      map((resourcesCollection) => {
        let resources = getSafeProperty(resourcesCollection, (obj) => obj.collection) || [];
        let resourceOptions: McsOption[] = [];
        resources.forEach((resource) => {
          let textValue = `${resource.name}`;
          resourceOptions.push(createObject(McsOption, { text: textValue, value: resource }));
        });
        return resourceOptions;
      }),
      shareReplay(1),
      tap(() => {
        this._eventDispatcher.dispatch(McsEvent.serviceRequestChangeSelectedEvent);
        this.enableAzureResources = true;
        this.loadingInProgress = false;
      })
    );
  }

  /**
   * Register all external event listeners
   */
  private _registerEvents(): void {
    this._selectedServiceHandler = this._eventDispatcher.addEventListener(
      McsEvent.serviceRequestChangeSelectedEvent, this._onSelectedServiceRequestChange.bind(this));
  }
}

