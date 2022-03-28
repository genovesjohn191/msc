import { JsonProperty } from '@app/utilities';

import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsNetworkDbVlanEvent {
  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public date: Date = undefined;

  @JsonProperty()
  public user: string = undefined;

  @JsonProperty()
  public action: string = undefined;

  @JsonProperty()
  public networkCompanyId: string = undefined;

  @JsonProperty()
  public networkServiceId: string = undefined;

  @JsonProperty()
  public networkName: string = undefined;
}
