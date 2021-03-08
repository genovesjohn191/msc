import { JsonProperty } from '@app/utilities';
import { McsServerHostSecurityHidsDetails } from './mcs-server-host-security-hids-details';

export class McsServerHostSecurityHids {

  @JsonProperty()
  public serverId: string = undefined;

  @JsonProperty({ target: McsServerHostSecurityHidsDetails })
  public hids: McsServerHostSecurityHidsDetails = undefined;
}

