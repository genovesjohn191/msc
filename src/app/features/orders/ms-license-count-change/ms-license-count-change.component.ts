import {
  zip,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

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
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  CoreValidators,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { OrderDetails } from '@app/features-shared';
import {
  FieldErrorMessage,
  HttpStatusCode,
  LicenseStatus,
  LicenseUnit,
  McsJob,
  McsLicense,
  McsOption,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  OrderIdType
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  addOrUpdateArrayRecord,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid,
  compareDates,
  getCurrentDate,
  addHoursToDate,
  isNullOrUndefined
} from '@app/utilities';

import { MsLicenseCountChangeService } from './ms-license-count-change.service';

const DEFAULT_LICENSE_COUNT_MIN = 1;
const DEFAULT_LICENSE_COUNT_MAX = 99999;
const DEFAULT_LICENSE_COUNT_STEP = 1;
const MS_LICENSE_COUNT_CHANGE = Guid.newGuid().toString();
const LOADING_TEXT = 'loading';
const COMMERCIAL_AGREEMENT_TYPE_NEW = 'NCE';

interface LicenseCountFormControlConfig {
  childFormControlName: string;
  license: McsLicense;
  referenceId: string;
  updateQuantityLabel: string;
}

@Component({
  selector: 'mcs-order-ms-license-count-change',
  templateUrl: 'ms-license-count-change.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MsLicenseCountChangeService]
})

export class MsLicenseCountChangeComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public licenses$: Observable<McsOption[]>;
  public childLicensesFcConfig$: Observable<LicenseCountFormControlConfig[]>;
  public licensesHasValueChange$: Observable<boolean>;
  public activeJob$: Observable<McsJob[]>;
  public isLoading: boolean = false;

  public fgMsLicenseCount: FormGroup;
  public fcLicenses: FormControl;
  public fcLicenseCount: FormControl;

  private _destroySubject = new Subject<void>();
  private _selectedLicenseHandler: Subscription;
  private _licenseChangeJobHandler: Subscription;
  private _licenseJobsChange: BehaviorSubject<McsJob[]>;
  private _childLicensesFcConfigChange: BehaviorSubject<LicenseCountFormControlConfig[]>;
  private _licensesHasValueChange: BehaviorSubject<boolean>;
  private _childLicensesFcConfig: LicenseCountFormControlConfig[] = [];
  private _licenseCache: McsLicense[] = [];
  private _fetchedLicenseDetail: String[] = [];

  private _errorStatus: number;
  private _licenseCount: number;

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _msLicenseCountChangeService: MsLicenseCountChangeService
  ) {
    super(
      _msLicenseCountChangeService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'ms-license-count-change-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerEvents();
    this._childLicensesFcConfigChange = new BehaviorSubject([]);
    this._licenseJobsChange = new BehaviorSubject([]);
    this._licensesHasValueChange = new BehaviorSubject(false);
    this._registerFormGroup();
  }

  public ngOnInit(): void {
    this._subscribeToPublicLicenses();
    this._subscribeToChildLicenseMapChange();
    this._subscribeTolicensesHasValueChange();
    this._subscribeToJobLicenseChange();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._selectedLicenseHandler);
    unsubscribeSafely(this._licenseChangeJobHandler);
  }

  public get licenseStatusOption(): typeof LicenseStatus {
    return LicenseStatus;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get minLicenseCountBase(): number {
    return this.getMinLicenseCount(this.fcLicenses?.value);
  }

  public showCooldownPeriodText(license: McsLicense){
    return license?.commercialAgreementType?.toUpperCase() === COMMERCIAL_AGREEMENT_TYPE_NEW ?
    this.hasCooldownPeriodLapsed(license) : false;
  }

  public hasCooldownPeriodLapsed(license: McsLicense): boolean {
    if(isNullOrUndefined(license)){ return false }
    if(isNullOrUndefined(license.commitmentStartDate)) { return true }
    return compareDates(getCurrentDate(), addHoursToDate(license.commitmentStartDate, 72)) === 1
    && license.commercialAgreementType?.toUpperCase() === COMMERCIAL_AGREEMENT_TYPE_NEW;
  }

  public getMinLicenseCount(license: McsLicense): number {
    let minimumQuantity = isNullOrUndefined(license.minimumQuantity) ? DEFAULT_LICENSE_COUNT_MIN : license.minimumQuantity;
    if(isNullOrUndefined(license) || license.commercialAgreementType?.toUpperCase() != COMMERCIAL_AGREEMENT_TYPE_NEW){
      return minimumQuantity;
    }
    return this.hasCooldownPeriodLapsed(license)? license.quantity : minimumQuantity;
  }

  public getProRatedLabel(license: McsLicense): string {
    if(!isNullOrUndefined(license?.commitmentStartDate)){
      if(compareDates(license?.commitmentStartDate, addHoursToDate(getCurrentDate(), -24)) === 1
        && compareDates(license?.commitmentStartDate, getCurrentDate()) < 1
        && license.commercialAgreementType?.toUpperCase() === COMMERCIAL_AGREEMENT_TYPE_NEW){
        return this.translateService.instant('orderMsLicenseCountChange.detailsStep.addons.proRatedLabel24Hrs');
      }
      else if(compareDates(license?.commitmentStartDate, addHoursToDate(getCurrentDate(), -72)) === 1
        && compareDates(license?.commitmentStartDate, getCurrentDate()) < 1
        && license.commercialAgreementType?.toUpperCase() === COMMERCIAL_AGREEMENT_TYPE_NEW){
        return this.translateService.instant('orderMsLicenseCountChange.detailsStep.addons.proRatedLabel72Hrs');
      }
    }
    return null;
  }

  public licenseCountMax(license?: McsLicense): number {
    return license?.maximumQuantity? license.maximumQuantity:DEFAULT_LICENSE_COUNT_MAX;
  }

  public get licenseCountStep(): number {
    return DEFAULT_LICENSE_COUNT_STEP;
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._licenseCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  public get loadingText(): string {
    return LOADING_TEXT;
  }

  public licenseCountQuantityErrorMessages(license: McsLicense): FieldErrorMessage {
    return createObject(FieldErrorMessage, {
      required: this.translateService.instant('orderMsLicenseCountChange.detailsStep.licenseCountRequired'),
      numeric: this.translateService.instant('orderMsLicenseCountChange.detailsStep.licenseCountNumeric'),
      min: this.translateService.instant('orderMsLicenseCountChange.detailsStep.licenseCountMinimum',
        { min_value: this.getMinLicenseCount(license) }),
      max: this.translateService.instant('orderMsLicenseCountChange.detailsStep.licenseCountMaximum',
        { max_value: this.licenseCountMax(license) }),
      step: this.translateService.instant('orderMsLicenseCountChange.detailsStep.licenseCountValid',
        { step: this.licenseCountStep })
    });
  }

  public getFormControl(formControlName: string): AbstractControl {
    return this.fgMsLicenseCount.get(formControlName);
  }

  public onChangeLicense(license: McsLicense, childLicensesFcConfig: LicenseCountFormControlConfig[]): void {
    if (isNullOrEmpty(license)) { return; }
    this.isLoading = true;

    // Get this license and any child licenses from the cache
    let relatedLicenses = this._licenseCache.filter((cachedLicense) =>
      ((license.id === cachedLicense.id) || (license.id === cachedLicense.parentId)));

    relatedLicenses.forEach((relatedLicense) => {
      if (!this._fetchedLicenseDetail.includes(relatedLicense.id)) {
          this._apiService.getLicense(relatedLicense.id).subscribe(response => {
            this._fetchedLicenseDetail.push(relatedLicense.id);
            relatedLicense = Object.assign(relatedLicense,response);
            this._resetLicenses(license, childLicensesFcConfig);
            this.isLoading = false;
          });
      }
      else {
        this.isLoading = false;
      }
      this._resetLicenses(license, childLicensesFcConfig);
    });
  }

  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: this.fcLicenses?.value?.serviceId
    };
    this.submitOrderWorkflow(workflow);
  }

  public onOrderDetailsChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }

    this._msLicenseCountChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._msLicenseCountChangeService.submitOrderRequest();
  }

  public onSubmitMsLicenseCountChangeDetails(license: McsLicense): void {
    if (isNullOrEmpty(license)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  public isCurrentLicenseHasActiveJob(licenseServiceId: string, activeJobs: McsJob[]): boolean {
    let hasActiveJob = activeJobs.find((job) => job?.clientReferenceObject?.serviceId === licenseServiceId);
    if (!isNullOrEmpty(hasActiveJob)) {
      return true;
    }
  }

  public convertUnit(unit: string, totalQuantity: number): string {
    if (unit !== LicenseUnit.Licenses) { return unit; }
    return totalQuantity === 1 ? 'license' : 'licenses';
  }

  private _updateCountLabel(valueHasChanged: boolean, license: McsLicense, updatedQuantity: number): string {
    if (!valueHasChanged) { return; }
    let currentQuantity = license.quantity;
    if (currentQuantity < updatedQuantity) {
      let totalQuantityAdded = updatedQuantity - currentQuantity;
      let unit = this.convertUnit(license.unit, totalQuantityAdded);
      return ` (${totalQuantityAdded} ${unit} will be added)`;
    } else {
      let totalQuantityRemoved = currentQuantity - updatedQuantity;
      let unit = this.convertUnit(license.unit, totalQuantityRemoved);
      return ` (${totalQuantityRemoved} ${unit} will be removed)`
    }
  }

  private _registerFormGroup(): void {
    this.fcLicenses = new FormControl('', [CoreValidators.required]);
    this.fcLicenseCount = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.step(this.licenseCountStep)(control)
    ]);

    this.fgMsLicenseCount = this._formBuilder.group({
      fcLicenses: this.fcLicenses,
      fcLicenseCount: this.fcLicenseCount
    });

    this.fcLicenses.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap((value) => {
        if (!isNullOrEmpty(value)) {
          this.fcLicenseCount.setValue(value.quantity);
        }
        this._changeDetectorRef.markForCheck();
      })
    ).subscribe();
  }

  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this._onLicenseCountDetailsChange())
    ).subscribe();
  }

  public getCountLabel(license: McsLicense, newValue: any): string{
    if(isNullOrUndefined(newValue) || !newValue.valid
      || license.quantity === +newValue.value){ return ''};
    return this._updateCountLabel(true, license, newValue?.value);
  }

  private _onLicenseCountDetailsChange(): void {
    this._msLicenseCountChangeService.clearOrderItems();
    let orderItems: McsOrderItemCreate[] = [];

    let baseLicenseHasChange = this.fcLicenses.value.quantity !== +this.fcLicenseCount.value;
    this._licensesHasValueChange.next(baseLicenseHasChange);
    if (baseLicenseHasChange) {
      orderItems.push(
        this._createOrderLineItem(MS_LICENSE_COUNT_CHANGE, this.fcLicenses.value.serviceId, this.fcLicenseCount.value)
      );
    }

    this._childLicensesFcConfig.forEach((childLicenseConfig) => {
      let childFormControl: AbstractControl = this.fgMsLicenseCount.get(childLicenseConfig.childFormControlName);
      let childFormControlValue = getSafeProperty(childFormControl, (form) => form.value);
      let hasChange = childLicenseConfig.license.quantity !== +childFormControlValue;
      if (hasChange) {
        this._licensesHasValueChange.next(hasChange);
        orderItems.push(
          this._createOrderLineItem(childLicenseConfig.referenceId, childLicenseConfig.license.serviceId, childFormControl.value)
        );
      }
    });
    this._changeDetectorRef.markForCheck();

    if (isNullOrEmpty(orderItems)) { return; }
    this._msLicenseCountChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, { items: orderItems })
    );
  }

  private _createOrderLineItem(licenseRefId: string, licenseServiceId: string, licenseQuantity: number): McsOrderItemCreate {
    return createObject(McsOrderItemCreate, {
      itemOrderType: OrderIdType.MsLicenseCountChange,
      referenceId: licenseRefId,
      serviceId: licenseServiceId,
      properties: {
        quantity: licenseQuantity
      }
    });
  }

  private _resetLicenses(parentLicense: McsLicense, childLicensesFcConfig: LicenseCountFormControlConfig[]): void {
    this.fcLicenseCount.setValidators([
      CoreValidators.required,
      CoreValidators.numeric,
      CoreValidators.min(this.getMinLicenseCount(parentLicense)),
      CoreValidators.max(this.licenseCountMax(parentLicense)),
      CoreValidators.step(this.licenseCountStep)
    ]);

    let childLicenses = this._licenseCache.filter((licenseCache) => parentLicense.id === licenseCache.parentId);
    this._msLicenseCountChangeService.clearOrderItems();
    this._childLicensesFcConfigChange.next([]);
    this._removePreviousChildFormControls(childLicensesFcConfig);
    this._createChildFormControls(childLicenses);
    this._licensesHasValueChange.next(false);
  }

  private _removePreviousChildFormControls(childLicensesFcConfig: LicenseCountFormControlConfig[]): void {
    childLicensesFcConfig.forEach((childFormControl) => {
      this.fgMsLicenseCount.removeControl(childFormControl.childFormControlName);
    });
  }

  private _createChildFormControls(licenses: McsLicense[]): void {
    let childLicensesFcConfig = [];

    licenses.forEach((license, index) => {
      let childFormControl = new FormControl(license.quantity, [
        CoreValidators.required,
        CoreValidators.numeric,
        (control) => CoreValidators.min(this.getMinLicenseCount(license))(control),
        (control) => CoreValidators.max(this.licenseCountMax(license))(control),
        (control) => CoreValidators.step(this.licenseCountStep)(control)
      ]);
      let childFormControlName = `fcChildLicense${index}`;
      childLicensesFcConfig.push({ childFormControlName, license, referenceId: Guid.newGuid().toString() });
      this.fgMsLicenseCount.addControl(childFormControlName, childFormControl);
    });

    this._childLicensesFcConfigChange.next(childLicensesFcConfig);
  }

  private _onSelectedLicense(license: McsLicense): void {
    if (isNullOrEmpty(license)) { return; }

    let cachedLicense = this._licenseCache.find((saveLicense) => saveLicense.id === license.id);
    if (isNullOrEmpty(cachedLicense)) { return; }

    // Check if License is Parent
    if (isNullOrEmpty(cachedLicense.parentId)) {
      this.fcLicenses.setValue(cachedLicense);
      return;
    }

    let cachedParentLicense = this._licenseCache.find((saveLicense) => saveLicense.id === cachedLicense.parentId);
    this.fcLicenses.setValue(cachedParentLicense);
  }

  private _onLicenseCountChangeJob(job: McsJob): void {
    let _licenseJobs: McsJob[] = [];
    _licenseJobs = addOrUpdateArrayRecord(
      _licenseJobs,
      job,
      false,
      (_existingJob: McsJob) => {
        return _existingJob.id === job.id;
      });
    this._licenseJobsChange.next(_licenseJobs);
  }

  private _registerEvents(): void {
    this._selectedLicenseHandler = this._eventDispatcher.addEventListener(
      McsEvent.licenseCountChangeSelectedEvent, this._onSelectedLicense.bind(this));

    this._licenseChangeJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobMsLicenseCountChangeEvent, this._onLicenseCountChangeJob.bind(this));
  }

  private _subscribeToChildLicenseMapChange(): void {
    this.childLicensesFcConfig$ = this._childLicensesFcConfigChange.asObservable().pipe(
      shareReplay(1),
      distinctUntilChanged(),
      tap((childLicensesFcConfig) => this._childLicensesFcConfig = childLicensesFcConfig)
    );
  }

  private _subscribeTolicensesHasValueChange(): void {
    this.licensesHasValueChange$ = this._licensesHasValueChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  private _subscribeToJobLicenseChange(): void {
    this.activeJob$ = this._licenseJobsChange.asObservable().pipe(
      takeUntil(this._destroySubject),
      map((licenseJobs) => licenseJobs.filter((job) => job.inProgress)),
      shareReplay(1)
    );
  }

  private _subscribeToPublicLicenses(): void {
    this.licenses$ = this._apiService.getLicenses().pipe(
      map((licenseCollection) => {
        let licenses = getSafeProperty(licenseCollection, (obj) => obj.collection) || [];
        this._licenseCache = licenses;
        let licensesOptions: McsOption[] = [];
        licenses.filter((license) => isNullOrEmpty(license.parentId)).forEach((license) => {
          licensesOptions.push(createObject(McsOption, { text: license.name, value: license }));
        });
        this._licenseCount = licensesOptions?.length;
        return licensesOptions;
      }),
      shareReplay(1),
      tap(() => this._eventDispatcher.dispatch(McsEvent.licenseCountChangeSelectedEvent)),
      catchError((error) => {
        this._errorStatus = error?.details?.status;
        return throwError(error);
      })
    );
  }
}
