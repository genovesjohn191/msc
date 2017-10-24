/** Services */
import { CoreLayoutService } from './core-layout.services';
import { BreadcrumbsService } from './breadcrumbs/breadcrumbs.service';
import { SwitchAccountService } from './shared';

/**
 * Array of services/providers
 */
export const coreLayoutProviders: any[] = [
  CoreLayoutService,
  BreadcrumbsService,
  SwitchAccountService
];
