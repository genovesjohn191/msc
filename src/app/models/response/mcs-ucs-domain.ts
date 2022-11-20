import { McsEntityBase } from '../common/mcs-entity.base';
import { JsonProperty } from '@app/utilities';
import { McsUcsDomainGroup } from './mcs-ucs-domain-group';

export class McsUcsDomain extends McsEntityBase {
  @JsonProperty()
  public managementName: string = undefined;
  
  @JsonProperty()
  public availabilityZone: string = undefined;
  
  @JsonProperty()
  public podName: string = undefined;
  
  @JsonProperty()
  public domainGroupName: string = undefined;
  
  @JsonProperty()
  public domainGroupId: number = undefined;

  @JsonProperty()
  public createdAt: Date = undefined;

  @JsonProperty()
  public updatedAt: Date = undefined;

  @JsonProperty()
  public active?: boolean = undefined;
  
  @JsonProperty({ target: McsUcsDomainGroup })
  public domainGroups?: McsUcsDomainGroup[] = undefined;
}
