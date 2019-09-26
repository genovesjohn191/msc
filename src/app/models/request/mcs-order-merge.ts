import { JsonProperty } from '@peerlancers/json-serialization';

export class McsOrderMerge {
  @JsonProperty()
  public mergeWithOrderId: number = undefined;
}
