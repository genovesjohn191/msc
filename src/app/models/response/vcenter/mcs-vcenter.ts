import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';

export class McsVCenter extends McsEntityBase {
  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public name: string = undefined;
}
