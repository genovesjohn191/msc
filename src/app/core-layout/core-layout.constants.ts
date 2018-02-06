/** Services */
import { CoreLayoutService } from './core-layout.services';
import { BreadcrumbsService } from './breadcrumbs/breadcrumbs.service';
import {
  SwitchAccountService,
  SwitchAccountRepository
} from './shared';

/**
 * Array of services/providers
 */
export const coreLayoutProviders: any[] = [
  CoreLayoutService,
  BreadcrumbsService,
  SwitchAccountService,
  SwitchAccountRepository
];
