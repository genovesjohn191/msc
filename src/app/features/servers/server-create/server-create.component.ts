import {
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  IMcsNavigateAwayGuard,
  McsOrderWizardBase
} from '@app/core';
import { OrderDetails } from '@app/features-shared';
import {
  McsOrderWorkflow,
  McsResource,
  Os,
  ServiceType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

import { AddOnDetails } from './addons/addons-model';
import { ServerCreateDetailsBase } from './details/server-create-details.base';
import { ServerCreateDetailsComponent } from './details/server-create-details.component';
import { ServerCreateBuilder } from './server-create.builder';
import { ServerCreateService } from './server-create.service';

@Component({
  selector: 'mcs-server-create',
  templateUrl: 'server-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServerCreateService]
})

export class ServerCreateComponent extends McsOrderWizardBase
  implements OnInit, OnDestroy, IMcsNavigateAwayGuard {

  // Other variables
  public selectedResource: McsResource;
  public resource$: Observable<McsResource>;
  public selectedServerId: string;
  public storageSize: number;
  public isSelfManaged: boolean = true;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
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
    private _apiService: McsApiService,
  ) {
    super(
      _serverCreateService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'create-server-billing-details-step',
          action: 'next-button'
        }
      });
    this._serverCreateBuilder = new ServerCreateBuilder(_serverCreateService);
  }

  public ngOnInit() {
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
   * Returns true when the server to create is windows
   */
  public get serverCreationStorageSize(): number {
    return getSafeProperty(this._serverCreateBuilder, (obj) => obj.storageSize);
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
    this.isSelfManaged = resource.isSelfManaged;
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
   * @param resourceServiceId The service id of the server
   */
  public onSubmitOrder(submitDetails: OrderDetails, resourceServiceId: string): void {
    // get orderId and save in session storage for automation
    sessionStorage.setItem('order-id', this.orderId);
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: resourceServiceId
    };
    this.submitOrderWorkflow(workflow);
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
        .setServerStorageSize(serverDetail.getCreationStorageSize())
        .createOrUpdateServer();
    });
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
              this.selectedResource = resource;
            })).subscribe();
        }
      });
  }
}
