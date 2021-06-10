import {
  throwError,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil
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
  CoreValidators,
  IMcsFormGroup,
  McsErrorHandlerService,
  McsFormGroupService,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  OrderDetails,
  VdcManageScale
} from '@app/features-shared';
import {
  HttpStatusCode,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  McsResource,
  McsResourceCompute,
  OrderIdType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ComponentHandlerDirective,
  McsFormGroupDirective
} from '@app/shared';
import {
  convertGbToMb,
  convertMbToGb,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid
} from '@app/utilities';

import { VdcScaleService } from './vdc-scale.service';

type VdcScaleProperties = {
  cpuCount: number;
  memoryMB: number;
};

const VDC_SCALE_REF_ID = Guid.newGuid().toString();

@Component({
  selector: 'mcs-order-vdc-scale',
  templateUrl: 'vdc-scale.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VdcScaleService]
})

export class VdcScaleComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public resources$: Observable<McsResource[]>;
  public resourceCompute$: Observable<McsResourceCompute>;

  public fgVdcScaleDetails: FormGroup;
  public fcVdc: FormControl;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  @ViewChild('fgVdcManageScale')
  private _fgVdcManageScale: IMcsFormGroup;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  private _vdcScale: VdcManageScale;
  private _destroySubject = new Subject<void>();
  private _selectedResourceHandler: Subscription;
  private _errorStatus: number;
  private _resourcesCount: number;

  constructor(
    _injector: Injector,
    private _elementRef: ElementRef,
    private _vdcScaleService: VdcScaleService,
    private _formGroupService: McsFormGroupService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _errorHandlerService: McsErrorHandlerService,
  ) {
    super(
      _vdcScaleService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'scale-vdc-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerFormGroup();
    this._registerEvents();
    this._vdcScale = new VdcManageScale();
  }

  public ngOnInit() {
    this._getAllResources();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._selectedResourceHandler);
  }

  /**
   * Returns the back icon key as string
   */
  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._resourcesCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  /**
   * Returns true when all forms are valid
   */
  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid()) && this._vdcScale.hasChanged;
  }

  /**
   * Event that emits when the resource is change
   * @param resource current resource selected
   */
  public onChangeVdc(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this.resourceCompute$ = this._apiService.getResourceCompute(resource.id);
    this._resetScaleVdcState();
  }

  /**
   * Event that emits when data in scale component has been changed
   * @param vdcManageScale Manage Scale content
   */
  public onScaleChanged(vdcManageScale: VdcManageScale, resource: McsResource): void {
    if (isNullOrEmpty(vdcManageScale) || !vdcManageScale.hasChanged ||
      isNullOrEmpty(getSafeProperty(resource, (obj) => obj.serviceId))) { return; }

    this._vdcScale = vdcManageScale;
    this._vdcScaleService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.VdcScale,
            referenceId: VDC_SCALE_REF_ID,
            properties: {
              cpuCount: this._vdcScale.cpuCount,
              memoryMB: convertGbToMb(this._vdcScale.memoryGB)
            } as VdcScaleProperties,
            serviceId: resource.serviceId
          })
        ]
      })
    );
  }

  /**
   * Event that emits when the scale vdc details is submitted
   */
  public onSubmitScaleDetails(): void {
    if (isNullOrEmpty(this._vdcScale)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when data in submitted from the wizard
   * @param submitDetails order details
   */
  public onSubmitOrder(submitDetails: OrderDetails, resourceServiceId: string): void {
    if (!this._validateFormFields() && isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: resourceServiceId
    };

    this.submitOrderWorkflow(workflow);
  }

  /**
   * Event that emits when the vdc confirm order has been changed
   * @param orderDetails Order details to be set
   */
  public onVdcConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._vdcScaleService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._vdcScaleService.submitOrderRequest();
  }

  /**
   * Returns the selected resource cpu count
   * @param resourceCompute selected resource
   */
  public selectedResourceCpu(resourceCompute: McsResourceCompute): number {
    return getSafeProperty(resourceCompute, (obj) => obj.cpuAllocation, 0);
  }

  /**
   * Returns the selected resource memory
   * @param resourceCompute selected resource
   */
  public selectedResourceMemory(resourceCompute: McsResourceCompute): number {
    return getSafeProperty(resourceCompute, (obj) => convertMbToGb(obj.memoryAllocationMB), 0);
  }

  /**
   * Register jobs/notifications events
   */
  private _registerEvents(): void {
    this._selectedResourceHandler = this._eventDispatcher.addEventListener(
      McsEvent.vdcScaleSelectedEvent, this._onSelectedResource.bind(this));

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.vdcScaleSelectedEvent);
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
   * Event listener whenever a resource is selected
   */
  private _onSelectedResource(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this.fcVdc.setValue(resource);
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
    this._formGroupService.touchAllFormFields(this.fgVdcScaleDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  /**
   * Register form group elements
   */
  private _registerFormGroup() {
    this.fcVdc = new FormControl('', [CoreValidators.required]);

    this.fgVdcScaleDetails = new FormGroup({
      fcVdc: this.fcVdc
    });

    // Check and Register Nested Form Group
    if (!isNullOrEmpty(this._fgVdcManageScale)) {
      this.fgVdcScaleDetails.removeControl('fgManageScale');
      this.fgVdcScaleDetails.addControl('fgManageScale',
        this._fgVdcManageScale.getFormGroup().formGroup);
    }

    this.fgVdcScaleDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe();
  }

  /**
   * Resets the scale vdc state
   */
  private _resetScaleVdcState(): void {
    if (!isNullOrEmpty(this._componentHandler)) {
      this._vdcScale.hasChanged = false;
      this._componentHandler.recreateComponent();
    }
  }
}
