import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { FormArray } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  throwError,
  Observable
} from 'rxjs';
import {
  catchError,
  shareReplay,
  finalize
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsErrorHandlerService,
  CoreRoutes,
  McsLoadingService,
  McsOrderWizardBase
} from '@app/core';
import {
  ServiceType,
  RouteKey,
  McsResource,
  McsOrderWorkflow
} from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty,
  McsSafeToNavigateAway
} from '@app/utilities';
import { McsResourcesRepository } from '@app/services';
import { OrderDetails } from '@app/features-shared';
import { ServerCreateDetailsComponent } from './details/server-create-details.component';
import { ServerCreateService } from './server-create.service';
import { IServerCreate } from './factory/server-create.interface';
import { ServerCreateFactory } from './factory/server-create-factory';
import { ServerCreateDetailsBase } from './details/server-create-details.base';
import { AddOnDetails } from './addons/addons-model';

@Component({
  selector: 'mcs-server-create',
  templateUrl: 'server-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServerCreateService]
})

export class ServerCreateComponent extends McsOrderWizardBase
  implements OnInit, OnDestroy, McsSafeToNavigateAway {

  // Other variables
  public resources$: Observable<McsResource[]>;
  public resource$: Observable<McsResource>;
  public faCreationForm: FormArray;

  // Creation factory of the server
  private _serverCreateInstance: IServerCreate;
  private _serverCreateFactory = new ServerCreateFactory();

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

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _loaderService: McsLoadingService,
    private _translate: TranslateService,
    private _errorHandlerService: McsErrorHandlerService,
    private _resourcesRepository: McsResourcesRepository,
    private _serverCreateService: ServerCreateService
  ) {
    super(_serverCreateService);
  }

  public ngOnInit() {
    this._subscribeToAllResources();
  }

  public ngOnDestroy() {
    super.dispose();
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
  public safeToNavigateAway(): boolean {
    return getSafeProperty(this._detailsStep, (obj) => obj.safeToNavigateAway(), true);
  }

  /**
   * Event that emits whenever a resource is selected
   */
  public onChangeResource(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this._subscribeResourceById(resource.id);

    this._serverCreateInstance = this._serverCreateFactory
      .getCreationFactory(resource.serviceType);

    this._serverCreateInstance.isSelfManaged() ?
      this.pricingCalculator.hideWidget() :
      this.pricingCalculator.showWidget();
  }

  /**
   * Event that emits when the server details has been changed
   * @param resource Resource on where to create the server
   * @param serverDetails Server details to be created
   */
  public onServerDetailsChange<T>(
    resource: McsResource,
    serverDetails: Array<ServerCreateDetailsBase<T>>
  ): void {
    if (isNullOrEmpty(serverDetails)) { return; }
    if (this._serverCreateInstance.isSelfManaged()) { return; }
    this._createServer(resource, serverDetails);
  }

  /**
   * Event that emits whe nthe server details have been submitted
   * @param resource Resource on where to create the server
   * @param serverDetails Server details to be created
   */
  public onServerDetailsSubmit<T>(
    resource: McsResource,
    serverDetails: Array<ServerCreateDetailsBase<T>>
  ): void {
    this._createServer(resource, serverDetails);
  }

  /**
   * Event that emits when the add ons have been changed
   * @param addOnDetails Add on details to be submitted
   */
  public onServerAddOnChange(addOnDetails: AddOnDetails[]): void {
    if (isNullOrEmpty(addOnDetails)) { return; }

    addOnDetails.forEach((addOn) => {
      !addOn.selected ?
        this._serverCreateService.deleteOrderItemByRefId(addOn.referenceId) :
        this._serverCreateService.addOrUpdateOrderItem({
          itemOrderTypeId: addOn.typeId,
          referenceId: addOn.referenceId,
          properties: addOn.addOnContent,
          parentReferenceId: this._serverCreateService.orderReferenceId,
          parentServiceId: this._serverCreateService.orderServiceId
        });
    });
  }

  /**
   * Event that emits when the order have been submitted
   * @param submitDetails Submit details of the order
   */
  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }
    let workflow = {
      state: submitDetails.workflowAction,
      clientReferenceObject: {
        resourcePath: CoreRoutes.getNavigationPath(RouteKey.ServerDetail)
      }
    } as McsOrderWorkflow;

    this._serverCreateService.sendOrderWorkflow({
      description: submitDetails.description,
      contractDuration: submitDetails.contractDuration,
      billingSiteId: submitDetails.billingSite.id,
      billingCostCentreId: submitDetails.billingCostCentre.id
    }, workflow);
  }

  /**
   * Creates the managed/self-managed server according to factory instance
   * @param resource Resource on where to create the server
   * @param serverDetails Server details to be created
   */
  private _createServer<T>(
    resource: McsResource,
    serverDetails: Array<ServerCreateDetailsBase<T>>
  ): void {
    if (isNullOrEmpty(serverDetails)) { return; }

    serverDetails.forEach((serverDetail) => {
      this._serverCreateInstance.createServer(
        resource,
        this._serverCreateService,
        serverDetail.getCreationInputs()
      );
    });
  }

  /**
   * Gets the list of resources from repository
   */
  private _subscribeToAllResources(): void {
    this._loaderService.showLoader('Loading resources');
    this.resources$ = this._resourcesRepository.getResourcesByFeature().pipe(
      catchError((error) => {
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      })
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Gets the resource based on ID provided
   * @param resourceId Resource Id of the resource to get
   */
  private _subscribeResourceById(resourceId: any): void {
    this._loaderService.showLoader('Loading resource details');
    this.resource$ = this._resourcesRepository.getById(resourceId).pipe(
      shareReplay(1),
      finalize(() => this._loaderService.hideLoader())
    );
  }
}
