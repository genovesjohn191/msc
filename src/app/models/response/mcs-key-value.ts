import { JsonProperty } from '@app/utilities';

export class McsKeyValue {
  @JsonProperty()
  public key: string = undefined;

  @JsonProperty()
  public value: string = undefined;
}