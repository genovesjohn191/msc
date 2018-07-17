export class OrderItemCreate {
  public productOrderType: string;
  public parentServiceId: string;
  public parentReferenceId: string;
  public referenceId: string;
  public properties: any;

  constructor() {
    this.productOrderType = undefined;
    this.parentServiceId = undefined;
    this.parentReferenceId = undefined;
    this.referenceId = undefined;
    this.properties = undefined;
  }
}
