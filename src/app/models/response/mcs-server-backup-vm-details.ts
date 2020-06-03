import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  InviewLevel,
  InviewLevelSerialization
} from '../enumerations/inview-level.enum';
import { McsServerBackupVmLog } from './mcs-server-backup-vm-log';

export class McsServerBackupVmDetails extends McsEntityBase {

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public retentionPeriod: string = undefined;

  @JsonProperty({
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  public inviewLevel: InviewLevel = undefined;

  @JsonProperty({ target: McsServerBackupVmLog })
  public logs: McsServerBackupVmLog[] = undefined;
}

