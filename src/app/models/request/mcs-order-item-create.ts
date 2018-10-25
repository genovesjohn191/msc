export class McsOrderItemCreate {
  public itemOrderType: string;
  public referenceId: string;
  public parentServiceId: string;
  public parentReferenceId: string;
  public properties: any;

  constructor() {
    this.itemOrderType = undefined;
    this.referenceId = undefined;
    this.parentServiceId = undefined;
    this.parentReferenceId = undefined;
    this.properties = undefined;
  }
}
