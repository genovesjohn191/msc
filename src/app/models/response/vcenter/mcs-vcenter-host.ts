import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';
import { McsVCenterHostCluster } from './mcs-vcenter-host-cluster';

export class McsVCenterHost extends McsEntityBase {
  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public apiUrl: string = undefined;

  @JsonProperty()
  public vpxId: string = undefined;

  @JsonProperty({ target: McsVCenterHostCluster })
  public parentCluster: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public managementName: string = undefined;

  @JsonProperty()
  public managementIpAddress: string = undefined;

  @JsonProperty()
  public osType: string = undefined;

  @JsonProperty()
  public vCenter: string = undefined;
}
