import {
  OrderIdType,
  McsResource
} from '@app/models';
import { isNullOrEmpty, Guid } from '@app/utilities';
import { IServerCreate } from './server-create.interface';
import { ServerCreateService } from '../server-create.service';

export class ServerCreateManaged implements IServerCreate {
  private _serverReferenceId = Guid.newGuid();

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
      contractDurationMonths: 12,
      items: [{
        itemOrderType: OrderIdType.CreateManagedServer,
        referenceId: this._serverReferenceId.toString(),
        parentServiceId: resource.name,
        properties: serverDetails
      }]
    });
  }
}
