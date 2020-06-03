import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  InviewLevel,
  InviewLevelSerialization
} from '../enumerations/inview-level.enum';
import { McsServerBackupServerLog } from './mcs-server-backup-server-log';

export class McsServerBackupServerDetails extends McsEntityBase {

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public retentionPeriod: string = undefined;

  @JsonProperty({
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  public inviewLevel: InviewLevel = undefined;

  @JsonProperty({ target: McsServerBackupServerLog })
  public logs: McsServerBackupServerLog[] = undefined;
}

