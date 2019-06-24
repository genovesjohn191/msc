import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  Injector
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { FormControl } from '@angular/forms';
import {
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  tap,
  takeUntil,
  map
} from 'rxjs/operators';
import {
  CoreDefinition,
  CoreRoutes,
  McsOrderWizardBase,
  IMcsNavigateAwayGuard,
  CoreValidators
} from '@app/core';
import {
  ServiceType,
  RouteKey,
  McsResource,
  McsOrderWorkflow,
  OrderWorkflowAction,
  Os
} from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import { OrderDetails } from '@app/features-shared';
import { ServerCreateDetailsComponent } from './details/server-create-details.component';
import { ServerCreateService } from './server-create.service';
import { ServerCreateDetailsBase } from './details/server-create-details.base';
import { AddOnDetails } from './addons/addons-model';
import { ServerCreateBuilder } from './server-create.builder';
import { ServersService } from '../servers.service';

@Component({
  selector: 'mcs-server-create',
  templateUrl: 'server-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServerCreateService]
})

export class ServerCreateComponent extends McsOrderWizardBase
  implements OnInit, OnDestroy, IMcsNavigateAwayGuard {

  // Other variables
  public resources$: Observable<McsResource[]>;
  public resource$: Observable<McsResource>;
  public waitingForProvision: boolean = true;
  public selectedServerId: string;
  public fcResource: FormControl;

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get serviceTypeEnum() { return ServiceType; }

  /**
   * Returns the resources list
   */
  public get resources(): McsResource[] { return this._resources; }
  private _resources: McsResource[];

  @ViewChild('serverDetailsStep')
  private _detailsStep: ServerCreateDetailsComponent;
  private _serverCreateBuilder: ServerCreateBuilder<any>;

  private _destroySubject = new Subject<void>();

  constructor(
    _injector: Injector,
    _serverCreateService: ServerCreateService,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
    private _apiService: McsApiService,
    private _serversService: ServersService
  ) {
    super(_injector, _serverCreateService);
    this._serverCreateBuilder = new ServerCreateBuilder(_serverCreateService);
  }

  public ngOnInit() {
    this._registerFormGroup();
    this._subscribeToAllResources();
    this._setInitialTabViewByParam();
  }

  public ngOnDestroy() {
    super.dispose();
  }

  /**
   * Returns true when the server to create is windows
   */
  public get serverCreationOsType(): Os {
    return getSafeProperty(this._serverCreateBuilder, (obj) => obj.osType);
  }

  /**
   * Returns the resource displayed text based on resource data
   * @param resource Resource to be displayed
   */
  public getResourceDisplayedText(resource: McsResource): string {
    let prefix = this._translate.instant('serverCreate.vdcDropdownList.prefix', {
      service_type: resource.serviceTypeLabel,
      zone: resource.availabilityZone
    });
    return `${prefix} ${resource.name}`;
  }

  /**
   * Event that emits when navigating away from create server page to other route
   */
  public canNavigateAway(): boolean {
    return this.getActiveWizardStep().isLastStep ||
      getSafeProperty(this._detailsStep, (obj) => obj.canNavigateAway(), true);
  }

  /**
   * Event that emits whenever a resource is selected
   */
  public onChangeResource(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this._subscribeResourceById(resource.id);

    this._serverCreateBuilder.setServiceType(resource.serviceType);
    this._serverCreateBuilder.isSelfManaged ?
      this.pricingCalculator.hideWidget() :
      this.pricingCalculator.showWidget();
  }

  /**
   * Event that emits when the server details has been changed
   * @param resource Resource on where to create the server
   * @param serverDetails Server details to be created
   */
  public onServerDetailsChange<T>(serverDetails: Array<ServerCreateDetailsBase<T>>): void {
    if (isNullOrEmpty(serverDetails)) { return; }

    if (this._serverCreateBuilder.isSelfManaged) { return; }
    this._createServer(serverDetails);
  }

  /**
   * Event that emits whe nthe server details have been submitted
   * @param resource Resource on where to create the server
   * @param serverDetails Server details to be created
   */
  public onServerDetailsSubmit<T>(serverDetails: Array<ServerCreateDetailsBase<T>>): void {
    this._createServer(serverDetails);
  }

  /**
   * Event that emits when the add ons have been changed
   * @param addOns Add on details to be submitted
   */
  public onServerAddOnChange(addOns: Array<AddOnDetails<any>>): void {
    this._serverCreateBuilder.setAddOns(...addOns);
  }

  /**
   * Event that emits when the server confirm order has been changed
   * @param orderDetails Order details to be set
   */
  public onServerConfirmOrderChange(orderDetails: OrderDetails): void {
    this._serverCreateBuilder.setOrderDetails(orderDetails);
  }

  /**
   * Event that emits when the order have been submitted
   * @param submitDetails Submit details of the order
   */
  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }
    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourcePath: CoreRoutes.getNavigationPath(RouteKey.ServerDetails),
      resourceDescription: this.progressDescription
    };

    this.waitingForProvision = submitDetails.workflowAction === OrderWorkflowAction.Submitted;
    this.submitOrderWorkflow(workflow);
  }

  /**
   * Registers all the form controls
   */
  private _registerFormGroup(): void {
    this.fcResource = new FormControl('', [CoreValidators.required]);
  }

  /**
   * Creates the managed/self-managed server according to factory instance
   * @param resource Resource on where to create the server
   * @param serverDetails Server details to be created
   */
  private _createServer<T>(serverDetails: Array<ServerCreateDetailsBase<T>>): void {
    if (isNullOrEmpty(serverDetails)) { return; }

    serverDetails.forEach((serverDetail) => {
      this._serverCreateBuilder
        .setServerDetails(serverDetail.getCreationInputs())
        .setServerOsType(serverDetail.getCreationOsType())
        .createOrUpdateServer();
    });
  }

  /**
   * Gets the list of resources from repository
   */
  private _subscribeToAllResources(): void {
    this.resources$ = this._serversService.getResourcesByAccess().pipe(
      map((resources) => resources.filter((resource) => !resource.isDedicated))
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Gets the resource based on ID provided
   * @param resourceId Resource Id of the resource to get
   */
  private _subscribeResourceById(resourceId: any): void {
    this.resource$ = this._apiService.getResource(resourceId).pipe(
      tap((resource) => this._serverCreateBuilder.setResource(resource)),
      shareReplay(1)
    );
  }

  /**
   * Sets the initial tab view based on the parameter provided
   */
  private _setInitialTabViewByParam(): void {
    this._activatedRoute.queryParams
      .pipe(takeUntil(this._destroySubject))
      .subscribe((params: ParamMap) => {

        let serverId = params['clone'];
        let serverIdIsValid = !isNullOrEmpty(serverId);
        this.selectedServerId = serverIdIsValid ? serverId : '';

        let resourceId = params['resource'];
        let resourceIdIsValid = !isNullOrEmpty(resourceId);
        if (resourceIdIsValid) {
          this._apiService.getResource(resourceId).pipe(
            tap((resource) => {
              this._changeDetectorRef.markForCheck();
              this.fcResource.setValue(resource);
            })).subscribe();
        }
      });
  }
}
