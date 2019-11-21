import { JsonProperty } from '@peerlancers/json-serialization';
import { McsBackupAttempt } from './mcs-backup-attempt';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  InviewLevelSerialization,
  InviewLevel
} from '../enumerations/inview-level.enum';

export class McsServerBackupVm extends McsEntityBase {

  @JsonProperty()
  public provisioned: boolean = undefined;

  @JsonProperty()
  public lastBackupAttempt: McsBackupAttempt = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty({
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  public inviewLevel: InviewLevel = undefined;
}

