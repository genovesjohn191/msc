import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerCreateAddOnAntiVirus {
  @JsonProperty()
  public technology: string = undefined;

  @JsonProperty()
  public variant: string = undefined;
}
