export class McsAzureManagementServiceQueryParams {
  public description: string;
  public serviceId: string;

  constructor( _description: string, _serviceId: any ) {
    this.description = _description;
    this.serviceId = _serviceId;
  }
}
