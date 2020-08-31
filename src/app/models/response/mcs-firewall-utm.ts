import { JsonProperty } from '@app/utilities';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsFirewallUtm {
  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public avExpiryDate: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public ipsExpiryDate: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public emailExpiryDate: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public webExpiryDate: Date = undefined;

  /**
   * Returns true if firewall has one or more UTM service
   */
  public get hasUtmService(): boolean {
    return false;
  }
}
