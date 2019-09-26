import { JsonProperty } from '@peerlancers/json-serialization';
import { McsApiError } from '../common/mcs-api-error';

export class McsApiErrorResponse {
  @JsonProperty()
  public status: number = undefined;

  @JsonProperty()
  public message: string = undefined;

  @JsonProperty({ target: McsApiError })
  public errors: McsApiError[] = undefined;

  /**
   * Returns all the error messages on the response
   */
  public get errorMessages(): string[] {
    return this.errors && this.errors.map((error) => error.message);
  }
}
