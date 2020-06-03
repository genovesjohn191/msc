import { JsonProperty } from '@app/utilities';

export class McsServerOperatingSystemSummary {
  @JsonProperty()
  public vendor: string = undefined;

  @JsonProperty()
  public release: string = undefined;

  @JsonProperty()
  public version: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public edition: string = undefined;

  @JsonProperty()
  public guestOs: string = undefined;
}
