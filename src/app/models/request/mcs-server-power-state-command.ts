import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import {
  VmPowerstateCommand,
  VmPowerstateCommandSerialization
} from '../enumerations/vm-power-state-command.enum';
import { JsonProperty } from 'json-object-mapper';

export class McsServerPowerstateCommand extends McsApiJobRequestBase {

  @JsonProperty({
    type: VmPowerstateCommand,
    serializer: VmPowerstateCommandSerialization,
    deserializer: VmPowerstateCommandSerialization
  })
  public command: VmPowerstateCommand;
}
