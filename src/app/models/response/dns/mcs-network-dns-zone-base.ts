import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';

export class McsNetworkDnsZoneBase extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public parentServiceId: string = undefined;

  @JsonProperty()
  public parentBillingDescription: string = undefined;

  @JsonProperty()
  public parentServiceChangeAvailable: boolean = undefined;

  @JsonProperty()
  public parentUuid: string = undefined;

  @JsonProperty()
  public recordCount: number = undefined;

  @JsonProperty()
  public ttlSeconds: number = undefined;
}
