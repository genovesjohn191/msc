import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';

/** Application Recovery Services */
import { ApplicationRecoveryComponent } from './application-recovery.component';
import { applicationRecoveryRoute } from './application-recovery.constants';

@NgModule({
  declarations: [
    ApplicationRecoveryComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(applicationRecoveryRoute)
  ],
  providers: [
  ]
})

export class ApplicationRecoveryModule { }
