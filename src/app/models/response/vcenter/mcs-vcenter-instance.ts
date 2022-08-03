import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';

export class McsVCenterInstance extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public apiUrl: string = undefined;

  @JsonProperty()
  public availabilityZone: string = undefined;

  @JsonProperty()
  public pod: string = undefined;

  @JsonProperty()
  public companyId: string = undefined;
}
