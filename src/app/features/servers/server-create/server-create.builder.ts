import { isNullOrEmpty } from '@app/utilities';
import {
  McsResource,
  ServiceType,
  McsServerCreateAddOnSqlServer,
  McsServerCreateAddOnInview
} from '@app/models';
import { OrderDetails } from '@app/features-shared';
import { IServerCreate } from './factory/server-create.interface';
import { ServerCreateFactory } from './factory/server-create-factory';
import { ServerCreateService } from './server-create.service';
import { AddOnDetails } from './addons/addons-model';

export class ServerCreateBuilder<T> {
  private _resource: McsResource;
  private _serviceType: ServiceType;
  private _serverDetails: T;
  private _serverCreateInstance: IServerCreate;
  private _serverCreateFactory = new ServerCreateFactory();

  constructor(private _serverCreateService: ServerCreateService) { }

  /**
   * Returns true when the server to create is self managed
   */
  public get isSelfManaged(): boolean {
    return this._serviceType === ServiceType.SelfManaged;
  }

  /**
   * Sets the service type
   * @param serviceType Service type to be set
   */
  public setServiceType(serviceType: ServiceType): ServerCreateBuilder<T> {
    this._serviceType = serviceType;
    this._serverCreateInstance = this._serverCreateFactory.getCreationFactory(this._serviceType);
    return this;
  }

  /**
   * Sets the resource catalog
   * @param resource Resource to be set
   */
  public setResource(resource: McsResource): ServerCreateBuilder<T> {
    this._resource = resource;
    return this;
  }

  /**
   * Sets the server details to be created
   * @param serverDetails Server details to be created
   */
  public setServerDetails(serverDetails: T): ServerCreateBuilder<T> {
    this._serverDetails = serverDetails;
    return this;
  }

  /**
   * Create or Update the server details to be created
   * @note it will throw an error once there are no details provided
   */
  public createOrUpdateServer(): void {
    let noServerDetails = isNullOrEmpty(this._serverDetails) || isNullOrEmpty(this._resource);
    if (noServerDetails) {
      throw new Error(`Unable to create the server because the request payload was not supplied.`);
    }

    this._serverCreateInstance.createServer(
      this._resource,
      this._serverCreateService,
      this._serverDetails
    );
  }

  /**
   * Sets the order details of the managed server
   * @param orderDetails Order details to be set
   */
  public setOrderDetails(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._serverCreateService.createOrUpdateOrder({
      billingSiteId: orderDetails.billingSite.id,
      contractDurationMonths: orderDetails.contractDurationMonths,
      billingCostCentreId: orderDetails.billingCostCentre.id,
      description: orderDetails.description
    });
  }

  /**
   * Sets the add ons on the server
   * @param addOns Add-ons to be set on the server
   */
  public setAddOns(...addOns: Array<AddOnDetails<any>>): void {
    let serverIsNotYetCreated = isNullOrEmpty(addOns) || isNullOrEmpty(this._serverDetails);
    if (serverIsNotYetCreated) { return; }

    addOns.forEach((addOn) => {
      addOn.selected ?
        this._addOrUpdateAddOn(addOn) :
        this._deleteAddOn(addOn);
    });
  }

  /**
   * Add or update the add on to the server
   * @param addOnDetails Add on details to be added/updated
   */
  private _addOrUpdateAddOn(addOnDetails: AddOnDetails<any>): void {
    if (isNullOrEmpty(addOnDetails)) { return; }

    if (addOnDetails.properties instanceof McsServerCreateAddOnSqlServer) {
      this._setSqlServerAddOn(addOnDetails);
      return;
    }

    if (addOnDetails.properties instanceof McsServerCreateAddOnInview) {
      this._setInviewAddOn(addOnDetails);
      return;
    }

    this._serverCreateService.addOrUpdateOrderItem({
      itemOrderTypeId: addOnDetails.typeId,
      referenceId: addOnDetails.referenceId,
      properties: addOnDetails.properties,
      parentReferenceId: this._serverCreateService.orderReferenceId,
      parentServiceId: this._serverCreateService.orderServiceId
    });
  }

  /**
   * Deletes the add on
   * @param addOnDetails Add on details to be deleted
   */
  private _deleteAddOn(addOnDetails: AddOnDetails<any>): void {
    if (isNullOrEmpty(addOnDetails)) { return; }

    if (addOnDetails.properties instanceof McsServerCreateAddOnSqlServer) {
      this._removeSqlServerAddOn();
      return;
    }
    this._serverCreateService.deleteOrderItemByRefId(addOnDetails.referenceId);
  }

  /**
   * Removes the sql server on the server details
   */
  private _removeSqlServerAddOn(): void {
    this._serverDetails['sqlServer'] = null;
    this.createOrUpdateServer();
  }

  /**
   * Sets the sql server add on
   * @param serverSql Sql server add on provided
   */
  private _setSqlServerAddOn(serverSql: AddOnDetails<McsServerCreateAddOnSqlServer>): void {
    this._serverDetails['sqlServer'] = serverSql.properties.sqlServer;
    this.createOrUpdateServer();
  }

  /**
   * Sets the inview add on to the server details
   * @param inviewDetails Inview details to be set
   */
  private _setInviewAddOn(inviewDetails: AddOnDetails<McsServerCreateAddOnInview>): void {
    this._serverDetails['inviewLevel'] = inviewDetails.properties.inviewLevel;
    this.createOrUpdateServer();
  }
}
