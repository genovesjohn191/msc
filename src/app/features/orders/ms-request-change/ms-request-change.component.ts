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
  throwError,
  forkJoin
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
  HttpStatusCode,
  McsAzureResourceQueryParams,
  McsManagementServiceQueryParams,
  McsOptionGroup,
  McsAzureManagementService,
  CloudHealthAlertType
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
  convertUrlParamsKeyToLowerCase,
  formatStringToText
} from '@app/utilities';
import { MsRequestChangeService } from './ms-request-change.service';
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
const LOADING_TEXT = 'Loading';
@Component({
  selector: 'mcs-ms-request-change',
  templateUrl: 'ms-request-change.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MsRequestChangeService]
})

export class MsRequestChangeComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public fgMsServiceChange: FormGroup<any>;
  public fcMsService: FormControl<any>;
  public fcMsServiceRequestType: FormControl<any>;
  public fcAzureProduct: FormControl<any>;
  public fcComplexity: FormControl<any>;
  public fcAzureResource: FormControl<any>;

  public azureProductOptions$: Observable<McsOption[]>;
  public azureResourcesOptions$: Observable<McsOption[]>;
  public contactOptions$: Observable<McsOption[]>;
  public serviceRequestType$: Observable<McsOption[]>;
  public selectedServiceId$: Observable<McsAzureServiceQueryParams>;
  public smacSharedFormConfig$: BehaviorSubject<SmacSharedFormConfig>;
  public cloudHealthService: McsCloudHealthOption[];
  public azureServices$: Observable<McsOptionGroup[]>;

  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
  private _selectedServiceHandler: Subscription;
  private _smacSharedDetails: SmacSharedDetails;
  private _provisionDetails: ProvisionDetails;

  private _resourceErrorStatus: number;
  private _serviceErrorStatus: number;
  private _resourceCount: number;
  private _loadingInProgress: boolean;
  private _noServices: boolean;

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

  public get unknownFallbackText(): string {
    return this._translateService.instant('message.unknown');
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
    return !isNullOrEmpty(this._serviceErrorStatus) || this._noServices;
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
    this._subscribeToServicesOptions();
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


  public isSelectedServiceSubscription(selectedValue: McsAzureManagementService | McsAzureService): boolean {
    if (isNullOrEmpty(selectedValue)) { return false; }
    if (selectedValue instanceof McsAzureService) { return true; }
    return false;
  }

  /**
   * Event listener whenever a service is selected for a change request
   */
  private _onSelectedServiceRequestChange(service: McsAzureService): void {
    if (isNullOrEmpty(service)) { return; }
    this.fcMsService.setValue(service);
  }

  public onServiceChange(): void {
    this._getAzureResources();
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
    this.fcMsService = new FormControl<any>('', [CoreValidators.required]);
    let noAccessToOtherRequestType = !this.hasCloudHealthRequestAccess() && !this.hasProvisionRequestAccess();
    let setRequestTypeInitialValue = noAccessToOtherRequestType ? AzureServiceRequestType.Custom : '';
    this.fcMsServiceRequestType = new FormControl<any>(setRequestTypeInitialValue, [CoreValidators.required]);
    this.fcAzureProduct = new FormControl<any>('', [CoreValidators.required]);
    this.fcAzureResource = new FormControl<any>('', [CoreValidators.required]);

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
          customerReferenceNumber: formatStringToText(this._smacSharedDetails.referenceNumber),
          requestDescription: formatStringToText(this._smacSharedDetails.notes)
        }
      case AzureServiceRequestType.CloudHealth:
        let cloudHealthChanges = this._setOrderCloudhealthResources(this.cloudHealthService);
        return {
          type: azureServiceRequestTypeText[AzureServiceRequestType.CloudHealth],
          complexity: complexityText[Complexity.Simple],
          resources: cloudHealthChanges,
          phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
          customerReferenceNumber: formatStringToText(this._smacSharedDetails.referenceNumber),
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
          customerReferenceNumber: formatStringToText(this._smacSharedDetails.referenceNumber),
          requestDescription: formatStringToText(this._smacSharedDetails.notes)
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
        action: this._chAlertTypesTextIncluded(alert?.alertType) ?
          `${alert.actionLabel} ${alert.text}` : alert.actionLabel
      })
    })
    return resources;
  }

  private _chAlertTypesTextIncluded(alertType): boolean {
    if (alertType === CloudHealthAlertType.ManagementTags ||
      alertType === CloudHealthAlertType.SecurityContactEmailNotConfigured ||
      alertType === CloudHealthAlertType.SQLServerVulnerabilityAssessmentNoStorageAccountConfigured ||
      alertType === CloudHealthAlertType.SQLServerVulnerabilityAssessmentPeriodicScansDisabled ||
      alertType === CloudHealthAlertType.SQLServerVulnerabilityAssessmentEmailNotConfigured ||
      alertType === CloudHealthAlertType.SQLServerVulnerabilityAssessmentEmailSubscriptionAdminsNotConfigured ||
      alertType === CloudHealthAlertType.LoggingDisabledforKeyVault
    ) {
      return true;
    }
    return false;
  }

  private _subscribeToAzureProductOptions(): void {
    this.azureProductOptions$ = of(this._mapEnumToOption(this.azureProductsEnum, azureProductsText));
  }

  private _subscribeToRequestTypeOptions(): void {
    this.serviceRequestType$ = of(this._mapRequestTypeEnumToOption(this.requestTypeEnum, azureServiceRequestTypeText));
  }

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

  private _subscribeToServicesOptions(): void {
    let managementServicesQuery = new McsManagementServiceQueryParams();
    managementServicesQuery.productType = 'AzureVirtualDesktop';

    this.azureServices$ = forkJoin([
      this._apiService.getAzureServices(),
      this._apiService.getAzureManagementServices(managementServicesQuery)
    ]).pipe(
      map((response) => {
        let azureServices = !isNullOrEmpty(response[0]) ? this._createAzureServicesOptions(response[0].collection) : [];
        let managementServices = !isNullOrEmpty(response[1]) ? this._createManagementServicesOptions(response[1].collection) : [];
        this._noServices = azureServices.length === 0 && managementServices.length === 0;
        let servicesGroup: McsOptionGroup[] = [];
        servicesGroup.push(createObject(McsOptionGroup, { groupName: 'Subscriptions', options: azureServices}));
        servicesGroup.push(createObject(McsOptionGroup, { groupName: 'Azure Virtual Desktop', options: managementServices}));
        return servicesGroup;
      }),
      shareReplay(1),
      catchError((error) => {
        this._serviceErrorStatus = error?.details?.status;
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      }),
      tap(() => this._eventDispatcher.dispatch(McsEvent.serviceRequestChangeSelectedEvent))
    )
  }

  private _createAzureServicesOptions(azureServices: McsAzureService[]): McsOption[] {
    let subscriptionOptions: McsOption[] = [];
    azureServices?.forEach((subscription) => {
      let textValue = (!isNullOrEmpty(subscription.serviceId)) ? `${subscription.friendlyName} - ${subscription.serviceId}`
        : `${subscription.friendlyName}`;
      let serviceLevelText = subscription.serviceLevel || this.unknownFallbackText;
      subscriptionOptions.push(createObject(McsOption, {
        text: `${textValue} (${serviceLevelText})`,
        value: subscription
      }));
    });
    return subscriptionOptions;
  }

  private _createManagementServicesOptions(managementServices: McsAzureManagementService[]): McsOption[] {
    let servicesOptions: McsOption[] = [];
    managementServices?.forEach((service) => {
      let description = service.description || this.unknownFallbackText;
      let serviceId = service.serviceId || `(${this.unknownFallbackText})`;
      servicesOptions.push(createObject(McsOption, {
        text: `${description} - ${serviceId}`,
        value: service
      }));
    });
    return servicesOptions;
  }

  private _getAzureResources(): void {
    this._loadingInProgress = true;
    let queryParam = new McsAzureResourceQueryParams();
    let isSelectedServiceSubscription = this.isSelectedServiceSubscription(this.fcMsService.value);
    if (isSelectedServiceSubscription) {
      queryParam.subscriptionId = this.fcMsService.value?.id;
      queryParam.tagName = undefined;
      queryParam.tagValue = undefined;
    } else {
      queryParam.subscriptionId = undefined;
      queryParam.tagName = 'mcsServiceId';
      queryParam.tagValue = 'AZAVD';
    }

    this.azureResourcesOptions$ = this._apiService.getAzureResources(queryParam).pipe(
      map((resourcesCollection) => {
        let resources = getSafeProperty(resourcesCollection, (obj) => obj.collection) || [];
        let resourceOptions: McsOption[] = [];
        resourceOptions.push(createObject(McsOption, {
          text: addNewResourcesText[AzureResources.AddNewResources],
          value: { azureId: addNewResourcesText[AzureResources.AddNewResources]}
        }));
        resources.forEach((resource) => {
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
        return new McsAzureServiceQueryParams(lowerParams?.serviceid, lowerParams?.resourceid);
      }),
      tap((params: McsAzureServiceQueryParams) => {
        this.azureServices$.subscribe(services => {
          let selectedOptionServiceId: McsAzureService | McsAzureManagementService;
          services?.map(service => {
            service.options?.map((option) => {
              let serviceFound = compareStrings(option.value?.serviceId, params?.serviceId) === 0;
              if (!serviceFound) { return }
              selectedOptionServiceId = option.value;
            });
          });
          let fcMsServiceValue = params?.serviceId ? selectedOptionServiceId : null;
          this.fcMsService.setValue(fcMsServiceValue);
        });
        if (!isNullOrEmpty(params.serviceId)) {
          if (!isNullOrEmpty(params.azureId)) {
            this.fcMsServiceRequestType.setValue(AzureServiceRequestType.Custom);
          }
          this._getAzureResources();
        }
      }),
      shareReplay(1)
    );
  }
}