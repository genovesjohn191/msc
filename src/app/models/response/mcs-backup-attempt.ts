import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import { BackupAttemptStatus, BackupStatusSerialization } from '../enumerations/backup-attempt-status.enum';

export class McsBackupAttempt extends McsEntityBase  {
  @JsonProperty({
    serializer: BackupStatusSerialization,
    deserializer: BackupStatusSerialization
  })
  public status: BackupAttemptStatus = undefined;

  @JsonProperty()
  public startedOn: string = undefined;
}
