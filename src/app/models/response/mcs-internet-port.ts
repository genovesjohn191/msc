import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  InviewLevel,
  InviewLevelSerialization,
  inviewLevelText
} from '../enumerations/inview-level.enum';
import {
  ServiceLevel,
  ServiceLevelSerialization,
  serviceLevelText
} from '../enumerations/service-level.enum';
import {
  PortStatus,
  PortStatusSerialization,
  portStatusText
} from '../enumerations/port-status.enum';
import { isNullOrEmpty } from '@app/utilities';

export class McsInternetPort extends McsEntityBase {
  public serviceId: string = undefined;
  public description: string = undefined;
  public portSpeedMbps: number = undefined;
  public subnet: string = undefined;
  public primaryPort: string = undefined;

  @JsonProperty({
    type: ServiceLevel,
    serializer: ServiceLevelSerialization,
    deserializer: ServiceLevelSerialization
  })
  public serviceLevel: ServiceLevel = undefined;

  @JsonProperty({
    type: PortStatus,
    serializer: PortStatusSerialization,
    deserializer: PortStatusSerialization
  })
  public status: PortStatus = undefined;

  @JsonProperty({
    type: InviewLevel,
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  private inviewLevel: InviewLevel = undefined;

  /**
   * Returns the inview level
   */
  public get inViewLevel(): InviewLevel {
    if (isNullOrEmpty(this.inviewLevel)) {
      return InviewLevel.None;
    }
    return this.inviewLevel;
  }

  /**
   * Returns the service level label
   */
  public get serviceLevelLabel(): string {
    return serviceLevelText[this.serviceLevel];
  }

  /**
   * Returns the port status label
   */
  public get portStatusLabel(): string {
    return portStatusText[this.status];
  }

  /**
   * Returns the inview level label
   */
  public get inviewLevelLabel(): string {
    return inviewLevelText[this.inViewLevel];
  }
}
