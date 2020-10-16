import {
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Injector,
  ViewChild,
  Component
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  FormArray
} from '@angular/forms';
import {
  takeUntil,
  map,
  filter,
  tap
} from 'rxjs/operators';
import {
  Subject,
  Observable,
  zip,
  of
} from 'rxjs';
import {
  Guid,
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  unsubscribeSafely,
  formatStringToPhoneNumber
} from '@app/utilities';
import {
  McsOrderWizardBase,
  CoreValidators,
  OrderRequester,
  IMcsFormGroup
} from '@app/core';
import { McsApiService } from '@app/services';
import {
  McsOrderCreate,
  McsOrderWorkflow,
  McsOrderItemCreate,
  OrderIdType,
  McsOption,
  RouteKey,
  DnsRecordType,
  McsOrderHostedDnsChange
} from '@app/models';
import {
  OrderDetails,
  SmacSharedDetails,
  SmacSharedFormConfig
} from '@app/features-shared';
import { McsFormGroupDirective } from '@app/shared';
import { HostedDnsChangeService } from './hosted-dns-change.service';
import {
  ActionType,
  ChangeToApply
} from './change-to-apply/change-to-apply';
import { ChangeToApplyFactory } from './change-to-apply/change-to-apply.factory';

const HOSTED_DNS_CHANGE = Guid.newGuid().toString();

@Component({
  selector: 'mcs-order-hosted-dns-change',
  templateUrl: 'hosted-dns-change.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HostedDnsChangeService]
})

export class HostedDnsChangeComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgDnsChangeDetails: FormGroup;
  public fcDnsService: FormControl;
  public faChangeToApply: FormArray;

  public networkDnsOptions$: Observable<McsOption[]>;
  public smacSharedFormConfig$: Observable<SmacSharedFormConfig>;

  private _smacSharedDetails: SmacSharedDetails;

  @ViewChild('fgSmacSharedForm')
  public set fgSmacSharedForm(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgDnsChangeDetails.contains('fgSmacSharedForm');
    if (isRegistered) { return; }
    this.fgDnsChangeDetails.addControl('fgSmacSharedForm',
      value.getFormGroup().formGroup
    );
  }

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
    private _hostedDnsChangeService: HostedDnsChangeService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService
  ) {
    super(
      _hostedDnsChangeService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'hosted-dns-change-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._smacSharedDetails = new SmacSharedDetails();
    this._registerFormGroups();
  }

  public ngOnInit(): void {
    this._subscribeToNetworkDns();
    this._subscribeToSmacSharedFormConfig();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._formGroupSubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  /**
   * Returns true if the form array have more than 2 items
   */
  public isChangeItemRemovable(formArrayLength: number): boolean {
    return formArrayLength > 1;
  }

  /**
   * Returns a specific control from a form group based on the control name
   */
  public getFormControl(formGroup: FormGroup, formControlName: string): FormControl {
    return formGroup.controls[formControlName] as FormControl;
  }

  /**
   * Remove an inner form on the Change To Apply form array based on index
   */
  public removeChangeItem(index: number): void {
    if (!this.isChangeItemRemovable(this.faChangeToApply.controls.length)) { return; }
    this.faChangeToApply.controls.splice(index, 1);
    this.faChangeToApply.updateValueAndValidity();
  }

  /**
   * Add a new inner form on the Change To Apply form array
   */
  public addChangeItem(): void {
    this.faChangeToApply.controls.push(this._createChangeToApplyForm());
    this.faChangeToApply.updateValueAndValidity();
  }

  /**
   * Event listener when there is a change in the Change To Apply array forms
   */
  public onChangeToApplyFormDataChange(): void {
    this.faChangeToApply.updateValueAndValidity();
  }

  /**
   * Event listener when there is a change in Shared SMAC Form
   */
  public onChangeSharedForm(formDetails: SmacSharedDetails): void {
    this._smacSharedDetails = formDetails;
  }

  /**
   * Event listener when there is a change in Order Details
   */
  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }

    this._hostedDnsChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing,
      orderDetails.deliveryType
    );
    this._hostedDnsChangeService.submitOrderRequest();
  }

  /**
   * Event listener when Order is Submitted
   */
  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription
    };
    this.submitOrderWorkflow(workflow);
  }

  /**
   * Register all form groups
   */
  private _registerFormGroups() {
    this.fcDnsService = new FormControl('', [CoreValidators.required]);
    this.faChangeToApply = new FormArray([this._createChangeToApplyForm()]);

    this.fgDnsChangeDetails = this._formBuilder.group({
      fcDnsService: this.fcDnsService,
      faChangeToApply: this.faChangeToApply,
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
      tap(() => this._onDnsFormDetailsChange())
    ).subscribe();
  }

  /**
   * Event listener whenever there is a change in the form
   */
  private _onDnsFormDetailsChange(): void {
    this._hostedDnsChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            serviceId: this.fcDnsService.value,
            itemOrderType: OrderIdType.HostedDnsChange,
            referenceId: HOSTED_DNS_CHANGE,
            properties: createObject(McsOrderHostedDnsChange, {
              addRecords: this._getChangeDetailsByAction(ActionType.Add),
              removeRecords: this._getChangeDetailsByAction(ActionType.Remove),
              phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
              customerReferenceNumber: this._smacSharedDetails.referenceNumber,
              notes: this._smacSharedDetails.notes
            })
          })
        ]
      })
    );
  }

  /**
   * Create and Returns a new Change To Apply Form Group
   */
  private _createChangeToApplyForm(): FormGroup {
    let formControls = ChangeToApplyFactory.createChangeFormControls(ActionType.Add);
    let form = this._formBuilder.group({ fcActionType: [ActionType.Add, [CoreValidators.required]] });
    formControls.forEach((item) => {
      form.setControl(item.controlName, item.control);
    });
    return form;
  }

  /**
   * Extracts and Return all the values from the form array based on Action Type
   */
  private _getChangeDetailsByAction(actionType: ActionType): ChangeToApply[] {
    let changesToApply: ChangeToApply[] = [];
    this.faChangeToApply.controls.forEach((formGroup: FormGroup) => {
      if (formGroup.controls['fcActionType'].value === actionType) {

        let changeDetail: ChangeToApply = {
          recordType: formGroup.controls['fcRecordType'].value,
          hostName: formGroup.controls['fcHostName'].value,
          target: formGroup.controls['fcTarget'].value,
          ttlSeconds: formGroup.controls['fcTtl'].value
        };

        if (formGroup.controls['fcRecordType'].value === DnsRecordType.MX) {
          changeDetail.priority = formGroup.controls['fcPriority'].value;
        }
        changesToApply.push(changeDetail);
      }
    });

    return changesToApply;
  }

  /**
   * Subscribe to vdc services
   */
  private _subscribeToNetworkDns(): void {
    // Live
    // this.networkDnsOptions$ = this._apiService.getNetworkDnss().pipe(
    //   map((dnsCollection) => {
    //     let dnsList = getSafeProperty(dnsCollection, (obj) => obj.collection) || [];
    //     let dnsOptions: McsOption[] = [];
    //     dnsList.forEach((dns) => {
    //       dnsOptions.push(createObject(McsOption, { text: dns.name, value: dns }));
    //     });
    //     return dnsOptions;
    //   }),
    //   shareReplay(1),
    // );

    // Demo / Mock
    let dnsOptions: McsOption[] = [];
    dnsOptions.push(createObject(McsOption, { text: 'DNS 1', value: { 'serviceId': 'dns1' } }));
    dnsOptions.push(createObject(McsOption, { text: 'DNS 2', value: { 'serviceId': 'dns2' } }));
    this.networkDnsOptions$ = of(dnsOptions);
  }

  /**
   * Subscribe to Smac Shared Form Config
   */
  private _subscribeToSmacSharedFormConfig(): void {
    this.smacSharedFormConfig$ = this._apiService.getAccount().pipe(
      map((response) => {
        let testCaseConfig = { isIncluded: false };
        let notesConfig = { isIncluded: true };
        let contactConfig = { isIncluded: true, phoneNumber: formatStringToPhoneNumber(response.phoneNumber) };

        let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig);
        return config;
      })
    );
  }
}
