import { ServiceOrderState } from '@app/models';

export interface IMcsServiceOrderStateChangeable {
  getServiceOrderState(): ServiceOrderState;
}
