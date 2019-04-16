/** Services */
import { BreadcrumbsService } from './breadcrumbs/breadcrumbs.service';
import { SwitchAccountService } from './shared';
import { UserPanelService } from './header';

/**
 * Array of services/providers
 */
export const coreLayoutProviders: any[] = [
  BreadcrumbsService,
  SwitchAccountService,
  UserPanelService
];
