export class McsVdcStorageQueryParams {
  public resourceId?: string;
  public storageId?: string;

  constructor(_resourceId?: string, _storageId?: string) {
    this.resourceId = _resourceId;
    this.storageId = _storageId;
  }
}
