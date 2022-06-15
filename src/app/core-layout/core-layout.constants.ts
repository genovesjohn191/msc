/** Services */

import { SwitchAccountService } from '@app/core';
import { UserPanelService } from './header';

/**
 * Array of services/providers
 */
export const coreLayoutProviders: any[] = [
  SwitchAccountService,
  UserPanelService
];
