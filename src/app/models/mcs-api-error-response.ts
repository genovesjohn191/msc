import { JsonProperty } from 'json-object-mapper';
import { McsApiError } from '@app/models';

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

  /**
   * Returns all the error messages on the response
   */
  public get errorMessages(): string[] {
    return this.errors && this.errors.map((error) => error.message);
  }
}
