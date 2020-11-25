import { Component, OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  OnDestroy,
  Injector,
  ViewChild,
  ChangeDetectorRef
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
  of,
  Subscription
} from 'rxjs';
import {
  Guid,
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  unsubscribeSafely,
  formatStringToPhoneNumber,
  getCurrentDate,
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
  McsOption,
  RouteKey,
  OrderIdType,
  DeliveryType
} from '@app/models';
import {
  OrderDetails,
  SmacSharedDetails,
  SmacSharedFormConfig
} from '@app/features-shared';
import { McsFormGroupDirective } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { SimpleFirewallChangeService } from './simple-firewall-change.service';
import { FirewallChangesRuleFactory } from './firewall-changes-shared-rule/firewall-changes-shared-rule.factory';
import {
  RuleAction,
  ActionType }
from './firewall-changes-shared-rule/firewall-changes-shared-rule';
import { McsOrderAddSimpleFirewallChange } from '@app/models/request/mcs-order-add-simple-firewall-change';
import { McsOrderSimpleFirewallAddRule } from '@app/models/request/mcs-order-simple-firewall-add-rules';

const FIREWALL_CHANGE_ID = Guid.newGuid().toString();
const LOADING_TEXT = 'loading';
// Add another group type in here if you have addition tab
type tabGroupType = 'addRule' | 'modifyRule' | 'removeRule';

@Component({
  selector: 'mcs-simple-firewall-change',
  templateUrl: './simple-firewall-change.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SimpleFirewallChangeService]
})

export class SimpleFirewallChangeComponent extends
McsOrderWizardBase implements OnInit, OnDestroy {

  public fgAddFirewallRules: FormGroup;
  public fcFirewallServices: FormControl;
  public faSharedRuleForm: FormArray;
  public dnsLeadTimeHours: number;
  public isLoading: boolean;
  public firewallOptions: Array<McsOption> = new Array<McsOption>();
  public smacSharedFormConfig$: Observable<SmacSharedFormConfig>;
  public get loadingText(): string {
    return LOADING_TEXT;
  }
  public selectedTabId$: Observable<string>;

  private _smacSharedDetails: SmacSharedDetails;
  private _routerHandler: Subscription;

  @ViewChild('fgSmacSharedForm')
  public set fgSmacSharedForm(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgAddFirewallRules.contains('fgSmacSharedForm');
    if (isRegistered) { return; }
    this.fgAddFirewallRules.addControl('fgSmacSharedForm',
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
    private _simpleFirewallChangeService: SimpleFirewallChangeService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private _translateService: TranslateService
  ) {
    super(
        _simpleFirewallChangeService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'simple-firewall-changes-add-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._smacSharedDetails = new SmacSharedDetails();
    this._registerFormGroups();
  }

  public ngOnInit(): void {
    this._getLeadTimeHours();
    this._getFirewallServices();
    this._initializeSmacSharedForm();
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this._routerHandler);
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

  public get notesLabel(): string {
    return this._translateService.instant('orderSimpleFirewallChanges.detailsStep.sharedRuleForm.add.notesLabel');
  }

  public get referenceNumberHelpText(): string {
    return this._translateService.instant('orderSimpleFirewallChanges.detailsStep.sharedRuleForm.add.referenceNumberHelpText');
  }

  public isChangeItemRemovable(formArrayLength: number): boolean {
    return formArrayLength > 1;
  }

  public getFormControl(formGroup: FormGroup, formControlName: string): FormControl {
    return formGroup.controls[formControlName] as FormControl;
  }

  public removeChangeItem(index: number): void {
    if (!this.isChangeItemRemovable(this.faSharedRuleForm.controls.length)) { return; }
    this.faSharedRuleForm.controls.splice(index, 1);
    this.faSharedRuleForm.updateValueAndValidity();
  }

  public addChangeItem(): void {
    this.faSharedRuleForm.controls.push(this._createSharedRuleForm());
    this.faSharedRuleForm.updateValueAndValidity();
  }

  public onChangeToApplyFormDataChange(): void {
    this.faSharedRuleForm.updateValueAndValidity();
  }


  public onChangeSharedForm(formDetails: SmacSharedDetails): void {
    this._smacSharedDetails = formDetails;
  }

  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }

    this._simpleFirewallChangeService.createOrUpdateOrder(
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
    this._simpleFirewallChangeService.submitOrderRequest();
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

  private _registerFormGroups() {
    this.fcFirewallServices = new FormControl('', [CoreValidators.required]);
    this.faSharedRuleForm = new FormArray([this._createSharedRuleForm()]);
    this.fgAddFirewallRules = this._formBuilder.group({
      fcFirewallServices: this.fcFirewallServices,
      faSharedRuleForm: this.faSharedRuleForm,
    });
  }

  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this._onAddFirewallDetailsChange())
    ).subscribe();
  }

  private _onAddFirewallDetailsChange(): void {
    this._simpleFirewallChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
              referenceId: FIREWALL_CHANGE_ID,
              serviceId: this.fcFirewallServices.value?.serviceId,
              itemOrderType: OrderIdType.SimpleFirewallChangeAdd,
              deliveryType: DeliveryType.Standard, // set to Standard as default
              schedule: getCurrentDate().toISOString(),
              properties: createObject(McsOrderAddSimpleFirewallChange, {
                rules: this._getSharedRuleValues(),
                customerReferenceNumber: this._smacSharedDetails.referenceNumber,
                phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
                notes: this._smacSharedDetails.notes
              })
          })
        ]
      })
    );
    this._changeDetectionRef.detectChanges();
  }

  private _initializeSmacSharedForm(): void {
    this.smacSharedFormConfig$ = this._apiService.getAccount().pipe(
      map((response) => {
        let testCaseConfig = { isIncluded: false };
        let notesConfig = { isIncluded: true, label: this.notesLabel };
        let contactConfig = { isIncluded: true, phoneNumber: formatStringToPhoneNumber(response.phoneNumber) };
        let custRefConfig = { isIncluded: true, helpText: this.referenceNumberHelpText}
        let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig, custRefConfig);
        return config;
      })
    );
  }

  private _getSharedRuleValues(): McsOrderSimpleFirewallAddRule[] {
    let sharedRules: McsOrderSimpleFirewallAddRule[] = [];
    this.faSharedRuleForm.controls.forEach((formGroup: FormGroup) => {
        let rules: McsOrderSimpleFirewallAddRule = {
          action: formGroup.controls['fcActionType'].value,
          sourceZone: formGroup.controls['fcSourceZoneInterface'].value,
          sourceIpAddress: formGroup.controls['fcSourceIpSubnet'].value,
          destinationZone: formGroup.controls['fcDestinationZoneInterface'].value,
          destinationIpAddress: formGroup.controls['fcDestinationIpSubnet'].value,
          destinationPort: formGroup.controls['fcDestinationPort'].value,
          protocol: formGroup.controls['fcProtocol'].value
        };
        sharedRules.push(rules);
    });
    return sharedRules;
  }

  private _getLeadTimeHours(): void {
    this.isLoading = true;
    this.orderItemType$.subscribe(order => {
      this.dnsLeadTimeHours = order.standardLeadTimeHours;
    });
  }

  private _getFirewallServices(): void {
    this._apiService.getFirewalls().subscribe(
      (response) => {
        let firewalls = getSafeProperty(response, (obj) => obj.collection);
        this.firewallOptions = firewalls.filter((firewall) => getSafeProperty(firewall, (obj) => obj.serviceId))
          .map((firewall) => {
            return new McsOption(firewall, `${firewall.managementName} (${firewall.serviceId})`);
        });
        this.isLoading = false;
      }
    );
  }

  private _createSharedRuleForm(): FormGroup {
    let formControls = FirewallChangesRuleFactory.createFormControls(RuleAction.Add);
    let form = this._formBuilder.group({ fcActionType: [ActionType.Allow, [CoreValidators.required]] });
    formControls.forEach((item) => {
      form.setControl(item.controlName, item.control);
    });
    return form;
  }
}
