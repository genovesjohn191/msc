export class McsOrderItemCreate {
  public serviceId?: string;
  public itemOrderTypeId?: string;
  public referenceId?: string;
  public parentServiceId?: string;
  public parentReferenceId?: string;
  public properties?: any;

  constructor() {
    this.serviceId = undefined;
    this.itemOrderTypeId = undefined;
    this.referenceId = undefined;
    this.parentServiceId = undefined;
    this.parentReferenceId = undefined;
    this.properties = undefined;
  }
}
