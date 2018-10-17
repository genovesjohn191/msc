import { StatusCode } from '../enumerations/status-code.enum';

export class McsValidation {
  public referenceId: string;
  public field: string;
  public code: StatusCode;
  public message: string;

  constructor() {
    this.referenceId = undefined;
    this.field = undefined;
    this.code = undefined;
    this.message = undefined;
  }
}
