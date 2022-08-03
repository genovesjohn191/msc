import { JsonProperty } from '@app/utilities';

import { McsQueryParam } from '../../common/mcs-query-param';

export class McsVCenterBaselineQueryParam extends McsQueryParam {
  @JsonProperty({ name: 'vcenter' })
  public vcenter?: string = undefined;
}
