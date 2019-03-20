import { McsResource } from '@app/models';
import { ServerCreateService } from '../server-create.service';

export interface IServerCreate {
  createServer<T>(
    resource: McsResource,
    serverCreateService: ServerCreateService,
    serverDetails: T
  ): void;
}
