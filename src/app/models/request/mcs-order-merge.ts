import { JsonProperty } from '@app/utilities';

export class McsOrderMerge {
  @JsonProperty()
  public mergeWithOrderId: number = undefined;
}
