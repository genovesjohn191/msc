import { JsonProperty } from '@peerlancers/json-serialization';
import {
  BackupStatus,
  BackupStatusSerialization
} from '../enumerations/backup-status.enum';

export class McsServerBackupServer {

  @JsonProperty()
  public provisioned: boolean = undefined;

  @JsonProperty()
  public lastBackupAttempt: string = undefined;

  @JsonProperty()
  public startTime: string = undefined;

  @JsonProperty({
    serializer: BackupStatusSerialization,
    deserializer: BackupStatusSerialization
  })
  public status: BackupStatus = BackupStatus.NotStarted;
}

