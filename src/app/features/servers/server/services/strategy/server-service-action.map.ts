import { ServerServicesAction } from '@app/models';
import { IServerServiceActionStrategy } from './server-service-action.strategy';
import { ServiceOsUpdateInspectAction } from './action/os-updates-inspect-action';

export type ServerServicesActionRecord = Record<ServerServicesAction, IServerServiceActionStrategy>;

export const serverServicesActionMap: ServerServicesActionRecord = {
  [ServerServicesAction.OsUpdateInspect]: new ServiceOsUpdateInspectAction()
};
