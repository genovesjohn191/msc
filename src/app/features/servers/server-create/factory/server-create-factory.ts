import { isNullOrUndefined } from '@app/utilities';
import { ServiceType } from '@app/models';
import { IServerCreate } from './server-create.interface';
import { ServerCreateSelfManaged } from './server-create-self-managed';
import { ServerCreateManaged } from './server-create-managed';

export class ServerCreateFactory {
  private _creationFactoriesMap: Map<ServiceType, IServerCreate>;

  constructor() {
    this._registerFactoryInstances();
  }

  /**
   * Gets the creation factory by type object
   * @param serviceType Service type in which to get the factory
   */
  public getCreationFactory(serviceType: ServiceType): IServerCreate {
    let factoryInstance = this._creationFactoriesMap.get(serviceType);
    if (isNullOrUndefined(factoryInstance)) {
      throw new Error(`${serviceType} was not defined on the factory context.`);
    }
    return factoryInstance;
  }

  /**
   * Registers the factory instances of the creation mode
   */
  private _registerFactoryInstances(): void {
    this._creationFactoriesMap = new Map();
    this._creationFactoriesMap.set(ServiceType.SelfManaged, new ServerCreateSelfManaged());
    this._creationFactoriesMap.set(ServiceType.Managed, new ServerCreateManaged());
  }
}
