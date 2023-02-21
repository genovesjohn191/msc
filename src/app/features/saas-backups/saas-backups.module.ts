import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

/** SaaS Backup */
import { SaasBackupsComponent } from './saas-backups.component';
import {
  saasBackupsProviders,
  saasBackupsRoutes
} from './saas-backups.constants';
import {
  SaasBackupComponent,
  SaasBackupManagementComponent,
  SaasBackupOverviewComponent
} from './saas-backup';

@NgModule({
  declarations: [
    SaasBackupsComponent,
    SaasBackupComponent,
    SaasBackupOverviewComponent,
    SaasBackupManagementComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(saasBackupsRoutes)
  ],
  providers: [
    ...saasBackupsProviders
  ]
})

export class SaasBackupsModule { }