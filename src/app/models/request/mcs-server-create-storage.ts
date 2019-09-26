import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerCreateStorage {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public sizeMB: number = undefined;
}
