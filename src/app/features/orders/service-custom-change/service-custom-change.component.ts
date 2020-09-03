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
  FormBuilder
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
  zip
} from 'rxjs';
import {
  Guid,
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  unsubscribeSafely,
  formatStringToPhoneNumber,
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
  serviceTypeText,
  McsOrderCreate,
  McsOrderWorkflow,
  McsOrderItemCreate,
  OrderIdType,
  McsOrderServiceCustomChange,
  McsOption,
  McsAccount,
  RouteKey,
  DeliveryType
} from '@app/models';
import {
  OrderDetails,
  SmacSharedDetails,
  SmacSharedFormConfig
} from '@app/features-shared';
import { McsFormGroupDirective } from '@app/shared';
import { ServiceCustomChangeService } from './service-custom-change.service';

const SERVICE_CUSTOM_CHANGE = Guid.newGuid().toString();
const TEXTAREA_MAXLENGTH_DEFAULT = 850;

// TODO: create a base class or an interface for all the services of portal
interface CustomChangeService {
  name: string;
  serviceId: string;
}

@Component({
  selector: 'mcs-order-service-custom-change',
  templateUrl: 'service-custom-change.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServiceCustomChangeService]
})

export class ServiceCustomChangeComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgCustomChangeDetails: FormGroup;
  public fcService: FormControl;
  public fcChangeDescription: FormControl;
  public fcChangeObjective: FormControl;

  public vdcServices$: Observable<CustomChangeService[]>;
  public serverServices$: Observable<CustomChangeService[]>;
  public firewallServices$: Observable<CustomChangeService[]>;
  public internetPortServices$: Observable<CustomChangeService[]>;
  public batServices$: Observable<CustomChangeService[]>;
  public account$: Observable<McsAccount>;
  public smacSharedFormConfig$: Observable<SmacSharedFormConfig>;

  public contactOptions$: Observable<McsOption[]>;

  private _smacSharedDetails: SmacSharedDetails;

  @ViewChild('fgSmacSharedForm', { static: false })
  public set fgSmacSharedForm(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgCustomChangeDetails.contains('fgSmacSharedForm');
    if (isRegistered) { return; }
    this.fgCustomChangeDetails.addControl('fgSmacSharedForm',
      value.getFormGroup().formGroup
    );
  }

  @ViewChild(McsFormGroupDirective, { static: false })
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _customChangeService: ServiceCustomChangeService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService
  ) {
    super(
      _customChangeService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'custom-change-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._smacSharedDetails = new SmacSharedDetails();
    this._registerFormGroups();
  }

  public ngOnInit(): void {
    this._subscribeToVdcServices();
    this._subscribeToServerServices();
    this._subscribeToFirewallServices();
    this._subscribeToInternetPortServices();
    this._subscribeToBatServices();
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

  public get defaultMaxlength(): number {
    return TEXTAREA_MAXLENGTH_DEFAULT;
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

    this._customChangeService.createOrUpdateOrder(
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
    this._customChangeService.submitOrderRequest();
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
    this.fcService = new FormControl('', [CoreValidators.required]);
    this.fcChangeDescription = new FormControl('', [CoreValidators.required]);
    this.fcChangeObjective = new FormControl('', [CoreValidators.required]);

    this.fgCustomChangeDetails = this._formBuilder.group({
      fcService: this.fcService,
      fcChangeDescription: this.fcChangeDescription,
      fcChangeObjective: this.fcChangeObjective
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
      tap(() => this._onCustomChangeDetailsFormChange())
    ).subscribe();
  }

  /**
   * Event listener whenever there is a change in the form
   */
  private _onCustomChangeDetailsFormChange(): void {
    this._customChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            serviceId: this.fcService.value,
            itemOrderType: OrderIdType.ServiceCustomChange,
            referenceId: SERVICE_CUSTOM_CHANGE,
            deliveryType: DeliveryType.Standard, // set to Standard as default
            schedule: getCurrentDate().toISOString(),
            properties: createObject(McsOrderServiceCustomChange, {
              change: this.fcChangeDescription.value,
              changeObjective: this.fcChangeObjective.value,
              testCases: this._smacSharedDetails.testCases,
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
   * Subscribe to vdc services
   */
  private _subscribeToVdcServices(): void {
    this.vdcServices$ = this._apiService.getResources().pipe(
      map((response) => {
        let resources = getSafeProperty(response, (obj) => obj.collection);
        return resources.filter((resource) => getSafeProperty(resource, (obj) => obj.serviceId))
          .map((resource) => {
            return {
              name: `${serviceTypeText[resource.serviceType]} VDC (${resource.name})`,
              serviceId: resource.name
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to servers services
   */
  private _subscribeToServerServices(): void {
    this.serverServices$ = this._apiService.getServers().pipe(
      map((response) => {
        let servers = getSafeProperty(response, (obj) => obj.collection);
        return servers.filter((server) => getSafeProperty(server, (obj) => obj.serviceId))
          .map((server) => {
            return {
              name: `${server.name} (${server.serviceId})`,
              serviceId: server.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to firewall services
   */
  private _subscribeToFirewallServices(): void {
    this.firewallServices$ = this._apiService.getFirewalls().pipe(
      map((response) => {
        let firewalls = getSafeProperty(response, (obj) => obj.collection);
        return firewalls.filter((firewall) => getSafeProperty(firewall, (obj) => obj.serviceId))
          .map((firewall) => {
            return {
              name: `${firewall.managementName} (${firewall.serviceId})`,
              serviceId: firewall.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to internet port services
   */
  private _subscribeToInternetPortServices(): void {
    this.internetPortServices$ = this._apiService.getInternetPorts().pipe(
      map((response) => {
        let internetPorts = getSafeProperty(response, (obj) => obj.collection);
        return internetPorts.filter((internetPort) => getSafeProperty(internetPort, (obj) => obj.serviceId))
          .map((internetPort) => {
            return {
              name: `${internetPort.description} (${internetPort.serviceId})`,
              serviceId: internetPort.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to backup aggregation target services
   */
  private _subscribeToBatServices(): void {
    this.batServices$ = this._apiService.getBackupAggregationTargets().pipe(
      map((response) => {
        let bats = getSafeProperty(response, (obj) => obj.collection);
        return bats.filter((bat) => getSafeProperty(bat, (obj) => obj.serviceId))
          .map((bat) => {
            return {
              name: `${bat.description} (${bat.serviceId})`,
              serviceId: bat.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to Smac Shared Form Config
   */
  private _subscribeToSmacSharedFormConfig(): void {
    this.smacSharedFormConfig$ = this._apiService.getAccount().pipe(
      map((response) => {
        let smacSharedFormConfig = new SmacSharedFormConfig(this._injector);
        response.phoneNumber = formatStringToPhoneNumber(response.phoneNumber);
        smacSharedFormConfig.contactConfig.phoneNumber = response.phoneNumber;
        smacSharedFormConfig.notesConfig.label = this.translateService.instant('orderServiceCustomChange.requestDetails.additionalNotes.label');
        return smacSharedFormConfig;
      })
    );
  }
}
