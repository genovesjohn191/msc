import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  Injector,
  OnInit
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  Observable,
  throwError,
  Subject
} from 'rxjs';
import {
  catchError,
  takeUntil,
  shareReplay,
  map
} from 'rxjs/operators';
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
  McsResourceStorage,
  McsOrderWorkflow,
  McsOrderCreate
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  animateFactory,
  getSafeProperty,
  convertMbToGb,
  CommonDefinition,
  createObject
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import {
  OrderDetails,
  VdcManageStorage
} from '@app/features-shared';
import { VdcStorageCreateService } from './vdc-storage-create.service';

// TODO: will be added in API integration
// type CreateVdcStorageProperties = {
//   storageMB: number;
//   storageProfileId: string;
// };

@Component({
  selector: 'mcs-order-vdc-storage-create',
  templateUrl: 'vdc-storage-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VdcStorageCreateService],
  animations: [
    animateFactory.fadeIn
  ],
})

export class VdcStorageCreateComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public resources$: Observable<McsResource[]>;
  public resourceStorages$: Observable<McsResourceStorage[]>;
  public fgVdcStorageCreateDetails: FormGroup;
  public fcResource: FormControl;
  public fcPerfomanceTier: FormControl;
  public storage: number;

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

  @ViewChild('fgManageStorage', { static: false })
  private _fgManageStorage: IMcsFormGroup;

  @ViewChild(McsFormGroupDirective, { static: false })
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _vdcStorageCreateService: VdcStorageCreateService,
    private _apiService: McsApiService,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formGroupService: McsFormGroupService,
    private _errorHandlerService: McsErrorHandlerService,
  ) {
    super(_injector, _vdcStorageCreateService);
  }

  public ngOnInit() {
    this._registerFormGroup();
    this._getAllResources();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Event that emits whenever the slider change its value
   * @param _value current value of the slider
   */
  public onVdcStorageChange(_value: VdcManageStorage): void {
    // TODO: value of the slider will be coming from here
  }

  /**
   * Event that emits whenever a resource is selected
   * @param resource selected resource
   */
  public onChangeResource(resource: McsResource): void {
    if (isNullOrEmpty(resource) || isNullOrEmpty(resource.serviceId)) { return; }
    this._getResourceStorages(resource);
  }

  /**
   * Event that emits whenever a storage profile is selected
   * @param storage selected storage
   */
  public onChangePerfomanceTier(storage: McsResourceStorage) {
    if (isNullOrEmpty(storage)) { return; }
    let storageGB = convertMbToGb(storage.usedMB);
    this.storage = storageGB;
    this._registerNestedFormGroup();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the create vdc storage details is submitted
   */
  public onSubmitCreateVdcStorageDetails(): void {
    if (isNullOrEmpty(this.storage)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the vdc confirm order has been changed
   * @param orderDetails Order details to be set
   */
  public onVdcConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._vdcStorageCreateService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
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
    this._formGroupService.touchAllFormFields(this.fgVdcStorageCreateDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  /**
   * Get all the available resources
   */
  private _getAllResources(): void {
    this.resources$ = this._apiService.getResources().pipe(
      map((response) => response.collection.filter((resource) => !resource.isDedicated)),
      shareReplay(1),
      catchError((error) => {
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      })
    );
  }

  /**
   * Get all the selected resources storages
   * @param resource resource to be search
   */
  private _getResourceStorages(resource: McsResource): void {
    // TODO: should be get All Performance Tier
    if (isNullOrEmpty(resource)) { return; }
    this.resourceStorages$ = this._apiService.getResourceStorages(resource.id).pipe(
      map((response) => response.collection),
      shareReplay(1)
    );
  }

  /**
   * Register form group elements
   */
  private _registerFormGroup() {

    this.fcResource = new FormControl('', [CoreValidators.required]);
    this.fcPerfomanceTier = new FormControl('', [CoreValidators.required]);

    // Register Form Groups using binding
    this.fgVdcStorageCreateDetails = new FormGroup({
      fcResource: this.fcResource,
      fcPerfomanceTier: this.fcPerfomanceTier,
    });

    this.fgVdcStorageCreateDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe();
  }

  /**
   * Register the nested form group elements
   */
  private _registerNestedFormGroup() {
    if (!isNullOrEmpty(this._fgManageStorage)) {
      this.fgVdcStorageCreateDetails.removeControl('fgManageStorage');
      this.fgVdcStorageCreateDetails.addControl('fgManageStorage',
        this._fgManageStorage.getFormGroup().formGroup);
    }
  }
}
