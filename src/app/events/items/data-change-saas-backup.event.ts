import { EventBusState } from '@app/event-bus';
import { McsStorageSaasBackup } from '@app/models';

export class DataChangeSaasBackupEvent extends EventBusState<McsStorageSaasBackup[]> {
  constructor() {
    super('SaasBackupEvent');
  }
}
