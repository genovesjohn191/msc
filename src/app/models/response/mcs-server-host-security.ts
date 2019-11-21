import { JsonProperty } from '@peerlancers/json-serialization';
import { McsServerHostSecurityAntiVirus } from './mcs-server-host-security-anti-virus';
import { McsServerHostSecurityHids } from './mcs-server-host-security-hids';
import { HostSecurityAgentStatus } from '../enumerations/host-security-agent-status.enum';

export class McsServerHostSecurity {
  @JsonProperty()
  public agentStatus: HostSecurityAgentStatus = undefined;

  @JsonProperty()
  public agentStatusMessages: string[] = undefined;

  @JsonProperty({ target: McsServerHostSecurityAntiVirus })
  public antiVirus: McsServerHostSecurityAntiVirus = undefined;

  @JsonProperty({ target: McsServerHostSecurityHids })
  public hids: McsServerHostSecurityHids = undefined;
}
