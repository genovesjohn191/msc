import { JsonProperty } from '@app/utilities';

export class McsStorageSize {
  @JsonProperty()
  public default: boolean = undefined;

  @JsonProperty()
  public preview: boolean = undefined;
}