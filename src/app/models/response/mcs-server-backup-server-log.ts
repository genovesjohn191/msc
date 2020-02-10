import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  BackupStatus,
  BackupStatusSerialization
} from '../enumerations/backup-status.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsServerBackupServerLog extends McsEntityBase {

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

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public finishedOn: Date = undefined;

  @JsonProperty()
  public durationInMinutes: number = undefined;

  @JsonProperty()
  public backedUpFiles: number = undefined;

  @JsonProperty()
  public modifiedMB: number = undefined;

  @JsonProperty()
  public dataProtectionVolumeGB: number = undefined;

  @JsonProperty()
  public deduplicationRatio: number = undefined;
}
