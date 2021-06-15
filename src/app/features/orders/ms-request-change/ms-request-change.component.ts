import {
  ChangeDetectionStrategy,
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
  ActivatedRoute,
  Params
} from '@angular/router';
import {
  of,
  zip,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
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
  McsFeatureFlag,
  McsPermission,
  HttpStatusCode
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
import { MsRequestChangeService } from './ms-request-change.service';
import { CloudHealthAlertType } from './cloudhealth/cloudhealth-services';
import {
  addNewResourcesText,
  AzureResources
} from './ms-request-services.enum';
import {
  MsCloudHealthResources,
  MsRequestChangeProperties
} from './ms-request-change-types';
import { ProvisionDetails } from './provision/provision.details';

const MS_REQUEST_SERVICE_CHANGE = Guid.newGuid().toString();
const MULTI_SELECT_LIMIT = 5;
const LOADING_TEXT = 'loading';

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
  public contactOptions$: Observable<McsOption[]>;
  public azureServices$: Observable<McsOption[]>;
  public serviceRequestType$: Observable<McsOption[]>;
  public selectedServiceId$: Observable<McsAzureServiceQueryParams>;
  public smacSharedFormConfig$: BehaviorSubject<SmacSharedFormConfig>;
  public cloudHealthService: McsCloudHealthOption[];

  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
  private _selectedServiceHandler: Subscription;
  private _smacSharedDetails: SmacSharedDetails;
  private _provisionDetails: ProvisionDetails;

  private _resourceErrorStatus: number;
  private _serviceErrorStatus: number;
  private _loadingInProgress: boolean;
  private _resourceCount: number;
  private _serviceCount: number;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get azureProductsEnum(): any {
    return AzureProducts;
  }

  public get provisionNotesHelpText(): string {
    return this._translateService.instant('orderMsRequestChange.detailsStep.provisionNotesContextualHelp');
  }

  public get unknownText(): string {
    return this._translateService.instant('message.unknown');
  }

  public get customNotesHelpText(): string {
    return this._translateService.instant('smacShared.form.notes.helpText');
  }

  public get actionRemoveLabel(): string {
    return this._translateService.instant('action.remove');
  }

  public get managementTagLabel(): string {
    return this._translateService.instant('orderMsRequestChange.detailsStep.managementTags.actionLabel');
  }

  public get formResponseEnum(): any {
    return FormResponse;
  }

  public get requestTypeEnum(): any {
    return AzureServiceRequestType;
  }

  public get maxSelectionLimit(): number {
    return MULTI_SELECT_LIMIT;
  }

  public get isOtherProductSelected(): boolean {
    return this.fcAzureProduct.value === AzureProducts.Other;
  }

  public get loadingText(): string {
    return LOADING_TEXT;
  }

  public get noResourcesToDisplay(): boolean {
    return !isNullOrEmpty(this._resourceErrorStatus) || this._resourceCount === 0;
  }

  public get noResourcesFallbackText(): string {
    if (!this.noResourcesToDisplay) { return; }
    let noPermission = this._resourceErrorStatus === HttpStatusCode.Forbidden;
    return noPermission ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._serviceErrorStatus) || this._serviceCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    let noPermission = this._serviceErrorStatus === HttpStatusCode.Forbidden;
    return noPermission ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  public get loadingInProgress(): boolean {
    return this._loadingInProgress;
  }

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

  @ViewChild('fgProvisionService')
  public set fgProvisionService(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgMsServiceChange.contains('fgProvisionService');
    if (isRegistered) { return; }
    this.fgMsServiceChange.addControl('fgProvisionService',
      value.getFormGroup().formGroup
    );
  }

  constructor(
    _injector: Injector,
    private _accessControlService: McsAccessControlService,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
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

  public onChangeSharedForm(formDetails: SmacSharedDetails): void {
    this._smacSharedDetails = formDetails;
  }

  public onChangeProvisionDetails(provisionDetails: ProvisionDetails): void {
    this._provisionDetails = provisionDetails;
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
    this.fcMsServiceRequestType.setValue(requestType);
    switch(requestType) {
      case AzureServiceRequestType.Custom:
        this.fcAzureProduct.enable();
        this.fcAzureResource.enable();
        this.fgMsServiceChange.controls['fgSmacSharedForm'].get('fcNotes').enable();
        this.fgMsServiceChange.removeControl('fgCloudhealthService');
        this.fgMsServiceChange.removeControl('fgProvisionService');
        break;
      case AzureServiceRequestType.CloudHealth:
        this.fcAzureProduct.disable();
        this.fcAzureResource.disable();
        this.fgMsServiceChange.removeControl('fgProvisionService');
        this.fgMsServiceChange.controls['fgSmacSharedForm'].get('fcNotes').disable();
        break;
      case AzureServiceRequestType.Provision:
        this.fcAzureProduct.disable();
        this.fcAzureResource.disable();
        this.fgMsServiceChange.removeControl('fgCloudhealthService');
        this.fgMsServiceChange.controls['fgSmacSharedForm'].get('fcNotes').enable();
        break;
      default:
        break;
    }
    this._subscribeToSmacSharedFormConfig();
    this.fgMsServiceChange.updateValueAndValidity();
  }

  public isAddNewResourceSelected(resourceText: string): boolean {
    return resourceText === addNewResourcesText[AzureResources.AddNewResources];
  }

  public isServiceRequestTypeCloudHealth(requestType: AzureServiceRequestType): boolean {
    return requestType === AzureServiceRequestType.CloudHealth;
  }

  public isServiceRequestTypeCustom(requestType: AzureServiceRequestType): boolean {
    return requestType === AzureServiceRequestType.Custom;
  }

  public isServiceRequestTypeProvision(requestType: AzureServiceRequestType): boolean {
    return requestType === AzureServiceRequestType.Provision;
  }

  public hasCloudHealthRequestAccess(): boolean {
    return this._accessControlService.hasAccessToFeature(McsFeatureFlag.CloudHealthServiceRequest);
  }

  public hasProvisionRequestAccess(): boolean {
    return this._accessControlService.hasAccessToFeature(McsFeatureFlag.ProvisionServiceRequest);
  }

  public hasPermissionToAzureResource(): boolean {
    return this._accessControlService.hasPermission([McsPermission.AzureView]);
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

  private _mapRequestTypeEnumToOption(enumeration: AzureServiceRequestType, enumText: any): McsOption[] {
    let options: McsOption[] = [];
    let requestTypeEnum = Object.values(enumeration).filter((objValue) => (typeof objValue === 'number'));
    requestTypeEnum.forEach((type) => {
      let hasCloudhealthAccess = type === AzureServiceRequestType.CloudHealth && !this.hasCloudHealthRequestAccess();
      let hasProvisionAccess = type === AzureServiceRequestType.Provision && !this.hasProvisionRequestAccess();
      if (!hasCloudhealthAccess && !hasProvisionAccess) {
        options.push(createObject(McsOption, { text: enumText[type], value: type }));
      } else {
        return;
      }
    })
    return options
  }

  private _registerFormGroup(): void {
    this.fcMsService = new FormControl('', [CoreValidators.required]);
    let noAccessToOtherRequestType = !this.hasCloudHealthRequestAccess() && !this.hasProvisionRequestAccess();
    let setRequestTypeInitialValue = noAccessToOtherRequestType ? AzureServiceRequestType.Custom : '';
    this.fcMsServiceRequestType = new FormControl(setRequestTypeInitialValue, [CoreValidators.required]);
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
    switch (requestType) {
      case AzureServiceRequestType.Custom:
        return {
          type: azureServiceRequestTypeText[AzureServiceRequestType.Custom],
          complexity: complexityText[Complexity.Simple], // temporarily set complexity value to simple by default
          category: azureProductsText[this.fcAzureProduct.value],
          resourceIdentifiers: selectedResources,
          phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
          customerReferenceNumber: this._smacSharedDetails.referenceNumber,
          requestDescription: this._smacSharedDetails.notes
        }
      case AzureServiceRequestType.CloudHealth:
        let cloudHealthChanges = this._setOrderCloudhealthResources(this.cloudHealthService);
        return {
          type: azureServiceRequestTypeText[AzureServiceRequestType.CloudHealth],
          complexity: complexityText[Complexity.Simple],
          resources: cloudHealthChanges,
          phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
          customerReferenceNumber: this._smacSharedDetails.referenceNumber,
        }
      case AzureServiceRequestType.Provision:
        return {
          type: azureServiceRequestTypeText[AzureServiceRequestType.Provision],
          complexity: complexityText[Complexity.Simple],
          resources: [],
          moduleName: this._provisionDetails?.moduleName,
          moduleId: this._provisionDetails?.moduleId,
          resourceGroup: this._provisionDetails?.resourceGroup,
          category: addNewResourcesText[AzureResources.AddNewResources],
          phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
          customerReferenceNumber: this._smacSharedDetails.referenceNumber,
          requestDescription: this._smacSharedDetails.notes
        }
    }
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
        action: alert?.alertType === CloudHealthAlertType.ManagementTags ?
          `${this.managementTagLabel} ${alert.text}` : this.actionRemoveLabel
      })
    })
    return resources;
  }

  /**
   * Initialize the options for category control
   */
  private _subscribeToAzureProductOptions(): void {
    this.azureProductOptions$ = of(this._mapEnumToOption(this.azureProductsEnum, azureProductsText));
  }

  /**
   * Initialize the options for request type
   */
  private _subscribeToRequestTypeOptions(): void {
    this.serviceRequestType$ = of(this._mapRequestTypeEnumToOption(this.requestTypeEnum, azureServiceRequestTypeText));
  }

  /**
   * Initialize the options for contact control
   */
  private _subscribeToContactOptions(): void {
    this.contactOptions$ = of(this._mapEnumToOption(this.formResponseEnum, formResponseText));
  }

  private _subscribeToSmacSharedFormConfig(): void {
    let isRequestTypeCloudHealth = this.fcMsServiceRequestType?.value === AzureServiceRequestType.CloudHealth;
    let isRequestTypeProvision = this.fcMsServiceRequestType?.value === AzureServiceRequestType.Provision;
    let testCaseConfig = { isIncluded: false };
    let notesConfig = {
      isIncluded: isRequestTypeCloudHealth ? false : true, validators: [CoreValidators.required],
      placeholder: this.requestDescriptionPlaceHolder,
      helpText: isRequestTypeProvision ? this.provisionNotesHelpText : this.customNotesHelpText,
      isRequired: true
    };
    let contactConfig = { isIncluded: true };
    let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig);
    this.smacSharedFormConfig$ = new BehaviorSubject<SmacSharedFormConfig>(config);
  }

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
        this._serviceCount = subscriptionOptions?.length;
        return subscriptionOptions;
      }),
      shareReplay(1),
      catchError((error) => {
        this._serviceErrorStatus = error?.details?.status;
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      }),
      tap(() => this._eventDispatcher.dispatch(McsEvent.serviceRequestChangeSelectedEvent))
    );
  }

  private _getAzureResources(serviceId: string = null): void {
    this._loadingInProgress = true;
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
        this._resourceCount = resourceOptions?.length;
        return resourceOptions;
      }),
      catchError((error) => {
        this._loadingInProgress = false;
        this._resourceErrorStatus = error?.details?.status;
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      }),
      shareReplay(1),
      tap(() => {
        this._eventDispatcher.dispatch(McsEvent.serviceRequestChangeSelectedEvent);
        this._loadingInProgress = false;
        this._changeDetectorRef.markForCheck();
      })
    );
  }

  private _registerEvents(): void {
    this._selectedServiceHandler = this._eventDispatcher.addEventListener(
      McsEvent.serviceRequestChangeSelectedEvent, this._onSelectedServiceRequestChange.bind(this));
  }

  private _getSelectedAzureService(): void {
    this.selectedServiceId$ = this._activatedRoute.queryParams.pipe(
      map((params: Params) => {
        let lowerParams: Params = convertUrlParamsKeyToLowerCase(params);
        return new McsAzureServiceQueryParams( lowerParams?.serviceid, lowerParams?.resourceid);
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