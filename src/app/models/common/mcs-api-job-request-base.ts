import { JsonProperty } from '@app/utilities';

export class McsApiJobRequestBase<T> {
  @JsonProperty()
  public clientReferenceObject?: T = undefined;

  @JsonProperty()
  public batchId?: string = undefined;
}
