import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Injector,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import {
  Subject,
  Observable,
  Subscription,
  of
} from 'rxjs';
import {
  shareReplay,
  takeUntil,
  switchMap
} from 'rxjs/operators';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  McsOrderWizardBase,
  CoreValidators,
  OrderRequester
} from '@app/core';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition,
  Guid,
  createObject
} from '@app/utilities';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import {
  McsServer,
  InviewLevel,
  OrderIdType,
  McsOrderWorkflow,
  inviewLevelText,
  McsOrderCreate,
  McsOrderItemCreate
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { OrderDetails } from '@app/features-shared';
import { ServiceInviewRaiseService } from './service-inview-raise.service';

type RaiseInviewLevelProperties = {
  inviewLevel: string;
};

interface ServiceGroup {
  servers: McsServer[];
  resourceName: string;
}

const SERVICE_RAISE_INVIEW_REF_ID = Guid.newGuid().toString();
const RESOURCE_NAME_OTHER = 'Others';

@Component({
  selector: 'mcs-order-service-inview-raise',
  templateUrl: 'service-inview-raise.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServiceInviewRaiseService]
})

export class ServiceInviewRaiseComponent extends McsOrderWizardBase implements OnDestroy {

  public managedServers$: Observable<ServiceGroup[]>;
  public fgServiceInviewDetails: FormGroup;
  public fcService: FormControl;

  /**
   * Returns the back icon key as string
   */
  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Returns true if Inview level is either Premium or Standard
   */
  public get isRaiseInviewButtonShown(): boolean {
    return this._inviewLevel === InviewLevel.Standard || this._inviewLevel === InviewLevel.Premium;
  }

  /**
   * Returns true if the Inview is valid for Ordering, false Otherwise
   */
  public get validOrderInviewLevel(): boolean {
    return this._inviewLevel === InviewLevel.Standard;
  }

  /**
   * Returns true when the form is valid
   */
  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  @ViewChild(McsFormGroupDirective, { static: false })
  private _formGroup: McsFormGroupDirective;

  private _inviewLevel: InviewLevel = InviewLevel.None;
  private _selectedServerHandler: Subscription;
  private _destroySubject = new Subject<void>();
  private _inviewLevelLabelMap: Map<InviewLevel, string>;

  constructor(
    _injector: Injector,
    private _serviceInviewRaiseService: ServiceInviewRaiseService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    super(_injector, _serviceInviewRaiseService);
    this._populateInviewLevelLabelMap();
    this._registerFormGroups();
    this._registerEvents();
    this._getAllServices();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._selectedServerHandler);
  }

  /**
   * Event listener whenever service is change
   */
  public onChangeService(server: McsServer): void {
    this._inviewLevel = this._getServerInviewLevel(server);
  }

  /**
   * Event that emits when the raise inview details is submitted
   */
  public onSubmitServiceInviewDetails(server: McsServer): void {
    if (!this.validOrderInviewLevel) { return; }

    this._serviceInviewRaiseService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.RaiseInviewLevel,
            referenceId: SERVICE_RAISE_INVIEW_REF_ID,
            properties: {
              inviewLevel: inviewLevelText[InviewLevel.Premium]
            } as RaiseInviewLevelProperties,
            serviceId: server.serviceId
          })
        ]
      })
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the server confirm order has been changed
   * @param orderDetails Order details to be set
   */
  public onServiceInviewRaiseConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._serviceInviewRaiseService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._serviceInviewRaiseService.submitOrderRequest();
  }

  /**
   * Event that emits when the order is submitted
   * @param submitDetails order details
   * @param selectedServiceId id of current service selected
   */
  public onSubmitOrder(submitDetails: OrderDetails, selectedServiceId: string): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: selectedServiceId
    };

    this.submitOrderWorkflow(workflow);
  }

  /**
   * Returns a specifc label based on inview level
   */
  public inviewLevelLabel(server: McsServer): string {
    if (getSafeProperty(server, (obj) => !obj.serviceChangeAvailable, false)) {
      return this.translateService.instant('orderServiceRaiseInview.serviceDetails.inview.label.unavailable');
    }

    return this._inviewLevelLabelMap.get(this._inviewLevel);
  }

  /**
   * Returns a specifc dropdown label based on inview level
   */
  public inviewLevelDropdownLabel(server: McsServer): string {
    if (getSafeProperty(server, (obj) => !obj.serviceChangeAvailable, false)) {
      return this.translateService.instant('orderServiceRaiseInview.serviceDetails.inview.dropdownLabel.unavailable');
    }

    return getSafeProperty(server, (obj) => obj.inviewLevelLabel, inviewLevelText[InviewLevel.None]);
  }


  /**
   * Register jobs/notifications events
   */
  private _registerEvents(): void {
    this._selectedServerHandler = this._eventDispatcher.addEventListener(
      McsEvent.serverRaiseInviewSelected, this._onSelectedServer.bind(this));

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.serverRaiseInviewSelected);
  }

  /**
   * Get all the Services
   */
  private _getAllServices(): void {
    // Managed servers for now, but eventually all Services
    this.managedServers$ = this._apiService.getServers().pipe(
      switchMap((response) => of(this._createServerArray(response && response.collection))),
      shareReplay(1)
    );
  }

  /**
   * Returns an array of servers
   */
  private _createServerArray(servers: McsServer[]): ServiceGroup[] {
    if (isNullOrEmpty(servers)) { return; }
    let serversGroupArray: ServiceGroup[] = [];

    servers.forEach((server) => {
      if (server.isSelfManaged || server.isDedicated) { return; }
      let currentResourceName = server.resourceName || RESOURCE_NAME_OTHER;
      let groupedServer: ServiceGroup;

      let existingServerGroup = serversGroupArray.find(
        (serverGroup) => currentResourceName === serverGroup.resourceName
      );
      groupedServer = isNullOrEmpty(existingServerGroup) ?
        { resourceName: currentResourceName, servers: [] } as ServiceGroup
        : existingServerGroup;

      groupedServer.servers.push(server);
      if (!existingServerGroup) {
        serversGroupArray.push(groupedServer);
      }
    });

    return serversGroupArray.sort(this._sortByResourceName);
  }

  /**
   * Register all form groups
   */
  private _registerFormGroups() {
    this.fgServiceInviewDetails = this._formBuilder.group([]);
    this.fcService = new FormControl('', [CoreValidators.required]);

    this.fgServiceInviewDetails = new FormGroup({
      fcService: this.fcService
    });

    this.fgServiceInviewDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe();
  }

  /**
   * Fill out inview level label map based on the type of Inview Level
   */
  private _populateInviewLevelLabelMap(): void {
    this._inviewLevelLabelMap = new Map();
    this._inviewLevelLabelMap.set(
      InviewLevel.None,
      this.translateService.instant('orderServiceRaiseInview.serviceDetails.inview.label.none')
    );
    this._inviewLevelLabelMap.set(
      InviewLevel.Standard,
      this.translateService.instant('orderServiceRaiseInview.serviceDetails.inview.label.standard')
    );
    this._inviewLevelLabelMap.set(
      InviewLevel.Premium,
      this.translateService.instant('orderServiceRaiseInview.serviceDetails.inview.label.premium')
    );
  }

  /**
   * Event listener whenever a server is selected
   */
  private _onSelectedServer(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this.fcService.setValue(server);
  }

  /**
   * Get the inview level from a Server
   */
  private _getServerInviewLevel(server: McsServer): InviewLevel {
    return getSafeProperty(server, (obj) => obj.inViewLevel, InviewLevel.None);
  }

  /**
   * Method comparator for sorting server group by resource name
   * Returns -1 if resourceName A is less than resourceName B
   * Returns 1 if resourceName B is less than resourceName A
   * Returns 0 resourceName A and resourceName B are equal
   */
  private _sortByResourceName(serverA, serverB): number {
    let resourceNameA = serverA.resourceName.toLowerCase();
    let resourceNameB = serverB.resourceName.toLowerCase();

    if (resourceNameA < resourceNameB) { return -1; }
    if (resourceNameA > resourceNameB) { return 1; }
    return 0;
  }
}
