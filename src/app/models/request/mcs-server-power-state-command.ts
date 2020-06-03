import { JsonProperty } from '@app/utilities';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import {
  VmPowerstateCommand,
  VmPowerstateCommandSerialization
} from '../enumerations/vm-power-state-command.enum';

export interface McsServerPowerStateRefObj {
  serverId: string;
}

export class McsServerPowerstateCommand extends McsApiJobRequestBase<McsServerPowerStateRefObj> {
  @JsonProperty({
    serializer: VmPowerstateCommandSerialization,
    deserializer: VmPowerstateCommandSerialization
  })
  public command: VmPowerstateCommand = undefined;
}
