export class McsAzureServiceQueryParams {
  public serviceId: string;
  public azureId?: string;

  constructor( _serviceId: any, _azureId?: string) {
    this.serviceId = _serviceId;
    this.azureId = _azureId;
  }
}
