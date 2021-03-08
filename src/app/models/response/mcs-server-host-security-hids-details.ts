import { JsonProperty } from '@app/utilities';

export class McsServerHostSecurityHidsDetails {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public enabled: boolean = undefined;

  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public inviewPending: boolean = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;
}

