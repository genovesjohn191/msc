import { McsGuid } from '@app/core';
import {
  OrderIdType,
  McsOrderItemCreate
} from '@app/models';

export class AddOnsModel {
  // Unique Ids for every instance of the model
  private _antiMalwareGuid = McsGuid.newGuid();

  /**
   * Returns the antimalware order details
   */
  public get antiMalware(): McsOrderItemCreate { return this._antiMalware; }
  private _antiMalware: McsOrderItemCreate;

  public setAntiMalwareOrderDetails<T>(properties: T, parentReferenceId: string): void {
    let orderDetails = new McsOrderItemCreate();
    orderDetails.itemOrderType = OrderIdType.CreateAddOnAntiMalware;
    orderDetails.referenceId = this._antiMalwareGuid.toString();
    orderDetails.properties = properties;
    orderDetails.parentReferenceId = parentReferenceId;
    this._antiMalware = orderDetails;
  }
}
