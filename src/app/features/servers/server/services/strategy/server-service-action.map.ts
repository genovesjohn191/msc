import { ServerServicesAction } from '@app/models';
import { IServerServiceActionStrategy } from './server-service-action.strategy';
import { ServiceOsUpdatesInspectAction } from './action/os-updates-inspect-action';
import { ServiceOsUpdatesPatchAction } from './action/os-updates-patch-action';
import { ServiceOsUpdatesScheduleSaveAction } from './action/os-updates-schedule-save-action';
import { ServiceOsUpdatesScheduleDeleteAction } from './action/os-updates-schedule-delete-action';
import { ServiceRaiseInviewLevelAction } from './action/raise-inview-level-action';
import { ServiceAddAvAction } from './action/add-av-action';
import { ServiceAddHidsAction } from './action/add-hids-action';
import { ServiceAddBackupVmAction } from './action/add-backup-vm-action';
import { ServiceAddBackupServerAction } from './action/add-backup-server-action';

export type ServerServicesActionRecord = Record<ServerServicesAction, IServerServiceActionStrategy<any>>;

export const serverServicesActionMap: ServerServicesActionRecord = {
  [ServerServicesAction.OsUpdatesInspect]: new ServiceOsUpdatesInspectAction(),
  [ServerServicesAction.OsUpdatesPatch]: new ServiceOsUpdatesPatchAction(),
  [ServerServicesAction.OsUpdatesScheduleSave]: new ServiceOsUpdatesScheduleSaveAction(),
  [ServerServicesAction.OsUpdatesScheduleDelete]: new ServiceOsUpdatesScheduleDeleteAction(),
  [ServerServicesAction.RaiseInviewLevel]: new ServiceRaiseInviewLevelAction(),
  [ServerServicesAction.AddAv]: new ServiceAddAvAction(),
  [ServerServicesAction.AddHids]: new ServiceAddHidsAction(),
  [ServerServicesAction.AddServerBackup]: new ServiceAddBackupServerAction(),
  [ServerServicesAction.AddVmBackup]: new ServiceAddBackupVmAction()
};
