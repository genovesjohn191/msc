import {
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Injector,
  ViewChild,
  Component,
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
  tap,
  shareReplay,
  catchError
} from 'rxjs/operators';
import {
  Subject,
  Observable,
  zip,
  of,
  throwError
} from 'rxjs';
import {
  Guid,
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  unsubscribeSafely,
  isNullOrUndefined,
  getCurrentDate
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
  McsOrderHostedDnsChange,
  McsNetworkDnsSummary,
  DeliveryType,
  McsAzureServiceQueryParams,
  HttpStatusCode
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
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

const HOSTED_DNS_CHANGE = Guid.newGuid().toString();
const LOADING_TEXT = 'loading';

@Component({
  selector: 'mcs-order-hosted-dns-change',
  templateUrl: 'hosted-dns-change.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HostedDnsChangeService]
})

export class HostedDnsChangeComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgDnsChangeDetails: FormGroup;
  public fcDnsService: FormControl;
  public fcZone: FormControl;
  public faChangeToApply: FormArray;
  public loadingDNSServices: boolean;
  public loadingDNSZones: boolean;
  public networkDnsOptions: Array<McsOption> = new Array<McsOption>();
  public networkDnsZoneOptions: Array<McsOption> = new Array<McsOption>();
  public smacSharedFormConfig$: BehaviorSubject<SmacSharedFormConfig>;
  public selectedDnsNetwork$: Observable<McsAzureServiceQueryParams>;
  public get loadingText(): string {
    return LOADING_TEXT;
  }
  private _smacSharedDetails: SmacSharedDetails;
  private _errorStatus: number;

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
    private _activatedRoute: ActivatedRoute,
    private _hostedDnsChangeService: HostedDnsChangeService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private _translateService: TranslateService
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
    this._getNetworkDns();
    this._getPreSelectedNetworkDns();
    this._initializeSmacSharedForm();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this.smacSharedFormConfig$);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this.networkDnsOptions?.length === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public get notesLabel(): string {
    return this._translateService.instant('orderHostedDnsChange.requestDetails.notesLabel');
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

  public onDnsServiceChange(networkDNS: McsNetworkDnsSummary): void {
    if (isNullOrUndefined(networkDNS)) { return; }
    this._getNetworkDnsZones(networkDNS.id);
    this._changeDetectionRef.detectChanges();
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
      orderDetails.deliveryType,
      orderDetails.schedule
    );
    this._hostedDnsChangeService.submitOrderRequest();
  }

  /**
   * Event listener when Order is Submitted
   */
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

  /**
   * Register all form groups
   */
  private _registerFormGroups() {
    this.fcDnsService = new FormControl('', [CoreValidators.required]);
    this.faChangeToApply = new FormArray([this._createChangeToApplyForm()]);
    this.fcZone = new FormControl('', [CoreValidators.required]);
    this.fgDnsChangeDetails = this._formBuilder.group({
      fcDnsService: this.fcDnsService,
      faChangeToApply: this.faChangeToApply,
      fcZone: this.fcZone
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
            referenceId: HOSTED_DNS_CHANGE,
            serviceId: this.fcDnsService.value?.serviceId,
            itemOrderType: OrderIdType.HostedDnsChange,
            deliveryType: DeliveryType.Standard, // set to Standard as default
            schedule: getCurrentDate().toISOString(),
            properties: createObject(McsOrderHostedDnsChange, {
              zone: this.fcZone.value,
              records: this._getChangeDetailsByAction(),
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
  private _getChangeDetailsByAction(): ChangeToApply[] {
    let changesToApply: ChangeToApply[] = [];
    this.faChangeToApply.controls.forEach((formGroup: FormGroup) => {
        let ttlSecondsValue: number = formGroup.controls['fcTtl'].value;
        let recordType: string =  formGroup.controls['fcRecordType'].value;
        let priorityValue: number = (formGroup.controls['fcPriority'].value) ?
                                     formGroup.controls['fcPriority'].value : 0;
        let changeDetail: ChangeToApply = {
          action: formGroup.controls['fcActionType'].value,
          type: formGroup.controls['fcRecordType'].value,
          hostName: formGroup.controls['fcHostName'].value,
          value: formGroup.controls['fcTarget'].value,
          ttlSeconds: (isNullOrEmpty(ttlSecondsValue)) ? 0 : ttlSecondsValue,
          priority: (recordType === DnsRecordType.MX) ? priorityValue : 0
        };

        changesToApply.push(changeDetail);
    });

    return changesToApply;
  }

  /**
   * Get network dns services
   */
  private _getNetworkDns(): void {
    this.loadingDNSServices = true;
    this._apiService.getNetworkDns()
      .pipe(
        catchError((error) => {
          this._errorStatus = error?.details?.status;
          this.loadingDNSServices = false;
          return throwError(error);
        })
      )
      .subscribe(dnsCollection => {
        let dnsList = getSafeProperty(dnsCollection, (obj) => obj.collection) || [];
        let optionList = new Array<McsOption>();
        if(dnsList.length === 0){
            this.loadingDNSServices = false;
            return;
        }
        else {
          dnsList.forEach((dns) => {
            optionList.push(createObject(McsOption, { text: dns.serviceId, value: dns }));
          });
          this.networkDnsOptions = optionList;
          this.loadingDNSServices = false;
          this._changeDetectionRef.detectChanges();
        }
      }
      );
  }

  /**
   * Get network dns zones
   */
  private _getNetworkDnsZones(id: string): void {
    if(isNullOrEmpty(id)) {
      this.loadingDNSZones = false;
      return;
    }

    this.loadingDNSZones = true;
    this._apiService.getNetworkDnsById(id).subscribe(response => {
        let zonesList = getSafeProperty(response, (obj) => obj.zones) || [];
        let optionList = new Array<McsOption>();
        if(zonesList.length === 0) {
          this.loadingDNSZones = false;
          return;
        } else {
          zonesList.forEach((zone) => {
            optionList.push(createObject(McsOption, { text: zone.name, value: zone }));
          });
          this.networkDnsZoneOptions = optionList;
          this.loadingDNSZones = false;
          this._changeDetectionRef.detectChanges();
        }
      }
    );
  }

  /**
   * Initialize to Smac Shared Form Config
   */
  private _initializeSmacSharedForm(): void {
    let testCaseConfig = { isIncluded: false };
    let notesConfig = { isIncluded: true, label: this.notesLabel };
    let contactConfig = { isIncluded: true };
    let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig);
    this.smacSharedFormConfig$ = new BehaviorSubject<SmacSharedFormConfig>(config);
  }

  private _getPreSelectedNetworkDns(): void {
    this.selectedDnsNetwork$ = this._activatedRoute.queryParams.pipe(
      map((params) => {
        if (params) {
          return getSafeProperty(params, (obj) => new McsAzureServiceQueryParams(obj.serviceId)) || undefined;
        }
      }),
      tap((params) => {
          let preSelectedOption: McsOption = this.networkDnsOptions.find(_dnsNetwork => _dnsNetwork.value.serviceId === params.serviceId);
          this.fcDnsService.setValue(preSelectedOption.value);
          this._getNetworkDnsZones(params.serviceId);
      }),
      shareReplay(1)
    );
  }
}
