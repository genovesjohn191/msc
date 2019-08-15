/** Services */
import { SwitchAccountService } from './shared';
import { UserPanelService } from './header';

/**
 * Array of services/providers
 */
export const coreLayoutProviders: any[] = [
  SwitchAccountService,
  UserPanelService
];
