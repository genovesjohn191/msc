export class McsApiError {
  public referenceId: string;
  public field: string;
  public code: string;
  public message: string;

  constructor() {
    this.referenceId = undefined;
    this.field = undefined;
    this.code = undefined;
    this.message = undefined;
  }
}
