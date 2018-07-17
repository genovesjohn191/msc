import { OrderCharge } from '../../../orders';

export class ServerOrderDetail {
  public header: string;
  public charges: OrderCharge;
}
