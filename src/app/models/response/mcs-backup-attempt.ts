import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  BackupAttemptStatus,
  BackupStatusSerialization
} from '../enumerations/backup-attempt-status.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsBackupAttempt extends McsEntityBase {
  @JsonProperty({
    serializer: BackupStatusSerialization,
    deserializer: BackupStatusSerialization
  })
  public status: BackupAttemptStatus = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public startedOn: Date = undefined;
}
