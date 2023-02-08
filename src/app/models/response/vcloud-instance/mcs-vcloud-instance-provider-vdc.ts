import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../../common/mcs-entity.base';
import { McsVcloudInstancePods } from './mcs-vcloud-instance-pods';

export class McsVcloudInstanceProviderVdc extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public isMAZAA: boolean = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public pods: McsVcloudInstancePods[] = undefined;
}