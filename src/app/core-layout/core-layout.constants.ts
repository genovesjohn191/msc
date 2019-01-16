/** Services */
import { BreadcrumbsService } from './breadcrumbs/breadcrumbs.service';
import { SwitchAccountService } from './shared';

/**
 * Array of services/providers
 */
export const coreLayoutProviders: any[] = [
  BreadcrumbsService,
  SwitchAccountService
];
