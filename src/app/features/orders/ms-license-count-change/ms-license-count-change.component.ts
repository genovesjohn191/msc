import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
  Injector,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  AbstractControl
} from '@angular/forms';
import {
  Observable,
  Subject,
  zip,
  BehaviorSubject,
  Subscription
} from 'rxjs';
import {
  takeUntil,
  filter,
  tap,
  map,
  distinctUntilChanged,
  shareReplay
} from 'rxjs/operators';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  McsOrderWizardBase,
  CoreValidators,
  OrderRequester
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  Guid,
  getSafeProperty,
  createObject,
  CommonDefinition
} from '@app/utilities';
import { McsEvent } from '@app/events';
import { McsFormGroupDirective } from '@app/shared';
import { McsApiService } from '@app/services';
import {
  McsOption,
  McsLicense,
  McsOrderWorkflow,
  McsOrderCreate,
  OrderIdType,
  McsOrderItemCreate,
  LicenseStatus
} from '@app/models';
import { OrderDetails } from '@app/features-shared';
import { MsLicenseCountChangeService } from './ms-license-count-change.service';

const DEFAULT_LICENSE_COUNT_MIN = 1;
const DEFAULT_LICENSE_COUNT_MAX = 99999;
const DEFAULT_LICENSE_COUNT_STEP = 1;
const MS_LICENSE_COUNT_CHANGE = Guid.newGuid().toString();

interface LicenseCountFormControlConfig {
  childFormControlName: string;
  license: McsLicense;
  referenceId: string;
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

  public fgMsLicenseCount: FormGroup;
  public fcLicenses: FormControl;
  public fcLicenseCount: FormControl;

  private _destroySubject = new Subject<void>();
  private _selectedLicenseHandler: Subscription;
  private _childLicensesFcConfigChange: BehaviorSubject<LicenseCountFormControlConfig[]>;
  private _licensesHasValueChange: BehaviorSubject<boolean>;
  private _childLicensesFcConfig: LicenseCountFormControlConfig[] = [];
  private _licenseCache: McsLicense[] = [];

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
    this._childLicensesFcConfigChange = new BehaviorSubject([]);
    this._licensesHasValueChange = new BehaviorSubject(false);
    this._registerFormGroup();
  }

  public ngOnInit(): void {
    this._subscribeToPublicLicenses();
    this._subscribeToChildLicenseMapChange();
    this._subscribeTolicensesHasValueChange();
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._selectedLicenseHandler);
  }

  public get licenseStatusOption(): typeof LicenseStatus {
    return LicenseStatus;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get baseLicenseCountMin(): number {
    return DEFAULT_LICENSE_COUNT_MIN;
  }

  public get baseLicenseCountMax(): number {
    return DEFAULT_LICENSE_COUNT_MAX;
  }

  public get baseLicenseCountStep(): number {
    return DEFAULT_LICENSE_COUNT_STEP;
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public getFormControl(formControlName: string): AbstractControl {
    return this.fgMsLicenseCount.get(formControlName);
  }

  public onChangeLicense(license: McsLicense, childLicensesFcConfig: LicenseCountFormControlConfig[]): void {
    if (isNullOrEmpty(license)) { return; }
    this._resetChildLisences(license, childLicensesFcConfig);
  }

  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription
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

  private _registerFormGroup(): void {
    this.fcLicenses = new FormControl('', [CoreValidators.required]);
    this.fcLicenseCount = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.baseLicenseCountMin)(control),
      (control) => CoreValidators.max(this.baseLicenseCountMax)(control),
      (control) => CoreValidators.step(this.baseLicenseCountStep)(control)
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
      if (!isNullOrEmpty(childFormControlValue) && hasChange) {
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

  private _resetChildLisences(parentLicense: McsLicense, childLicensesFcConfig: LicenseCountFormControlConfig[]): void {
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
        (control) => CoreValidators.min(this.baseLicenseCountMin)(control),
        (control) => CoreValidators.max(this.baseLicenseCountMax)(control),
        (control) => CoreValidators.step(this.baseLicenseCountStep)(control)
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

  private _registerEvents(): void {
    this._selectedLicenseHandler = this._eventDispatcher.addEventListener(
      McsEvent.licenseCountChangeSelectedEvent, this._onSelectedLicense.bind(this));
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

  private _subscribeToPublicLicenses(): void {
    this.licenses$ = this._apiService.getLicenses().pipe(
      map((licenseCollection) => {
        let licenses = getSafeProperty(licenseCollection, (obj) => obj.collection) || [];
        this._licenseCache = licenses;
        let licensesOptions: McsOption[] = [];
        licenses.filter((license) => isNullOrEmpty(license.parentId)).forEach((license) => {
          licensesOptions.push(createObject(McsOption, { text: license.name, value: license }));
        });
        return licensesOptions;
      }),
      shareReplay(1),
      tap(() => this._eventDispatcher.dispatch(McsEvent.licenseCountChangeSelectedEvent))
    );
  }
}
