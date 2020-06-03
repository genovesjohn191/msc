import { JsonProperty } from '@app/utilities';

export class McsServerCreateAddOnHids {
  @JsonProperty()
  public protectionLevel: string = undefined;
}
