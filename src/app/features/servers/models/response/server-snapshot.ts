export class ServerSnapshot {
  public snapshotMB: number;
  public createdOn: Date;
  public poweredOn: boolean;

  // Additional flag not related to API response
  public isProcessing: boolean;
}
