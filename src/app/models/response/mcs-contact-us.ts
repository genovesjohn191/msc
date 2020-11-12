import { JsonProperty } from '@app/utilities';

export class McsContactUs {
  @JsonProperty()
  public position: string = undefined;

  @JsonProperty()
  public firstName: string = undefined;

  @JsonProperty()
  public lastName: string = undefined;

  @JsonProperty()
  public email: string = undefined;

  @JsonProperty()
  public phone: string = undefined;
}