import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';

export class McsVCenterDataCentre extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public companyId: string = undefined;
}
