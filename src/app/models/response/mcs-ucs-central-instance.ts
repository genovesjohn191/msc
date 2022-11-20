import { McsEntityBase } from '../common/mcs-entity.base';
import { JsonProperty } from '@app/utilities';
import { McsUcsDomainGroup } from './mcs-ucs-domain-group';

export class McsUcsCentralInstance extends McsEntityBase {
  @JsonProperty()
  public availabilityZone: string = undefined;
  
  @JsonProperty()
  public managementName: string = undefined;
  
  @JsonProperty()
  public podName: string = undefined;
  
  @JsonProperty()
  public podId: number = undefined;

  @JsonProperty()
  public active: boolean = undefined;

  @JsonProperty({ target: McsUcsDomainGroup })
  public domainGroups: McsUcsDomainGroup[] = undefined;
}
