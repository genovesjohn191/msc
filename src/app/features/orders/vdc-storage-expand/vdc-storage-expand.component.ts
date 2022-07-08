import {
  throwError,
  Observable,
  Subject,
  of
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
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
  McsErrorHandlerService,
  McsFormGroupService,
  McsOrderWizardBase,
  OrderRequester,
  McsAccessControlService
} from '@app/core';
import {
  OrderDetails,
  VdcManageStorage
} from '@app/features-shared';
import {
  HttpStatusCode,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  McsResource,
  McsResourceStorage,
  McsVdcStorageQueryParams,
  OrderIdType,
  McsFeatureFlag
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ComponentHandlerDirective,
  McsFormGroupDirective
} from '@app/shared';
import {
  animateFactory,
  convertGbToMb,
  convertMbToGb,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid,
  convertUrlParamsKeyToLowerCase,
  compareStrings,
  isEmptyObject
} from '@app/utilities';

import { VdcStorageExpandService } from './vdc-storage-expand.service';

type ExpandVdcStorageProperties = {
  sizeMB: number;
};

const VDC_STORAGE_EXPAND_REF_ID = Guid.newGuid().toString();
@Component({
  selector: 'mcs-order-vdc-storage-expand',
  templateUrl: 'vdc-storage-expand.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VdcStorageExpandService],
  animations: [
    animateFactory.fadeIn
  ],
})

export class VdcStorageExpandComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public resources$: Observable<McsResource[]>;
  public selectedResource$: Observable<McsResource>;
  public selectedServiceId$: Observable<McsVdcStorageQueryParams>;
  public selectedStorage$: Observable<McsResourceStorage>;

  public fgVdcStorageExpandDetails: FormGroup<any>;
  public fcResource: FormControl<McsResource>;
  public fcStorage: FormControl<McsResourceStorage>;

  public storageGB: number;
  public selectedVdcStorage: McsResourceStorage;
  private _selectedStorage: McsResourceStorage;
  private _vdcManageStorage: VdcManageStorage;
  private _errorStatus: number;
  private _resourcesCount: number;
  private storageCount: number;

  /**
   * Returns the back icon key as string
   */
  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noVdcsToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._resourcesCount === 0;
  }

  public get noStorageToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this.storageCount === 0;
  }

  public get noItemsFallbackText(): string {
    if (!this.noVdcsToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  /**
   * Returns appropriate validation label depending on the storage profile's issues (with prioritized scenarios)
   */
  public get fallbackLabel(): string {
    if (!this.storageCount)
    {
        return 'message.noServiceToDisplay'
    }
    if (this.isStretched && !this._accessControlService.hasAccessToFeature([McsFeatureFlag.OrderingStretchedVdcStorageExpand]))
    {
        return 'orderVdcStorageExpand.vdcStorage.stretchedUnsupportedWarningLabel'
    }
    else if (this.isIneligibleForServiceChange)
    {
      return 'orderVdcStorageExpand.vdcStorage.ineligibleForServiceChangeWarningLabel'
    }
    else if (this.isDisabled && this._accessControlService.hasAccessToFeature([McsFeatureFlag.StorageProfileDisabledValidation]))
    {
      return 'orderVdcStorageExpand.vdcStorage.disabledWarningLabel'
    }
  }

  /**
   * Returns true when all forms are valid
   */
  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  /**
   * Returns true when all forms are valid
   */
  public get validVdcStorage(): boolean {
    return this._vdcManageStorage.hasChanged && this._vdcManageStorage.valid && !this.fallbackLabel;
  }

  /**
   * Returns true if serviceChangeAvailable is false or serviceId is empty/null
   */
  public get isIneligibleForServiceChange(): boolean {
    return !(getSafeProperty(this._selectedStorage, (obj) =>  !isNullOrEmpty(obj.serviceId), false) &&
            getSafeProperty(this._selectedStorage, (obj) => !isNullOrEmpty(obj.serviceChangeAvailable), false));
  }

  /**
   * Returns true if the storage profile is disabled
   */
  public get isDisabled(): boolean {
    return !getSafeProperty(this._selectedStorage, (obj) => !isNullOrEmpty(obj.enabled), false);
  }

  /**
   * Returns true if the storage profile is stretched
   */
  public get isStretched(): boolean {
    return getSafeProperty(this._selectedStorage, (obj) => !isNullOrEmpty(obj.isStretched), false);
  }

  @ViewChild('fgManageStorage')
  private _fgManageStorage: IMcsFormGroup;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  private _destroySubject = new Subject<void>();
  private _vdcStorageDataChangeHandler = new Subject<void>();

  constructor(
    _injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _vdcStorageExpandService: VdcStorageExpandService,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formGroupService: McsFormGroupService,
    private _apiService: McsApiService,
    private _errorHandlerService: McsErrorHandlerService,
    private _accessControlService: McsAccessControlService
  ) {
    super(
      _vdcStorageExpandService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'expand-vdc-storage-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerFormGroup();
    this._vdcManageStorage = new VdcManageStorage();
  }

  public ngOnInit() {
    this._getAllResources();
    this._subscribesToSelectedVdcStorage();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._vdcStorageDataChangeHandler);
  }

  /**
   * Event that emits whenever a resource is selected
   * @param resource selected resource
   */
  public onChangeResource(resource: McsResource): void {
    if (isNullOrEmpty(resource) || isNullOrEmpty(resource.serviceId)) { return; }
    if (isEmptyObject(this._activatedRoute.snapshot.queryParams)) {
      this.selectedStorage$ = of(null);
    }
    this._selectedStorage = null;
    this._resetExpandVdcStorageState();
    this._getSelectedResource(resource);
    if (!this.selectedVdcStorage) {
      this._selectDefaultStorageProfile();
    }
  }

  /**
   * Event that emits whenever a storage profile is selected
   * @param storage selected storage
   */
  public onChangeStorage(storage: McsResourceStorage) {
    if (isNullOrEmpty(storage)) { return; }
    this._selectedStorage = storage;
    this.storageGB = convertMbToGb(storage.limitMB);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits whenever the slider change its value
   * @param vdcManageStorage current value of the slider
   */
  public onVdcStorageChange(
    vdcManageStorage: VdcManageStorage,
    resource: McsResource,
    storage: McsResourceStorage
  ): void {

    if (isNullOrEmpty(vdcManageStorage) ||
      isNullOrEmpty(getSafeProperty(resource, (obj) => obj.serviceId)) ||
      isNullOrEmpty(getSafeProperty(storage, (obj) => obj.serviceId))) { return; }

    this._vdcManageStorage = vdcManageStorage;

    if (!this._vdcManageStorage.hasChanged || !this._vdcManageStorage.valid) { return; }
    this._vdcStorageExpandService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.VdcStorageExpand,
            referenceId: VDC_STORAGE_EXPAND_REF_ID,
            serviceId: storage.serviceId,
            parentServiceId: resource.serviceId,
            properties: {
              sizeMB: convertGbToMb(this._vdcManageStorage.value)
            } as ExpandVdcStorageProperties
          })
        ]
      })
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the expand details is submitted
   */
  public onSubmitExpandDetails(): void {
    if (isNullOrEmpty(this._vdcManageStorage)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the vdc confirm order has been changed
   * @param orderDetails Order details to be set
   */
  public onVdcConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._vdcStorageExpandService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._vdcStorageExpandService.submitOrderRequest();
  }

  /**
   * Event that emits when data in submitted from the wizard
   * @param submitDetails order details
   */
  public onSubmitOrder(submitDetails: OrderDetails, resource: McsResource): void {
    if (!this._validateFormFields()) { return; }
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: resource.id,
    };

    this.submitOrderWorkflow(workflow);
  }

  /**
   * Validates the form fields in all existing form groups
   */
  private _validateFormFields(): boolean {
    if (this.formIsValid) { return true; }
    this._touchInvalidFields();
    return false;
  }

  /**
   * Touches all the invalid form fields
   */
  private _touchInvalidFields(): void {
    this._formGroupService.touchAllFormFields(this.fgVdcStorageExpandDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  /**
   * Get all the available resources
   */
  private _getAllResources(): void {
    this.resources$ = this._apiService.getResources().pipe(
      map((response) => {
        let resources = getSafeProperty(response, (obj) => obj.collection)
        .filter((resource) => !resource.isDedicated);
        this._resourcesCount = resources?.length;
        return resources;
      }),
      catchError((error) => {
        this._errorStatus = error?.details?.status;
        return throwError(error);
      }),
      shareReplay(1)
    );
  }

  /**
   * Get all the selected resources storages
   * @param resource resource to be search
   */
  private _getSelectedResource(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this.selectedResource$ = this._apiService.getResource(resource.id).pipe(
      map((response) => {
        let storage = getSafeProperty(response, (obj) => obj.storage);
        this.storageCount = storage?.length;
        return response;
      }),
      shareReplay(1)
    )
  }

  private _selectDefaultStorageProfile(): void  {
    this.selectedResource$.subscribe(resource => {
      let storage = resource.storage;
      let storageProfileFound = storage.find(storage => storage.isDefault);
      let fcStorageProfileValue = storageProfileFound ? storageProfileFound : null;
      this.fcStorage.setValue(fcStorageProfileValue);
      this.selectedVdcStorage = fcStorageProfileValue;
    })
  }

  /**
   * Register form group elements
   */
  private _registerFormGroup() {

    this.fcResource = new FormControl<McsResource>(null, [CoreValidators.required]);
    this.fcStorage = new FormControl<McsResourceStorage>(null, [CoreValidators.required]);

    // Register Form Groups using binding
    this.fgVdcStorageExpandDetails = new FormGroup<any>({
      fcResource: this.fcResource,
      fcStorage: this.fcStorage,
    });

    if (!isNullOrEmpty(this._fgManageStorage)) {
      this.fgVdcStorageExpandDetails.removeControl('fgManageStorage');
      this.fgVdcStorageExpandDetails.addControl('fgManageStorage',
        this._fgManageStorage.getFormGroup().formGroup);
    }

    this.fgVdcStorageExpandDetails.valueChanges.pipe(
      takeUntil(this._vdcStorageDataChangeHandler)
    ).subscribe();
  }

  /**
   * Resets the expand vdc storage state
   */
  private _resetExpandVdcStorageState(): void {
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
  }

  private _subscribesToSelectedVdcStorage(): void {
    this.selectedServiceId$ = this._activatedRoute.queryParams.pipe(
      takeUntil(this._destroySubject),
      map((params: Params) => {
        let lowerParams: Params = convertUrlParamsKeyToLowerCase(params);
        return new McsVdcStorageQueryParams(lowerParams?.resourceid, lowerParams?.storageid);
      }),
      tap((params: McsVdcStorageQueryParams) => {
        this.resources$.subscribe(resources => {
          let resourceFound = resources.find(resource => compareStrings(resource.id, params.resourceId) === 0);
          let fcResourceValue = resourceFound ? resourceFound : null;
          this.fcResource.setValue(fcResourceValue);
          this._getVdcStorage(params.resourceId, params.storageId);
        })
      }),
      shareReplay(1)
    )
  }

  private _getVdcStorage(resourceId: string, storageId: string): void {
    this.selectedStorage$ = this._apiService.getVdcStorage(resourceId, storageId).pipe(
      map((storage: McsResourceStorage) => {
        this.selectedVdcStorage = storage;
        this.onChangeStorage(storage);
        return storage;
      }),
      shareReplay(1)
    )
  }
}
