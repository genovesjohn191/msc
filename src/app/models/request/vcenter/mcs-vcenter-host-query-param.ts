import { JsonProperty } from '@app/utilities';

import { McsQueryParam } from '../../common/mcs-query-param';

export class McsVCenterHostQueryParam extends McsQueryParam {
  @JsonProperty({ name: 'data_centre' })
  public dataCentre?: string = undefined;
}
