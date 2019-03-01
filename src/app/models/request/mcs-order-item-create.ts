export class McsOrderItemCreate {
  public itemOrderTypeId?: string;
  public referenceId?: string;
  public parentServiceId?: string;
  public parentReferenceId?: string;
  public properties?: any;

  constructor() {
    this.itemOrderTypeId = undefined;
    this.referenceId = undefined;
    this.parentServiceId = undefined;
    this.parentReferenceId = undefined;
    this.properties = undefined;
  }
}
