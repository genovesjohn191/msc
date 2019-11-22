import { JsonProperty } from '@peerlancers/json-serialization';
import {
  AntiVirusStatus,
  AntiVirusStatusSerialization
} from '../enumerations/anti-virus-status.enum';
import { McsServerHostSecurityAvLogContent } from './mcs-server-host-security-av-log-content';

export class McsServerHostSecurityAvLog {
  @JsonProperty()
  public totalCount: number = undefined;

  @JsonProperty({
    serializer: AntiVirusStatusSerialization,
    deserializer: AntiVirusStatusSerialization
  })
  public status: AntiVirusStatus = AntiVirusStatus.None;

  @JsonProperty({ target: McsServerHostSecurityAvLogContent })
  public content: McsServerHostSecurityAvLogContent[] = undefined;
}

