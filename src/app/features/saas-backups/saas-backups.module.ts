import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

/** SaaS Backup */
import { SaasBackupsComponent } from './saas-backups.component';
import { saasBackupsRoutes } from './saas-backups.constants';

@NgModule({
  declarations: [
    SaasBackupsComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(saasBackupsRoutes)
  ],
  providers: [
  ]
})

export class SaasBackupsModule { }