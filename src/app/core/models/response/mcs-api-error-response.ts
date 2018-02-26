import { McsApiError } from './mcs-api-error';
import { JsonProperty } from 'json-object-mapper';

export class McsApiErrorResponse {
  public status: number;
  public message: string;

  @JsonProperty({ type: McsApiError })
  public errors: McsApiError[];

  constructor() {
    this.status = undefined;
    this.message = undefined;
    this.errors = undefined;
  }
}
