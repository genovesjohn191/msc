import { McsApiError } from './mcs-api-error';

export class McsApiErrorResponse {
  public status: number;
  public message: string;
  public errors: McsApiError[];

  constructor() {
    this.status = undefined;
    this.message = undefined;
    this.errors = undefined;
  }
}
