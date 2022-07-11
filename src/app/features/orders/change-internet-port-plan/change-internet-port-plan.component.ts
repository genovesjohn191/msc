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
  McsFormGroupService,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  InternetManagePortPlan,
  OrderDetails
} from '@app/features-shared';
import {
  HttpStatusCode,
  InternetPlan,
  McsInternetPort,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  OrderIdType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ComponentHandlerDirective,
  McsFormGroupDirective
} from '@app/shared';
import {
  convertMbitToGbit,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ChangeInternetPortPlanService } from './change-internet-port-plan.service';

type InternetPortPlanProperties = {
  monthlyCapMB?: number;
  portSpeed?: string;
};

const CHANGE_INTERNET_PORT_REF_ID = Guid.newGuid().toString()

@Component({
  selector: 'mcs-order-change-internet-port-plan',
  templateUrl: 'change-internet-port-plan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ChangeInternetPortPlanService]
})

export class ChangeInternetPortPlanComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public internetPorts$: Observable<McsInternetPort[]>;
  public internetPort$: Observable<McsInternetPort>;

  public fgInternetPlanDetails: FormGroup<any>;
  public fcInternetPort: FormControl<McsInternetPort>;
  public fcMonthlyCap: FormControl<any>;
  public fcPortSpeed: FormControl<any>;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  @ViewChild('fgInternetManagePortPlan')
  private _fgInternetManagePortPlan: IMcsFormGroup;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  private _internetManagePortPlan: InternetManagePortPlan;
  private _destroySubject = new Subject<void>();
  private _selectedInternetResourceHandler: Subscription;
  private _errorStatus: number;
  private _internetCount: number;

  constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _changeInternetPortPlanService: ChangeInternetPortPlanService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _formGroupService: McsFormGroupService,
    private _translate: TranslateService,
  ) {
    super(
      _changeInternetPortPlanService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'change-internet-plan-go-to-provisioning-step',
          action: 'next-button'
        }
      });
      this._registerFormGroup();
      this._registerEvents();
      this._internetManagePortPlan = new InternetManagePortPlan();
  }

  public ngOnInit() {
    this._getAllInternetPorts();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._selectedInternetResourceHandler);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._internetCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid()) && this._internetManagePortPlan?.hasChanged;
  }

  public internetPortToolTipText(internetPort: McsInternetPort): string {
    if (internetPort.plan === InternetPlan.NinetyFifthPercentile) {
      return this._translate.instant('changeInternetPortPlan.internetIsInvalid.plan')
    } else if (!isNullOrEmpty(internetPort.primaryPort)) {
      return this._translate.instant('changeInternetPortPlan.internetIsInvalid.primaryPort')
    } else {
      return this._translate.instant('changeInternetPortPlan.internetIsInvalid.serviceChangeAvailable')
    }
  }

  /**
   * Event that emits when the internet service id is changed
   * @param internet current internet service selected
   */
  public onChangeInternetPort(internet: McsInternetPort): void {
    if (isNullOrEmpty(internet)) { return; }
    this.internetPort$ = this._apiService.getInternetPort(internet.id);
    this._resetInternetPortPlanState();
  }

  /**
   * Returns the selected internet monthly cap
   */
  public selectedInternetMonthlyCap(internetPort: McsInternetPort): number {
    return getSafeProperty(internetPort, (obj) => obj.monthlyCapMB, 0);
  }

  /**
   * Returns the selected internet port speed
   */
  public selectedInternetPortSpeed(internetPort: McsInternetPort): number {
    return getSafeProperty(internetPort, (obj) => obj.portSpeedMbps, 0);
  }

  /**
   * Event that emits when data in internet manage port plan component has been changed
   */
  public onPortPlanChanged(internetManagePortPlan: InternetManagePortPlan, internet: McsInternetPort): void {
    if (isNullOrEmpty(internetManagePortPlan) || !internetManagePortPlan.hasChanged) { return; }

    this._internetManagePortPlan = internetManagePortPlan;
    let convertedPortSpeedValue = this.setPortSpeedValue(internetManagePortPlan.portSpeed);

    this._changeInternetPortPlanService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.ChangeInternetPortPlan,
            referenceId: CHANGE_INTERNET_PORT_REF_ID,
            properties: {
              portSpeed: convertedPortSpeedValue,
              monthlyCapMB: internetManagePortPlan.monthlyCap
            } as InternetPortPlanProperties,
            serviceId: internet.serviceId
          })
        ]
      })
    );
  }

  public selectedInternetIsValid(internet: McsInternetPort): boolean {
    return internet.serviceChangeAvailable &&
          internet.plan !== InternetPlan.NinetyFifthPercentile &&
          isNullOrEmpty(internet.primaryPort);
  }

  public isPlanNinetyFifthPercentile(plan: number): boolean {
    return plan === InternetPlan.NinetyFifthPercentile;
  }

  public isPrimaryPortNotNull(primaryPort): boolean {
    return !isNullOrEmpty(primaryPort);
  }

  /**
   * Event that emits when the change internet port plan details is submitted
   */
  public onSubmitPortPlanDetails(): void {
    if (isNullOrEmpty(this._internetManagePortPlan)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the internet confirm order has been changed
   * @param orderDetails Order details to be set
   */
  public onInternetConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._changeInternetPortPlanService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._changeInternetPortPlanService.submitOrderRequest();
  }

  /**
   * Event that emits when data in submitted from the wizard
   * @param submitDetails order details
   */
  public onSubmitOrder(submitDetails: OrderDetails, internetServiceId: string): void {
    if (!this._validateFormFields() && isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: internetServiceId
    };

    this.submitOrderWorkflow(workflow);
  }

  private setPortSpeedValue(portSpeed: number): string {
    const portSpeedOneGbit = 1000;
    if (portSpeed >= portSpeedOneGbit) {
      let portSpeedinGB = convertMbitToGbit(portSpeed);
      return `${portSpeedinGB}Gbps`;
    }

    return `${portSpeed}Mbps`;
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
    this._formGroupService.touchAllFormFields(this.fgInternetPlanDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  private _resetInternetPortPlanState(): void {
    if (!isNullOrEmpty(this._componentHandler)) {
      this._internetManagePortPlan.hasChanged = false;
      this._componentHandler.recreateComponent();
    }
  }

  /**
   * Get all the available internet resources
   */
  private _getAllInternetPorts(): void {
    this.internetPorts$ = this._apiService.getInternetPorts()
    .pipe(
    map((response) => {
      let internetPorts = getSafeProperty(response, (obj) => obj.collection);
      this._internetCount = internetPorts?.length;
      return internetPorts;
    }),
    catchError((error) => {
      this._errorStatus = error?.details?.status;
      return throwError(error);
    }),
    shareReplay(1)
    );
  }

  /**
   * Register form group elements
   */
  private _registerFormGroup() {
    this.fcInternetPort = new FormControl<McsInternetPort>(null, [CoreValidators.required]);

    this.fgInternetPlanDetails = new FormGroup<any>({
      fcInternetPort: this.fcInternetPort
    });

    // Check and Register Nested Form Group
    if (!isNullOrEmpty(this._fgInternetManagePortPlan)) {
      this.fgInternetPlanDetails.removeControl('fgInternetManagePortPlan');
      this.fgInternetPlanDetails.addControl('fgInternetManagePortPlan',
        this._fgInternetManagePortPlan.getFormGroup().formGroup);
    }

    this.fgInternetPlanDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe();
  }

  private _registerEvents(): void {
    this._selectedInternetResourceHandler = this._eventDispatcher.addEventListener(
      McsEvent.internetChangePortPlanSelectedEvent, this._onSelectedInternetPort.bind(this));

    this._eventDispatcher.dispatch(McsEvent.internetChangePortPlanSelectedEvent);
  }

  /**
   * Event listener when an internet port is selected
   */
  private _onSelectedInternetPort(resource: McsInternetPort): void {
    if (isNullOrEmpty(resource)) { return; }
    this.fcInternetPort.setValue(resource);
  }
}
