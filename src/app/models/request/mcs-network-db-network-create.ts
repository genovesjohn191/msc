import { JsonProperty } from '@app/utilities';
import { McsNetworkDbNetworkCreateItem } from './mcs-network-db-network-create-item';

export class McsNetworkDbNetworkCreate {
  @JsonProperty()
  public networks: McsNetworkDbNetworkCreateItem[] = undefined;
}
