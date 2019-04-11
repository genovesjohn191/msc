import {
  OrderIdType,
  McsResource
} from '@app/models';
import { McsGuid } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
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
    if (isNullOrEmpty(serverDetails['inviewLevel'])) {
      serverDetails['inviewLevel'] = 'Premium';
    }

    serverCreateService.createOrUpdateOrder({
      description: serverCreateService.createDefaultOrderDescription('New Managed Server'),
      contractDurationMonths: 12,
      items: [{
        itemOrderTypeId: OrderIdType.CreateManagedServer,
        referenceId: this._serverReferenceId.toString(),
        parentServiceId: resource.name,
        properties: serverDetails
      }]
    });
  }
}
