import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import {
  SaasBackupComponent,
  SaasBackupManagementComponent,
  SaasBackupOverviewComponent,
  SaasBackupResolver,
  SaasBackupService
} from './saas-backup';
import { SaasBackupsComponent } from './saas-backups.component';

/**
 * List of services for the main module
 */
export const saasBackupsProviders: any[] = [
  SaasBackupResolver,
  SaasBackupService
];

/**
 * List of routes for the main module
 */
export const saasBackupsRoutes: Routes = [
  {
    path: '',
    component: SaasBackupsComponent
  },
  {
    path: ':id',
    component: SaasBackupComponent,
    data: { routeId: RouteKey.SaasBackupDetails },
    resolve: {
      saasBackup: SaasBackupResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.SaasBackupDetailsOverview }
      },
      {
        path: 'overview',
        component: SaasBackupOverviewComponent,
        data: { routeId: RouteKey.SaasBackupDetailsOverview }
      },
      {
        path: 'management',
        component: SaasBackupManagementComponent,
        data: { routeId: RouteKey.SaasBackupDetailsManagement }
      }
    ]
  }
];
