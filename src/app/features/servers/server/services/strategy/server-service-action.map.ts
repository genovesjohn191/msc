import { ServerServicesAction } from '@app/models';
import { IServerServiceActionStrategy } from './server-service-action.strategy';
import { ServiceOsUpdatesInspectAction } from './action/os-updates-inspect-action';
import { ServiceOsUpdatesPatchAction } from './action/os-updates-patch-action';
import { ServiceOsUpdatesScheduleSaveAction } from './action/os-updates-schedule-save-action';
import { ServiceOsUpdatesScheduleDeleteAction } from './action/os-updates-schedule-delete-action';
import { RaiseInviewLevelAction } from './action/raise-inview-level-action';

export type ServerServicesActionRecord = Record<ServerServicesAction, IServerServiceActionStrategy>;

export const serverServicesActionMap: ServerServicesActionRecord = {
  [ServerServicesAction.OsUpdatesInspect]: new ServiceOsUpdatesInspectAction(),
  [ServerServicesAction.OsUpdatesPatch]: new ServiceOsUpdatesPatchAction(),
  [ServerServicesAction.OsUpdatesScheduleSave]: new ServiceOsUpdatesScheduleSaveAction(),
  [ServerServicesAction.OsUpdatesScheduleDelete]: new ServiceOsUpdatesScheduleDeleteAction(),
  [ServerServicesAction.RaiseInviewLevel]: new RaiseInviewLevelAction(),
};
