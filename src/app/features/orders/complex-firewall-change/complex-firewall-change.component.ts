import {
  zip,
  Subject,
  Subscription,
  throwError,
  Observable,
  BehaviorSubject
} from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  map,
  takeUntil,
  tap
} from 'rxjs/operators';
import {
  CdkDragDrop,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import {
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
  CoreValidators,
  IMcsFormGroup,
  McsMatTableConfig,
  McsMatTableContext,
  McsOrderWizardBase,
  McsTableDataSource2,
  McsTableEvents,
  OrderRequester
} from '@app/core';
import {
  OrderDetails, OrderFirewallPolicyEditDialogComponent, SmacSharedDetails, SmacSharedFormConfig
} from '@app/features-shared';
import {
  DeliveryType,
  HttpStatusCode,
  McsFileInfo,
  McsFilterInfo,
  McsFirewallPolicy,
  McsOption,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  McsQueryParam,
  OrderIdType,
  PolicyAction,
  PolicyNat,
  policyText,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { ColumnFilter, DialogService2, McsFormGroupDirective, Paginator } from '@app/shared';
import {
  createObject,
  getCurrentDate,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid,
  addYearsToDate,
  formatStringToText
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ComplexFirewallChangeService } from './complex-firewall-change.service';

const MAX_OBJECTIVE_LENGTH = 850;
const VISIBILE_ROWS = 3;
const COMPLEX_FIREWALL_CHANGE_ID = Guid.newGuid().toString();
const LOADING_TEXT = 'loading';
const MIN_DATE = addYearsToDate(getCurrentDate(), -7);

type ComplexFirewallChangeRequestProperties = {
  changeObjective: string;
  ruleChanges: McsFirewallPolicy[];
  attachment?: McsFileInfo;
  customerReferenceNumber: string;
  phoneConfirmationRequired: boolean;
  notes: string;
};

@Component({
  selector: 'mcs-complex-firewall-change',
  templateUrl: './complex-firewall-change.component.html',
  providers: [ComplexFirewallChangeService]
})
export class ComplexFirewallChangeComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  // Table variables
  public readonly dataSource: McsTableDataSource2<McsFirewallPolicy>;
  public readonly dataEvents: McsTableEvents<McsFirewallPolicy>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'icon' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'policyId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'label' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'action' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'sourceInterfaces' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'destinationInterfaces' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'source' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'destination' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'services' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'schedule' }),
  ];

  public fgComplexFirewallChangeRequest: FormGroup;
  public firewallOptions: Array<McsOption> = new Array<McsOption>();
  public fcFirewallService: FormControl;
  public fcChangeObjective: FormControl;
  public fcSearchPolicy: FormControl;
  public smacSharedFormConfig$: BehaviorSubject<SmacSharedFormConfig>;
  public searchPolicyTerm: string = null;
  
  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
  private _selectedManagedServerHandler: Subscription;
  private _errorStatus: number;
  private _fileAttachment: McsFileInfo;
  private _policyList: McsFirewallPolicy[];
  private _policyList$ = new BehaviorSubject<McsFirewallPolicy[]>(null);

  private _firewallCount: number;
  private _smacSharedDetails: SmacSharedDetails;
  private _isLoading = false;
  private _isLoadingPolicyList = false;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._firewallCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }
  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get maxObjectiveLength(): number {
    return MAX_OBJECTIVE_LENGTH;
  }

  public get objectiveVisibleRows(): number {
    return VISIBILE_ROWS;
  }

  public get notesLabel(): string {
    return this._translateService.instant('orderComplexFirewallChanges.detailsStep.notesLabel');
  }

  public get loadingInProgress(): boolean {
    return this._isLoading;
  }

  public set loadingInProgress(value: boolean) {
    this._isLoading = value;
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public get loadingText(): string {
    return LOADING_TEXT;
  }

  public get isLoadingPolicyList(): boolean {
    return this._isLoadingPolicyList;
  }

  public isPolicyRemoved(action: number): boolean{
    return action === PolicyAction.Remove;
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

    let isRegistered = this.fgComplexFirewallChangeRequest.contains('fgSmacSharedForm');
    if (isRegistered) { return; }
    this.fgComplexFirewallChangeRequest.addControl('fgSmacSharedForm',
      value.getFormGroup().formGroup
    );
  }

  @ViewChild('table') table: McsTableDataSource2<McsFirewallPolicy>;

  constructor(
    _injector: Injector,
    private _complexFirewallChangeService: ComplexFirewallChangeService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _translateService: TranslateService,
    private _dialogService: DialogService2
  ) {
    super(
      _complexFirewallChangeService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'complex-firewall-change-goto-provisioning-step',
          action: 'next-button'
        }
      }
    );
    this._smacSharedDetails = new SmacSharedDetails();
    this._policyList$.next([]);
    this.dataSource = new McsTableDataSource2(this._getFirewallPolicies.bind(this));
    this.dataSource
      .registerConfiguration(new McsMatTableConfig(true))
      .registerColumnsFilterInfo(this.defaultColumnFilters);
    this.subscribeToPolicyList();
  }

  private subscribeToPolicyList(): void {
    this._policyList$.subscribe(() => {
      if(this.formIsValid) this.notifyDataChange();
    })
  }

  public ngOnInit(): void {
    this._getFirewallServices();
    this._subscribeToSmacSharedFormConfig();
    this.loadingInProgress = true;
    this._registerFormGroup();

  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._selectedManagedServerHandler);
    unsubscribeSafely(this._policyList$);
    unsubscribeSafely(this.smacSharedFormConfig$);
  }

  private _subscribeToSmacSharedFormConfig(): void {
    let testCaseConfig = { isIncluded: false };
    let notesConfig = { isIncluded: true, isRequired: false, label: this.notesLabel, placeholder: '' };
    let contactConfig = { isIncluded: true };
    let customerRefConfig = {isIncluded: true, isRequired: false, placeholder: ''};
    let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig, customerRefConfig);
    this.smacSharedFormConfig$ = new BehaviorSubject<SmacSharedFormConfig>(config);
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _getFirewallPolicies():
    Observable<McsMatTableContext<McsFirewallPolicy>> {
    return this._policyList$.pipe(
      map(policies => new McsMatTableContext(policies,
        policies?.length)
      )
    ); 
  }

  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges(),
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this.notifyDataChange()
      )
    ).subscribe();
  }

  private _updatePolicyTable(): void {
    this._policyList$.next(this._policyList);
    this.retryDatasource();
  }

  public addPolicyClicked(): void {
    this.searchPolicyTerm = null;
    // this._updatePolicyTable
    let maxSequenceNumber = Math.max(...this._policyList?.map(policy => policy.objectSequence), 0);
    let newPolicy: McsFirewallPolicy = {
      label: '',
      policyId: 0,
      natIpAddresses: [],
      sourceAddresses: [],
      sourceInterfaces: [],
      destinationAddresses: [],
      destinationInterfaces: [],
      objectSequence: maxSequenceNumber + 1,
      service: [],
      nat: PolicyNat.Enabled,
      action: PolicyAction.Add,
      actionIconKey: '',
      actionLabel: policyText[PolicyAction.Add],
      schedule: [],
      id: '',
      isDisabled: false,
      isProcessing: false,
      processingText: ''
    };
    let dialogRef = this._dialogService.open(OrderFirewallPolicyEditDialogComponent, {
      data: {
        title: 'Add Policy',
        policy: newPolicy,
        state: 'create'
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data.state === 'create'){
        this._policyList.push(data.policy);
        this._updatePolicyTable();
      }
    });
  }

  dropTable(event: CdkDragDrop<McsFirewallPolicy[]>) {
    let prevIndex = this._policyList.findIndex((d) => d === event.item.data);
    moveItemInArray(this._policyList, prevIndex, event.currentIndex);
    this._updatePolicyTable();
  }

  public policyClicked(selectedPolicy: McsFirewallPolicy): void {
    let dialogRef = this._dialogService.open(OrderFirewallPolicyEditDialogComponent, {
      data: {
        title: `Edit Policy #${selectedPolicy.policyId}`,
        policy: selectedPolicy,
        state: 'edit'
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data.state === 'delete'){
        if(data.policy.action === PolicyAction.Add){
          let index = this._policyList.findIndex((d) => d === data.policy);
          if(index >= 0) {
            this._policyList.splice(index, 1);
            this._updatePolicyTable();
          }
          return;
        }

        let policyToRemove = this._policyList.find(p => p.policyId === data.policy.policyId);
        policyToRemove.action = PolicyAction.Remove;
        this._updatePolicyTable();

      }
    });
  }

  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._complexFirewallChangeService.createOrUpdateOrder(
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

    this._complexFirewallChangeService.submitOrderRequest();
  }

  public onChangeSharedForm(formDetails: SmacSharedDetails): void {
    this._smacSharedDetails = formDetails;
  }

  private notifyDataChange(): void {
    this._complexFirewallChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.ComplexFirewallChange,
            referenceId: COMPLEX_FIREWALL_CHANGE_ID,
            serviceId: this.fcFirewallService.value.serviceId,
            deliveryType: DeliveryType.Standard,
            properties: {
              changeObjective: formatStringToText(this.fcChangeObjective.value),
              ruleChanges: this._policyList,
              attachment: this._fileAttachment,
              phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
              customerReferenceNumber: this._smacSharedDetails.referenceNumber,
              notes: formatStringToText(this._smacSharedDetails.notes)
            } as ComplexFirewallChangeRequestProperties
          })
        ]
      })
    );
  }

  public onChangedAttachment(attachments: McsFileInfo[]): void {
    this._fileAttachment = attachments[0];
    if(this.formIsValid) this.notifyDataChange();
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

  private _registerFormGroup(): void {
    this.fcFirewallService = new FormControl('', [CoreValidators.required]);
    this.fcChangeObjective = new FormControl('', [CoreValidators.required]);

    this.fgComplexFirewallChangeRequest = this._formBuilder.group({
      fcFirewallService: this.fcFirewallService,
      fcDataRequired: this.fcChangeObjective
    });
    this.fcFirewallService.valueChanges.subscribe(() => {
      if(isNullOrEmpty(this.fcFirewallService.value)) { return }

      this._isLoadingPolicyList = true;
      let queryParam = new McsQueryParam();
      queryParam.pageSize = 10000;
      queryParam.sortDirection = 'asc';
      queryParam.sortField = 'policyId';
      this._apiService.getFirewallPolicies(this.fcFirewallService.value.id)
        .pipe(
          map(response => {
            this._policyList = response?.collection;
            this._policyList.forEach(p => p.action = null);
            this._updatePolicyTable();
            }
          ),
          finalize(() => {
            this._isLoadingPolicyList = false;
          })
        ).subscribe();
    });
  }

  public onSearchPolicyValueChange(value: string): void {
    if(!value) {
      this._updatePolicyTable();
      return;
    }

    this._isLoadingPolicyList = true;
    value = value.trim().toLowerCase();

    let searchResults = this._policyList.filter(policy =>
      policy.label?.toLowerCase().includes(value) ||
      policy.policyId.toString().toLowerCase().includes(value) ||
      (value === 'new' && policy.policyId === 0) ||
      policy.actionLabel?.toLowerCase().includes(value) ||
      policy.sourceInterfaces?.some(v => v.toLowerCase().includes(value)) ||
      policy.destinationInterfaces?.some(v => v.toLowerCase().includes(value)) ||
      policy.sourceAddresses?.some(v => v.toLowerCase().includes(value)) ||
      policy.destinationAddresses?.some(v => v.toLowerCase().includes(value)) ||
      policy.sourcePorts?.some(v => v.toLowerCase().includes(value)) ||
      policy.schedule?.some(v => v.toLowerCase().includes(value))
      );
    this._policyList$.next(searchResults);
    this.retryDatasource();
    this._isLoadingPolicyList = false;
  }

  private _getFirewallServices(): void {
    this._isLoading = true;
    this._apiService.getFirewalls()
      .pipe(
        catchError((error) => {
          this._errorStatus = error?.details?.status;
          this._isLoading = false;
          return throwError(error);
        })
      )
      .subscribe(
        (response) => {
          let firewalls = getSafeProperty(response, (obj) => obj.collection);
          this.firewallOptions = firewalls.filter((firewall) => getSafeProperty(firewall, (obj) => obj.serviceId))
            .map((firewall) => {
              return new McsOption(firewall, `${firewall.managementName} (${firewall.serviceId})`);
            });
          this._firewallCount = this.firewallOptions?.length;
          this._isLoading = false;
        }
      );
  }
}