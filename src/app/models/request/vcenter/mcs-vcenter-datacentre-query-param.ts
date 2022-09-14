import { JsonProperty } from '@app/utilities';

import { McsQueryParam } from '../../common/mcs-query-param';

export class McsVCenterDatacentreQueryParam extends McsQueryParam {
  @JsonProperty({ name: 'vcenter' })
  public vcenter?: string = undefined;
}
