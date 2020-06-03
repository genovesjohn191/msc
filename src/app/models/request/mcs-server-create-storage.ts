import { JsonProperty } from '@app/utilities';

export class McsServerCreateStorage {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public sizeMB: number = undefined;
}
