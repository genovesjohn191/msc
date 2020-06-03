import { JsonProperty } from '@app/utilities';
import { McsBackupAttempt } from './mcs-backup-attempt';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  InviewLevel,
  InviewLevelSerialization
} from '../enumerations/inview-level.enum';

export class McsServerBackupServer extends McsEntityBase {

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public serverServiceId: string = undefined;

  @JsonProperty()
  public provisioned: boolean = undefined;

  @JsonProperty({ target: McsBackupAttempt })
  public lastBackupAttempt: McsBackupAttempt = undefined;

  @JsonProperty({
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  public inviewLevel: InviewLevel = undefined;

  @JsonProperty()
  public aggregationTargetId: string = undefined;

  @JsonProperty()
  public aggregationTargetServiceId: string = undefined;
}

