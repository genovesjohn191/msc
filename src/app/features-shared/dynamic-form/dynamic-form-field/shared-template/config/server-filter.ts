import {
  hardwareType,
  PlatformType,
  ServiceType
} from '@app/models';

export interface ServerFilterConfig {
  hideDedicated?: boolean;
  hideNonDedicated?: boolean;
  allowedHardwareType?: hardwareType[];
  allowedServiceType?: ServiceType[];
  allowedPlatformType?: PlatformType[];
}
