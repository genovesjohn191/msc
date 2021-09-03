import {
  HardwareType,
  PlatformType,
  ServiceType
} from '@app/models';

export interface ServerFilterConfig {
  hideDedicated?: boolean;
  hideNonDedicated?: boolean;
  allowedHardwareType?: HardwareType[];
  allowedServiceType?: ServiceType[];
  allowedPlatformType?: PlatformType[];
}
