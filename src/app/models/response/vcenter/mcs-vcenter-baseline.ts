import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';

export class McsVCenterBaseline extends McsEntityBase {

  @JsonProperty()
  public username: string = undefined;

  @JsonProperty()
  public displayName: string = undefined;

  @JsonProperty()
  public firstName: string = undefined;

  @JsonProperty()
  public lastName: string = undefined;

  @JsonProperty()
  public emailAddress: string = undefined;

  @JsonProperty()
  public phoneNumber: string = undefined;

  @JsonProperty()
  public jobTitle: string = undefined;
}

