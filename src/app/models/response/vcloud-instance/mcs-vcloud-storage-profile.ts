import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../../common/mcs-entity.base';

export class McsVcloudStorageProfile {

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public size: number = undefined;

  @JsonProperty()
  public tier: string = undefined;

  @JsonProperty()
  public default?: boolean = undefined;
}