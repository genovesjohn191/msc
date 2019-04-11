import { McsOrderCreate } from '@app/models';

export class McsOrderRequest {
  public orderDetails: McsOrderCreate;

  constructor() {
    this.orderDetails = new McsOrderCreate();
  }
}
