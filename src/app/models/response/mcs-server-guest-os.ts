import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerGuestOs {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public crispCode: string = undefined;
}
