import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  OnDestroy,
  Injector
} from '@angular/core';
import {
  CoreDefinition,
  McsOrderWizardBase,
  McsFormGroupService,
  IMcsFormGroup,
  CoreValidators,
  McsGuid,
  OrderRequester
} from '@app/core';
import {
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  isNullOrEmpty,
  getSafeProperty,
  unsubscribeSafely,
  convertGbToMb,
  convertMbToGb
} from '@app/utilities';
import {
  map,
  tap,
  takeUntil,
  shareReplay
} from 'rxjs/operators';
import {
  McsResource,
  McsServer,
  McsOrderWorkflow,
  OrderIdType,
  McsServerCompute
} from '@app/models';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  OrderDetails,
  ServerManageScale
} from '@app/features-shared';
import {
  FormBuilder,
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  McsFormGroupDirective,
  ComponentHandlerDirective
} from '@app/shared';
import { McsEvent } from '@app/events';
import { ServerManagedScaleService } from './server-managed-scale.service';

type ScaleManageProperties = {
  cpuCount: number;
  memoryMB: number;
};

const SCALE_MANAGE_SERVER_REF_ID = McsGuid.newGuid().toString();

@Component({
  selector: 'mcs-order-server-managed-scale',
  templateUrl: 'server-managed-scale.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServerManagedScaleService]
})

export class ServerManagedScaleComponent extends McsOrderWizardBase implements OnDestroy {

  public resources$: Observable<Map<string, McsServer[]>>;
  public resource$: Observable<McsResource>;

  public fgServerManagedScaleDetails: FormGroup;
  public fcManageServer: FormControl;

  @ViewChild('fgManageScale')
  private _fgManageScale: IMcsFormGroup;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  private _manageScale: ServerManageScale;
  private _destroySubject = new Subject<void>();
  private _selectedServerHandler: Subscription;
  private _resourcesDataChangeHandler: Subscription;

  constructor(
    _injector: Injector,
    private _elementRef: ElementRef,
    private _formBuilder: FormBuilder,
    private _formGroupService: McsFormGroupService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _apiService: McsApiService,
    private _scaleManagedServerService: ServerManagedScaleService
  ) {
    super(_injector, _scaleManagedServerService);
    this._registerFormGroups();
    this._registerEvents();
    this._manageScale = new ServerManageScale();
    this._getAllManagedCloudServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._selectedServerHandler);
    unsubscribeSafely(this._resourcesDataChangeHandler);
  }

  /**
   * Returns the back icon key as string
   */
  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Returns the minimum memory in GB
   */
  public get minimumMemoryGB(): number {
    return convertMbToGb(getSafeProperty(this.fcManageServer.value as McsServer, (obj) => obj.compute.memoryMB, 2));
  }

  /**
   * Returns the minimum cpu count
   */
  public get minimumCpu(): number {
    return getSafeProperty(this.fcManageServer.value as McsServer, (obj) => obj.compute.cpuCount, 2);
  }

  /**
   * Returns true when all forms are valid
   */
  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid()) && this._manageScale.hasChanged;
  }

  /**
   * Returns the compute of the selected server
   */
  public get selectedServerCompute(): McsServerCompute {
    if (isNullOrEmpty(this.fcManageServer.value)) { return; }
    let selectedServer = this.fcManageServer.value as McsServer;
    return selectedServer.compute;
  }

  /**
   * Event that emits whenever a resource is selected
   * @param server selected server
   */
  public onChangeServer(server: McsServer): void {
    if (isNullOrEmpty(server) || isNullOrEmpty(server.serviceId)) { return; }
    this._resetScaleManagedServerState();
    this._subscribeResourceById(server.platform.resourceId);
  }

  /**
   * Event that emits when data in scale component has been changed
   * @param manageScale Manage Scale content
   * @param server current server selected
   */
  public onScaleChanged(manageScale: ServerManageScale, server: McsServer): void {
    if (isNullOrEmpty(manageScale) ||
      !manageScale.hasChanged ||
      isNullOrEmpty(getSafeProperty(server, (obj) => obj.serviceId))) { return; }

    this._manageScale = manageScale;
    this._scaleManagedServerService.createOrUpdateOrder(
      {
        items: [{
          itemOrderType: OrderIdType.ScaleManageServer,
          referenceId: SCALE_MANAGE_SERVER_REF_ID,
          properties: {
            cpuCount: manageScale.cpuCount,
            memoryMB: convertGbToMb(manageScale.memoryGB)
          } as ScaleManageProperties,
          serviceId: server.serviceId
        }]
      }
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the scale details is submitted
   */
  public onSubmitScaleDetails(): void {
    if (isNullOrEmpty(this._manageScale)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when data in scale component has been changed
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
   * Event that emits when the server confirm order has been changed
   * @param orderDetails Order details to be set
   */
  public onServerConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._scaleManagedServerService.createOrUpdateOrder({
      contractDurationMonths: orderDetails.contractDurationMonths,
      description: orderDetails.description,
      billingEntityId: orderDetails.billingEntityId,
      billingSiteId: orderDetails.billingSiteId,
      billingCostCentreId: orderDetails.billingCostCentreId
    }, OrderRequester.Billing);
  }

  /**
   * Gets all the server and filters out the manage cloud server
   */
  private _getAllManagedCloudServers(): void {

    let resourceMap: Map<string, McsServer[]> = new Map();
    this.resources$ = this._apiService.getServers().pipe(
      map((servers) => {
        servers.collection.filter(
          (server) => !server.isSelfManaged && !server.isDedicated && server.serviceChangeAvailable
        ).forEach((server) => {
          let resourceIsExisting = resourceMap.has(server.platform.resourceName);
          if (resourceIsExisting) {
            resourceMap.get(server.platform.resourceName).push(server);
            return;
          }
          resourceMap.set(server.platform.resourceName, [server]);
        });
        return resourceMap;
      }),
      tap(() => {
        this._eventDispatcher.dispatch(McsEvent.serverScaleManageSelected);
        this._changeDetectorRef.markForCheck();
      })
    );
  }

  /**
   * Gets the resource based on ID provided
   * @param resourceId Resource Id of the resource to get
   */
  private _subscribeResourceById(resourceId: string): void {
    this.resource$ = this._apiService.getResource(resourceId).pipe(
      tap(() => this._changeDetectorRef.markForCheck()),
      shareReplay(1)
    );
  }

  /**
   * Register jobs/notifications events
   */
  private _registerEvents(): void {
    this._resourcesDataChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.dataChangeResources, () => this._changeDetectorRef.markForCheck());

    this._selectedServerHandler = this._eventDispatcher.addEventListener(
      McsEvent.serverScaleManageSelected, this._onSelectedScaleManagedServer.bind(this));

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.serverScaleManageSelected);
  }

  /**
   * Resets the scale managed server state
   */
  private _resetScaleManagedServerState(): void {
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
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
    this._formGroupService.touchAllFormFields(this.fgServerManagedScaleDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  /**
   * Event listener whenever a manage server is selected
   */
  private _onSelectedScaleManagedServer(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this.fcManageServer.setValue(server);
  }

  /**
   * Register all form groups
   */
  private _registerFormGroups() {
    this.fgServerManagedScaleDetails = this._formBuilder.group([]);
    this.fcManageServer = new FormControl('', [CoreValidators.required]);

    this.fgServerManagedScaleDetails = new FormGroup({
      fcManageServer: this.fcManageServer
    });

    if (!isNullOrEmpty(this._fgManageScale)) {
      this.fgServerManagedScaleDetails.addControl('fgManageScale',
        this._fgManageScale.getFormGroup().formGroup);
    }
    this.fgServerManagedScaleDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe();
  }
}
