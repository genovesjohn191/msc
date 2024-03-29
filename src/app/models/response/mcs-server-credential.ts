import { JsonProperty } from '@app/utilities';

export class McsServerCredential {
  @JsonProperty()
  public password: string = undefined;

  @JsonProperty()
  public server: string = undefined;

  @JsonProperty()
  public username: string = undefined;
}
