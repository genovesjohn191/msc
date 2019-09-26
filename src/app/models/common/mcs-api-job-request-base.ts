import { JsonProperty } from '@peerlancers/json-serialization';

export class McsApiJobRequestBase<T> {
  @JsonProperty()
  public clientReferenceObject?: T = undefined;

  @JsonProperty()
  public batchId?: string = undefined;
}
