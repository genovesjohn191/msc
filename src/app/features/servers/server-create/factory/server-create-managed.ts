import {
  OrderIdType,
  McsResource
} from '@app/models';
import { McsGuid } from '@app/core';
import { IServerCreate } from './server-create.interface';
import { ServerCreateService } from '../server-create.service';

export class ServerCreateManaged implements IServerCreate {
  private _serverReferenceId = McsGuid.newGuid();

  /**
   * Creates the managed server accordingly
   * @param resource Resource on where the server should be created
   * @param serverCreateService Server creation service API
   * @param serverDetails Server details to be created
   */
  public createServer<T>(
    resource: McsResource,
    serverCreateService: ServerCreateService,
    serverDetails: T
  ): void {
    // TODO: We need to find a way on how to deal this in UI
    (serverDetails as any).inviewLevel = 'Premium';

    serverCreateService.createOrUpdateOrder({
      description: 'New Managed Server', contractDuration: 12,
      // TODO : temporary static value
      billingSite: '129973',
      costCentre: '281504',
      items: [{
        itemOrderTypeId: OrderIdType.CreateManagedServer,
        referenceId: this._serverReferenceId.toString(),
        parentServiceId: resource.name,
        properties: serverDetails
      }]
    });
  }

  /**
   * Returns true when the server is self managed
   */
  public isSelfManaged(): boolean {
    return false;
  }
}
