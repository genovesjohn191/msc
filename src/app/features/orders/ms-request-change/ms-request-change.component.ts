import {
  of,
  zip,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  filter,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

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
  ActivatedRoute,
  Params
} from '@angular/router';
import {
  CoreValidators,
  IMcsFormGroup,
  McsAccessControlService,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  OrderDetails,
  SmacSharedDetails,
  SmacSharedFormConfig
} from '@app/features-shared';
import {
  azureProductsText,
  complexityText,
  formResponseText,
  AzureProducts,
  Complexity,
  DeliveryType,
  FormResponse,
  McsAzureService,
  McsAzureServiceQueryParams,
  McsOption,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  OrderIdType,
  azureServiceRequestTypeText,
  AzureServiceRequestType,
  McsCloudHealthOption,
  McsFeatureFlag
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  compareStrings,
  createObject,
  getCurrentDate,
  getSafeProperty,
  isNullOrEmpty,
  pluck,
  unsubscribeSafely,
  CommonDefinition,
  Guid,
  convertUrlParamsKeyToLowerCase
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { MsRequestChangeService } from './ms-request-change.service';
import { CloudHealthAlertType } from './cloudhealth/cloudhealth-services';
import {
  addNewResourcesText,
  AzureResources
} from './ms-request-services.enum';

const MAX_DESCRIPTION_LENGTH = 850;
const VISIBILE_ROWS = 3;
const MS_REQUEST_SERVICE_CHANGE = Guid.newGuid().toString();
const MULTI_SELECT_LIMIT = 5;
const LOADING_TEXT = 'loading';

type MsCloudHealthResources = {
  name: string;
  type: string;
  subscription: string;
  resourceGroup: string;
  action: string;
}

type MsCustomRequestChangeProperties = {
  type: string;
  complexity: string;
  category: string;
  resourceIdentifiers: string[];
  phoneConfirmationRequired: boolean;
  customerReferenceNumber: string;
  requestDescription: string;
};

type MsCloudHealthRequestChangeProperties = {
  type: string;
  complexity: string;
  resources: MsCloudHealthResources[];
  phoneConfirmationRequired: boolean;
  customerReferenceNumber: string;
};

type MsRequestChangeProperties = MsCloudHealthRequestChangeProperties | MsCustomRequestChangeProperties;

@Component({
  selector: 'mcs-ms-request-change',
  templateUrl: 'ms-request-change.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MsRequestChangeService]
})

export class MsRequestChangeComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public fgMsServiceChange: FormGroup;
  public fcMsService: FormControl;
  public fcMsServiceRequestType: FormControl;
  public fcAzureProduct: FormControl;
  public fcComplexity: FormControl;
  public fcAzureResource: FormControl;

  public azureProductOptions$: Observable<McsOption[]>;
  public azureResourcesOptions$: Observable<McsOption[]>;
  public complexityOptions$: Observable<McsOption[]>;
  public contactOptions$: Observable<McsOption[]>;
  public azureServices$: Observable<McsOption[]>;
  public serviceRequestType$: Observable<McsOption[]>;
  public selectedServiceId$: Observable<McsAzureServiceQueryParams>;
  public smacSharedFormConfig$: BehaviorSubject<SmacSharedFormConfig>;
  public selectedScheduleDate: Date;
  public cloudHealthService: McsCloudHealthOption[];

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

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }

  @ViewChild('fgSmacSharedForm')
  public set fgSmacSharedForm(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgMsServiceChange.contains('fgSmacSharedForm');
    if (isRegistered) { return; }
    this.fgMsServiceChange.addControl('fgSmacSharedForm',
      value.getFormGroup().formGroup
    );
  }

  @ViewChild('fgCloudhealthService')
  public set fgCloudhealthService(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgMsServiceChange.contains('fgCloudhealthService');
    if (isRegistered) { return; }
    this.fgMsServiceChange.addControl('fgCloudhealthService',
      value.getFormGroup().formGroup
    );
  }

  constructor(
    _injector: Injector,
    private _accessControlService: McsAccessControlService,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _formBuilder: FormBuilder,
    private _msRequestChangeService: MsRequestChangeService,
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
    this._getSelectedAzureService();
    this._subscribeToRequestTypeOptions();
    this._subscribeToAzureProductOptions();
    this._subscribeToContactOptions();
    this._subscribeToSubscriptions();
    this._subscribeToSmacSharedFormConfig();
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._selectedServiceHandler);
    unsubscribeSafely(this.smacSharedFormConfig$);
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
    this._getAzureResources(service?.serviceId);
  }

  public onServiceChange(service: McsAzureService): void {
    this._resetAzureResources(service);
  }

  public onRequestTypeChange(requestType: AzureServiceRequestType): void {
    let isRequestTypeCloudHealth = this.isServiceRequestTypeCloudHealth(requestType);
    this.fcMsServiceRequestType.setValue(requestType);
    if (isRequestTypeCloudHealth) {
      this.fcAzureProduct.disable();
      this.fcAzureResource.disable();
      this.fgMsServiceChange.controls['fgSmacSharedForm'].get('fcNotes').disable();
    } else {
      this.fcAzureProduct.enable();
      this.fcAzureResource.enable();
      this.fgMsServiceChange.controls['fgSmacSharedForm'].get('fcNotes').enable();
      this.fgMsServiceChange.removeControl('fgCloudhealthService');
    }
    this._subscribeToSmacSharedFormConfig();
    this.fgMsServiceChange.updateValueAndValidity();
  }

  public isServiceRequestTypeCloudHealth(requestType: AzureServiceRequestType): boolean {
    return requestType === AzureServiceRequestType.CloudHealth;
  }

  public isServiceRequestTypeCustom(requestType: AzureServiceRequestType): boolean {
    return requestType === AzureServiceRequestType.Custom;
  }

  public hasCloudHealthRequestAcess(): boolean {
    let hasCloudHealthRequestAccess = this._accessControlService.hasAccessToFeature(McsFeatureFlag.CloudHealthServiceRequest);
    return hasCloudHealthRequestAccess;
  }

  public onCloudHealthChange(alerts: McsCloudHealthOption[]): void {
    this.cloudHealthService = alerts;
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
    let hasCloudHealthRequestAcess = !this.hasCloudHealthRequestAcess() ? AzureServiceRequestType.Custom : '';
    this.fcMsServiceRequestType = new FormControl(hasCloudHealthRequestAcess, [CoreValidators.required]);
    this.fcAzureProduct = new FormControl('', [CoreValidators.required]);
    this.fcAzureResource = new FormControl('', [CoreValidators.required]);

    this.fgMsServiceChange = this._formBuilder.group({
      fcMsService: this.fcMsService,
      fcfcMsServiceRequestType: this.fcMsServiceRequestType,
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
    let orderProperties = this._setOrderProperties(this.fcMsServiceRequestType?.value, selectedResources);
    this._msRequestChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.MsRequestChange,
            referenceId: MS_REQUEST_SERVICE_CHANGE,
            serviceId: this.fcMsService.value.serviceId,
            deliveryType: DeliveryType.Standard, // set to Standard as default
            schedule: getCurrentDate().toISOString(),
            properties: orderProperties as MsRequestChangeProperties
          })
        ]
      })
    );
  }

  /**
   * Sets the order properties depending on the request type
   */
  private _setOrderProperties(requestType: number, selectedResources?: string[]): MsRequestChangeProperties {
    let properties: MsCustomRequestChangeProperties | MsCloudHealthRequestChangeProperties;
    switch (requestType) {
      case AzureServiceRequestType.Custom:
        properties = {
          type: azureServiceRequestTypeText[AzureServiceRequestType.Custom],
          complexity: complexityText[Complexity.Simple], // temporarily set complexity value to simple by default
          category: azureProductsText[this.fcAzureProduct.value],
          resourceIdentifiers: selectedResources,
          phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
          customerReferenceNumber: this._smacSharedDetails.referenceNumber,
          requestDescription: this._smacSharedDetails.notes
        }
        break;
      case AzureServiceRequestType.CloudHealth:
        let cloudHealthChanges = this._setOrderCloudhealthResources(this.cloudHealthService);
        properties = {
          type: azureServiceRequestTypeText[AzureServiceRequestType.CloudHealth],
          complexity: complexityText[Complexity.Simple],
          resources: cloudHealthChanges,
          phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
          customerReferenceNumber: this._smacSharedDetails.referenceNumber,
        }
        break
      default:
        break;
    }

    return properties;
  }

  private _setOrderCloudhealthResources(alerts: McsCloudHealthOption[]): MsCloudHealthResources[] {
    if (isNullOrEmpty(alerts)) { return; }
    let resources = [];
    alerts.forEach((alert) => {
      resources.push({
        name: alert.config?.name,
        type: alert.config?.type,
        subscription: alert.config?.subscriptionId,
        resourceGroup: alert.config?.resourceGroupName,
        action: this._setCloudHealthAlertActionValue(alert)
      })
    })
    return resources;
  }

  private _setCloudHealthAlertActionValue(alert: McsCloudHealthOption): string {
    const actionRemove = this._translateService.instant('action.remove');
    const mTagLabel = this._translateService.instant('orderMsRequestChange.detailsStep.managementTags.actionLabel');
    return alert?.alertType === CloudHealthAlertType.ManagementTags ?
      `${mTagLabel} ${alert.text}` : actionRemove;
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
   * Initialize the options for request type
   */
  private _subscribeToRequestTypeOptions(): void {
    this.serviceRequestType$ = of([
      createObject(McsOption, {
        text: azureServiceRequestTypeText[AzureServiceRequestType.Custom],
        value: AzureServiceRequestType.Custom
      }),
      createObject(McsOption, {
        text: azureServiceRequestTypeText[AzureServiceRequestType.CloudHealth],
        value: AzureServiceRequestType.CloudHealth
      })
    ]);
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
    let isRequestTypeCustom = this.fcMsServiceRequestType?.value === AzureServiceRequestType.Custom;
    let testCaseConfig = { isIncluded: false };
    let notesConfig = {
      isIncluded: isRequestTypeCustom ? true : false, validators: [CoreValidators.required],
      placeholder: this.requestDescriptionPlaceHolder,
      isRequired: true
    };
    let contactConfig = { isIncluded: true };
    let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig);
    this.smacSharedFormConfig$ = new BehaviorSubject<SmacSharedFormConfig>(config);
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
  private _getAzureResources(serviceId: string = null): void {
    this.loadingInProgress = true;
    this.azureResourcesOptions$ = this._apiService.getAzureResources().pipe(
      map((resourcesCollection) => {
        let resources = getSafeProperty(resourcesCollection, (obj) => obj.collection) || [];
        let filteredResources = resources.filter((resource) => resource.serviceId === serviceId)
        let resourceOptions: McsOption[] = [];
        resourceOptions.push(createObject(McsOption, {
          text: addNewResourcesText[AzureResources.AddNewResources],
          value: { azureId: addNewResourcesText[AzureResources.AddNewResources]}
        }));
        filteredResources.forEach((resource) => {
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

  /**
   * Subscribes to selected azure service
   */
  private _getSelectedAzureService(): void {
    this.selectedServiceId$ = this._activatedRoute.queryParams.pipe(
      map((params: Params) => {
        let lowerParams: Params = convertUrlParamsKeyToLowerCase(params);
        return new McsAzureServiceQueryParams(
          lowerParams?.serviceid,
          lowerParams?.resourceid
        );
      }),
      tap((params: McsAzureServiceQueryParams) => {
        this.azureServices$.subscribe(services => {
          let serviceFound = services.find(service =>
            compareStrings(service.value.serviceId, params.serviceId) === 0);
          let fcMsServiceValue = params?.serviceId ? serviceFound.value : null;
          this.fcMsService.setValue(fcMsServiceValue);
        });
        if (!isNullOrEmpty(params.serviceId)) {
          if (!isNullOrEmpty(params.azureId)) {
            this.fcMsServiceRequestType.setValue(AzureServiceRequestType.Custom);
          }
          this._getAzureResources(params.serviceId);
        }
      }),
      shareReplay(1)
    );
  }
}
