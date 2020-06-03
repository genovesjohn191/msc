import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  BackupStatus,
  BackupStatusSerialization
} from '../enumerations/backup-status.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsBackupAttempt extends McsEntityBase {
  @JsonProperty({
    serializer: BackupStatusSerialization,
    deserializer: BackupStatusSerialization
  })
  public status: BackupStatus = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public startedOn: Date = undefined;
}
