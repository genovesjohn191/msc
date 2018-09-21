export class McsOrderError {
  public referenceId: string;
  public errorCode: string;
  public message: string;

  constructor() {
    this.referenceId = undefined;
    this.errorCode = undefined;
    this.message = undefined;
  }
}
