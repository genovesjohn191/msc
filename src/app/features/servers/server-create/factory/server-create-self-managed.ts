import { McsResource } from '@app/models';
import { IServerCreate } from './server-create.interface';
import { ServerCreateService } from '../server-create.service';

export class ServerCreateSelfManaged implements IServerCreate {

  /**
   * Creates the self-managed server accordingly
   * @param resource Resource on where the server should be created
   * @param serverCreateService Server creation service API
   * @param serverDetails Server details to be created
   */
  public createServer<T>(
    _resource: McsResource,
    serverCreateService: ServerCreateService,
    serverDetails: T
  ): void {
    serverCreateService.createSelfManagedServer(serverDetails as any);
  }
}
