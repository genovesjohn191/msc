import { JsonProperty } from '@peerlancers/json-serialization';
import {
  HidsStatusSerialization,
  HidsStatus
} from '../enumerations/hids-status.enum';
import { McsServerHostSecurityHidsLogContent } from './mcs-server-host-security-hids-log-content';

export class McsServerHostSecurityHidsLog {
  @JsonProperty()
  public totalCount: number = undefined;

  @JsonProperty({
    serializer: HidsStatusSerialization,
    deserializer: HidsStatusSerialization
  })
  public status: HidsStatus = HidsStatus.None;

  @JsonProperty({ target: McsServerHostSecurityHidsLogContent })
  public content: McsServerHostSecurityHidsLogContent[] = undefined;
}

