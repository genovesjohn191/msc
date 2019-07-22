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
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil
} from 'rxjs/operators';
import {
  McsOrderWizardBase,
  CoreDefinition,
  CoreValidators,
  McsGuid,
  CoreRoutes
} from '@app/core';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';
import {
  McsServer,
  InviewLevel,
  OrderIdType,
  McsOrderWorkflow,
  RouteKey,
  inviewLevelText
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { OrderDetails } from '@app/features-shared';
import { ServiceInviewRaiseService } from './service-inview-raise.service';

type RaiseInviewLevelProperties = {
  inviewLevel: string;
};

const SERVICE_RAISE_INVIEW_REF_ID = McsGuid.newGuid().toString();

@Component({
  selector: 'mcs-order-service-inview-raise',
  templateUrl: 'service-inview-raise.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServiceInviewRaiseService]
})

export class ServiceInviewRaiseComponent extends McsOrderWizardBase implements OnDestroy {

  public services$: Observable<McsServer[]>;
  public fgServiceInviewDetails: FormGroup;
  public fcService: FormControl;

  /**
   * Returns the back icon key as string
   */
  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Returns a specifc label based on inview level
   */
  public get inviewLevelLabel(): string {
    return this._inviewLevelLabelMap.get(this._inviewLevel);
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
   * Returns the currently selected server
   */
  public get currentServer(): McsServer {
    return getSafeProperty(this.fcService, (obj) => obj.value);
  }

  /**
   * Returns true when the form is valid
   */
  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid()) && this._inviewLevel === InviewLevel.Standard;
  }

  @ViewChild(McsFormGroupDirective)
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
      {
        items: [{
          itemOrderType: OrderIdType.RaiseInviewLevel,
          referenceId: SERVICE_RAISE_INVIEW_REF_ID,
          properties: {
            inviewLevel: inviewLevelText[InviewLevel.Premium]
          } as RaiseInviewLevelProperties,
          serviceId: server.serviceId
        }]
      }
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the server confirm order has been changed
   * @param orderDetails Order details to be set
   */
  public onServiceInviewRaiseConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._serviceInviewRaiseService.createOrUpdateOrder({
      contractDurationMonths: orderDetails.contractDurationMonths,
      description: orderDetails.description,
      billingEntityId: orderDetails.billingEntityId,
      billingSiteId: orderDetails.billingSiteId,
      billingCostCentreId: orderDetails.billingCostCentreId
    });
  }

  /**
   * Event that emits when the order is submitted
   * @param submitDetails order details
   */
  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourcePath: CoreRoutes.getNavigationPath(RouteKey.ServerDetails),
      resourceDescription: this.progressDescription
    };

    this.submitOrderWorkflow(workflow);
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
    this.services$ = this._apiService.getServers().pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection).filter(
        (server) => !server.isSelfManaged && !server.isDedicated && server.serviceChangeAvailable)
      ),
      shareReplay(1)
    );
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

}
