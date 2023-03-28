import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsCompute } from './mcs-compute';

export class McsPhysicalServer extends McsEntityBase {
  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public dn: string = undefined;

  @JsonProperty()
  public usrLbl: string = undefined;

  @JsonProperty()
  public serial: string = undefined;

  @JsonProperty()
  public model: string = undefined;

  @JsonProperty()
  public numOfCores: number = undefined;

  @JsonProperty()
  public numOfCpus: number = undefined;

  @JsonProperty()
  public totalMemory: number = undefined;

  @JsonProperty()
  public processorModel: string = undefined;

  @JsonProperty()
  public processorSpeedMhz: number = undefined;

  @JsonProperty()
  public operPower: string = undefined;

  @JsonProperty()
  public managedBy: string = undefined;

  @JsonProperty()
  public associatedServiceId: string = undefined;

}