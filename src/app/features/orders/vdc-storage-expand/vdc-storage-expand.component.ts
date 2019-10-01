import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  Injector
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  Observable,
  throwError,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  takeUntil,
  shareReplay,
  map
} from 'rxjs/operators';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  McsOrderWizardBase,
  McsErrorHandlerService,
  IMcsFormGroup,
  CoreValidators,
  McsFormGroupService,
  OrderRequester
} from '@app/core';
import {
  McsResource,
  McsOrderWorkflow,
  OrderIdType,
  McsResourceStorage,
  McsOrderCreate,
  McsOrderItemCreate,
  McsExpandResourceStorage
} from '@app/models';
import { McsEvent } from '@app/events';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  animateFactory,
  getSafeProperty,
  CommonDefinition,
  Guid,
  convertMbToGb,
  convertGbToMb,
  createObject
} from '@app/utilities';
import {
  McsFormGroupDirective,
  ComponentHandlerDirective
} from '@app/shared';
import {
  OrderDetails,
  VdcManageStorage
} from '@app/features-shared';
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

export class VdcStorageExpandComponent extends McsOrderWizardBase implements OnDestroy {

  public resources$: Observable<McsResource[]>;
  public selectedResource$: Observable<McsResource>;
  public fgVdcStorageExpandDetails: FormGroup;
  public fcResource: FormControl;
  public fcStorage: FormControl;
  public storageGB: number;
  private _vdcManageStorage: VdcManageStorage;
  private _selectedServerHandler: Subscription;

  /**
   * Returns the back icon key as string
   */
  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
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
    return this._vdcManageStorage.hasChanged && this._vdcManageStorage.valid;
  }

  @ViewChild('fgManageStorage', { static: false })
  private _fgManageStorage: IMcsFormGroup;

  @ViewChild(McsFormGroupDirective, { static: false })
  private _formGroup: McsFormGroupDirective;

  @ViewChild(ComponentHandlerDirective, { static: false })
  private _componentHandler: ComponentHandlerDirective;

  private _destroySubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _vdcStorageExpandService: VdcStorageExpandService,
    private _elementRef: ElementRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formGroupService: McsFormGroupService,
    private _apiService: McsApiService,
    private _errorHandlerService: McsErrorHandlerService,
  ) {
    super(_injector, _vdcStorageExpandService);
    this._registerFormGroup();
    this._registerEvents();
    this._vdcManageStorage = new VdcManageStorage();
    this._getAllResources();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._selectedServerHandler);
  }

  /**
   * Event that emits whenever a resource is selected
   * @param resource selected resource
   */
  public onChangeResource(resource: McsResource): void {
    if (isNullOrEmpty(resource) || isNullOrEmpty(resource.serviceId)) { return; }
    this._resetExpandVdcStorageState();
    this._getSelectedResource(resource);
  }

  /**
   * Event that emits whenever a storage profile is selected
   * @param storage selected storage
   */
  public onChangeStorage(storage: McsResourceStorage) {
    if (isNullOrEmpty(storage)) { return; }
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
  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (!this._validateFormFields()) { return; }
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription
    };

    this.submitOrderWorkflow(workflow);
  }

  /**
   * Register jobs/notifications events
   */
  private _registerEvents(): void {
    this._selectedServerHandler = this._eventDispatcher.addEventListener(
      McsEvent.vdcStorageExpandSelectedEvent, this._onSelectedVdcStorageExpand.bind(this)
    );

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.vdcStorageExpandSelectedEvent);
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
      map((response) => getSafeProperty(response, (obj) => obj.collection)
        .filter((resource) => !resource.isDedicated)
      ),
      catchError((error) => {
        this._errorHandlerService.redirectToErrorPage(error.status);
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
      shareReplay(1)
    );
  }

  /**
   * Event listener whenever a storage is selected for expanding
   * @param expandResourceStorage obj containing both resource and storage
   */
  private _onSelectedVdcStorageExpand(expandResourceStorage: McsExpandResourceStorage): void {
    if (isNullOrEmpty(expandResourceStorage)) { return; }
    this.fcResource.setValue(expandResourceStorage.resource);
    this.fcStorage.setValue(expandResourceStorage.storage);
  }

  /**
   * Register form group elements
   */
  private _registerFormGroup() {

    this.fcResource = new FormControl('', [CoreValidators.required]);
    this.fcStorage = new FormControl('', [CoreValidators.required]);

    // Register Form Groups using binding
    this.fgVdcStorageExpandDetails = new FormGroup({
      fcResource: this.fcResource,
      fcStorage: this.fcStorage,
    });

    if (!isNullOrEmpty(this._fgManageStorage)) {
      this.fgVdcStorageExpandDetails.removeControl('fgManageStorage');
      this.fgVdcStorageExpandDetails.addControl('fgManageStorage',
        this._fgManageStorage.getFormGroup().formGroup);
    }

    this.fgVdcStorageExpandDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
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
}
