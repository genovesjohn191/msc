import { JsonProperty } from '@peerlancers/json-serialization';
import { McsServerHostSecurityAntiVirusItem } from './mcs-server-host-security-anti-virus-item';
import { McsServerHostSecurityHidsItem } from './mcs-server-host-security-hids-item';
import {
  HostSecurityAgentStatus,
  HostSecurityAgentStatusSerialization
} from '../enumerations/host-security-agent-status.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsServerHostSecurity extends McsEntityBase {
  @JsonProperty({
    serializer: HostSecurityAgentStatusSerialization,
    deserializer: HostSecurityAgentStatusSerialization
  })
  public agentStatus: HostSecurityAgentStatus = undefined;

  @JsonProperty()
  public agentStatusMessages: string[] = undefined;

  @JsonProperty()
  public provisioned: boolean = undefined;

  @JsonProperty({ target: McsServerHostSecurityAntiVirusItem })
  public antiVirus: McsServerHostSecurityAntiVirusItem = undefined;

  @JsonProperty({ target: McsServerHostSecurityHidsItem })
  public hids: McsServerHostSecurityHidsItem = undefined;
}
