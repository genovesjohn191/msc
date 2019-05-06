import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  CoreDefinition,
  McsErrorHandlerService,
  McsOrderWizardBase,
  CoreRoutes,
  McsFormGroupService,
  IMcsFormGroup,
  CoreValidators,
  McsGuid,
  CoreEvent,
  McsNavigationService
} from '@app/core';
import {
  throwError,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  isNullOrEmpty,
  getSafeProperty,
  unsubscribeSafely,
  convertGbToMb
} from '@app/utilities';
import {
  catchError,
  map,
  tap,
  takeUntil,
  shareReplay
} from 'rxjs/operators';
import {
  McsResource,
  McsServer,
  McsOrderWorkflow,
  RouteKey,
  OrderIdType,
  McsServerCompute
} from '@app/models';
import {
  McsResourcesRepository,
  McsServersRepository
} from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
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
import { ScaleManagedServerService } from './scale-managed-server.service';

type ScaleManageProperties = {
  cpuCount: number;
  memoryMB: number;
};

const SCALE_MANAGE_SERVER_REF_ID = McsGuid.newGuid().toString();
@Component({
  selector: 'mcs-scale-managed-server',
  templateUrl: 'scale-managed-server.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ScaleManagedServerService]
})

export class ScaleManagedServerComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public resources$: Observable<Map<string, McsServer[]>>;
  public resource$: Observable<McsResource>;

  public fgScaleManageServerDetails: FormGroup;
  public fcManageServer: FormControl;

  @ViewChild('fgManageScale')
  private _fgManageScale: IMcsFormGroup;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  private _manageScale: ServerManageScale;
  private _destroySubject = new Subject<void>();
  private _selectedServerIdHandler: Subscription;

  constructor(
    _navigationService: McsNavigationService,
    private _elementRef: ElementRef,
    private _formBuilder: FormBuilder,
    private _formGroupService: McsFormGroupService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _resourcesRepository: McsResourcesRepository,
    private _serversRepository: McsServersRepository,
    private _errorHandlerService: McsErrorHandlerService,
    private _scaleManagedServerService: ScaleManagedServerService
  ) {
    super(_navigationService, _scaleManagedServerService);
    this._registerFormGroups();
    this._registerEvents();
    this._manageScale = new ServerManageScale();
    this._getAllManagedCloudServers();
  }

  public ngOnInit() {
    this._subscribeToResourceDataChange();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._selectedServerIdHandler);
  }

  /**
   * Returns the back icon key as string
   */
  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
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
        description: this._scaleManagedServerService.createDefaultOrderDescription('Change', 'Scale Managed Server'),
        contractDurationMonths: 12,
        items: [{
          itemOrderTypeId: OrderIdType.ScaleManageServer,
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
   * @param manageScale Manage Scale content
   */
  public onSubmitScaleDetails(manageScale: ServerManageScale): void {
    if (isNullOrEmpty(manageScale)) { return; }
    this._manageScale = manageScale;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when data in scale component has been changed
   * @param submitDetails order details
   */
  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (!this._validateFormFields()) { return; }
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = {
      state: submitDetails.workflowAction,
      clientReferenceObject: {
        resourcePath: CoreRoutes.getNavigationPath(RouteKey.ServerDetails)
      }
    } as McsOrderWorkflow;
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
      billingSiteId: orderDetails.billingSite.id,
      billingCostCentreId: orderDetails.billingCostCentre.id
    });
  }

  /**
   * Gets all the server and filters out the manage cloud server
   */
  private _getAllManagedCloudServers(): void {

    let resourceMap: Map<string, McsServer[]> = new Map();
    this.resources$ = this._serversRepository.getAll().pipe(
      map((servers) => {
        servers.filter((server) => !server.isSelfManaged && !server.isDedicated)
          .forEach((server) => {
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
        this._eventDispatcher.dispatch(CoreEvent.serverScaleManageSelected);
        this._changeDetectorRef.markForCheck();
      }),
      catchError((error) => {
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      })
    );
  }

  /**
   * Gets the resource based on ID provided
   * @param resourceId Resource Id of the resource to get
   */
  private _subscribeResourceById(resourceId: string): void {
    this._eventDispatcher.dispatch(CoreEvent.loaderShow);
    this.resource$ = this._resourcesRepository.getByIdAsync(resourceId,
      () => this._eventDispatcher.dispatch(CoreEvent.loaderHide)
    ).pipe(
      tap(() => {
        this._changeDetectorRef.markForCheck();
      }),
      shareReplay(1)
    );
  }

  /**
   * Register jobs/notifications events
   */
  private _registerEvents(): void {
    this._selectedServerIdHandler = this._eventDispatcher.addEventListener(
      CoreEvent.serverScaleManageSelected, this._onSelectedScaleManageServerId.bind(this));

    // Invoke the event initially
    this._eventDispatcher.dispatch(CoreEvent.serverScaleManageSelected);
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
    this._formGroupService.touchAllFormFields(this.fgScaleManageServerDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  /**
   * Event listener whenever a manage server is selected
   */
  private _onSelectedScaleManageServerId(id: string): void {
    if (isNullOrEmpty(id)) { return; }

    let selectedServer: McsServer;
    this._serversRepository.getBy((item) => item.id === id).subscribe((server) => {
      selectedServer = server;
    });

    this.fcManageServer.setValue(selectedServer);
  }

  /**
   * Register all form groups
   */
  private _registerFormGroups() {
    this.fgScaleManageServerDetails = this._formBuilder.group([]);
    this.fcManageServer = new FormControl('', [CoreValidators.required]);

    this.fgScaleManageServerDetails = new FormGroup({
      fcManageServer: this.fcManageServer
    });

    if (!isNullOrEmpty(this._fgManageScale)) {
      this.fgScaleManageServerDetails.addControl('fgManageScale',
        this._fgManageScale.getFormGroup().formGroup);
    }
    this.fgScaleManageServerDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe();
  }

  /**
   * Subscribes to resource data changes and update the DOM
   */
  private _subscribeToResourceDataChange(): void {
    this._resourcesRepository.dataChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
