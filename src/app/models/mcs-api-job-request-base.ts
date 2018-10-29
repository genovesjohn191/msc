export class McsApiJobRequestBase {
  public clientReferenceObject?: any;
  public batchId?: string;

  constructor() {
    this.clientReferenceObject = {};
    this.batchId = undefined;
  }
}
