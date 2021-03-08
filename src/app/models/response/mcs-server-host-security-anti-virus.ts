import { JsonProperty } from '@app/utilities';
import { McsServerHostSecurityAntiVirusDetails } from './mcs-server-host-security-anti-virus-details';

export class McsServerHostSecurityAntiVirus {

  @JsonProperty()
  public serverId: string = undefined;

  @JsonProperty({ target: McsServerHostSecurityAntiVirusDetails })
  public antiVirus: McsServerHostSecurityAntiVirusDetails = undefined;
}

