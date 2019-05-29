import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import {
  VmPowerstateCommand,
  VmPowerstateCommandSerialization
} from '../enumerations/vm-power-state-command.enum';
import { JsonProperty } from 'json-object-mapper';

export interface McsServerPowerStateRefObj {
  serverId: string;
}

export class McsServerPowerstateCommand extends McsApiJobRequestBase<McsServerPowerStateRefObj> {
  @JsonProperty({
    type: VmPowerstateCommand,
    serializer: VmPowerstateCommandSerialization,
    deserializer: VmPowerstateCommandSerialization
  })
  public command: VmPowerstateCommand;
}
