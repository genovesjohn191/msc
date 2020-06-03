import { JsonProperty } from '@app/utilities';

export class McsServerCreateAddOnAntiVirus {
  @JsonProperty()
  public technology: string = undefined;

  @JsonProperty()
  public variant: string = undefined;
}
