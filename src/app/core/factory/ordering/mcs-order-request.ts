import { McsOrderCreate } from '@app/models';

export enum OrderRequester {
  None = 0,
  Client = 1,
  Billing = 2
}

export class McsOrderRequest {
  public orderDetails: McsOrderCreate;
  public orderRequester: OrderRequester;

  constructor() {
    this.orderDetails = new McsOrderCreate();
    this.orderRequester = OrderRequester.None;
  }
}
