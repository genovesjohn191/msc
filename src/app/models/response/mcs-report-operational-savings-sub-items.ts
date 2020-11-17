import { JsonProperty } from '@app/utilities';

export class OperationalSavingsSubItems {
  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public savings: number = undefined;
}