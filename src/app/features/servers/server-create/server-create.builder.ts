import { OrderRequester } from '@app/core';
import {
  isNullOrEmpty,
  createObject,
  serializeObjectToJson,
  convertMbToGb
} from '@app/utilities';
import {
  McsResource,
  ServiceType,
  McsServerCreateAddOnSqlServer,
  McsServerCreateAddOnInview,
  Os,
  McsOrderCreate,
  McsOrderItemCreate
} from '@app/models';
import { OrderDetails } from '@app/features-shared';
import { IServerCreate } from './factory/server-create.interface';
import { ServerCreateFactory } from './factory/server-create-factory';
import { ServerCreateService } from './server-create.service';
import { AddOnDetails } from './addons/addons-model';

const STORAGE_SIZE_PERCENT_BUFFER = .10;

export class ServerCreateBuilder<T> {
  private _resource: McsResource;
  private _serviceType: ServiceType;
  private _serverOsType: Os;
  private _storageSize: number;
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
   * Returns true when the target creation is windows platform
   */
  public get osType(): Os {
    return this._serverOsType;
  }

  /**
   * Returns true when the target creation is windows platform
   */
  public get storageSize(): number {
    return this._storageSize;
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
   * Sets the server os type
   * @param osType Os type to be created
   */
  public setServerOsType(osType: Os): ServerCreateBuilder<T> {
    this._serverOsType = osType;
    return this;
  }

  /**
   * Sets the server storage size
   */
  public setServerStorageSize(storageSize: number): ServerCreateBuilder<T> {
    let storageSizeTenPercentBuffer = storageSize * STORAGE_SIZE_PERCENT_BUFFER;
    let storageSizeConvertedToGb = convertMbToGb(storageSize + storageSizeTenPercentBuffer);
    this._storageSize = Math.round(storageSizeConvertedToGb);
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

    this._serverCreateService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId,
        description: orderDetails.description
      }),
      OrderRequester.Billing
    );
    this._serverCreateService.submitOrderRequest();
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

    this._serverCreateService.addOrUpdateOrderItem(
      createObject(McsOrderItemCreate, {
        itemOrderType: addOnDetails.typeId,
        referenceId: addOnDetails.referenceId,
        properties: addOnDetails.properties,
        parentReferenceId: this._serverCreateService.orderReferenceId,
        parentServiceId: this._serverCreateService.orderServiceId
      })
    );
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
    // TODO: Make this type safe, create a base class with proper properties
    this._serverDetails['sqlServer'] = serializeObjectToJson(serverSql.properties).sqlServer;
    this.createOrUpdateServer();
  }

  /**
   * Sets the inview add on to the server details
   * @param inviewDetails Inview details to be set
   */
  private _setInviewAddOn(inviewDetails: AddOnDetails<McsServerCreateAddOnInview>): void {
    // TODO: Make this type safe, create a base class with proper properties
    this._serverDetails['inviewLevel'] = serializeObjectToJson(inviewDetails.properties).inviewLevel;
    this.createOrUpdateServer();
  }
}
