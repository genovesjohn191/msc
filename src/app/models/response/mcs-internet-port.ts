import { JsonProperty } from 'json-object-mapper';
import { isNullOrEmpty } from '@app/utilities';
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
import {
  InternetPlan,
  InternetPlanSerialization,
  internetPlanText
} from '../enumerations/internet-plan.enum';
import {
  AvailabilityZone,
  AvailabilityZoneSerialization,
  availabilityZoneText
} from '../enumerations/availability-zone.enum';

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
    type: InternetPlan,
    serializer: InternetPlanSerialization,
    deserializer: InternetPlanSerialization
  })
  public plan: InternetPlan = undefined;

  @JsonProperty({
    type: InviewLevel,
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  public inviewLevel: InviewLevel = undefined;

  @JsonProperty({
    type: AvailabilityZone,
    serializer: AvailabilityZoneSerialization,
    deserializer: AvailabilityZoneSerialization
  })
  public availabilityZone: AvailabilityZone = undefined;

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
   * Returns the plan label
   */
  public get planLabel(): string {
    return internetPlanText[this.plan];
  }

  /**
   * Returns the internet zone label
   */
  public get availabilityZoneLabel(): string {
    return availabilityZoneText[this.availabilityZone];
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
