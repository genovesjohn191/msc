export class McsApplicationRecoveryQueryParams {
  public billingDescription: string;
  public serviceId: string;

  constructor( _serviceId: any, _billingDescription?: string) {
    this.billingDescription = _billingDescription;
    this.serviceId = _serviceId;
  }
}
