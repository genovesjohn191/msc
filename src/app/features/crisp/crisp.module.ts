import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FeaturesSharedModule } from '@app/features-shared';
import { SharedModule } from '@app/shared';
import { LaunchPadGuard } from '../launch-pad/launch-pad.guard';

import { crispRoutes } from './crisp.constants';
import { CrispOrdersComponent } from './orders/crisp-orders.component';

@NgModule({
  declarations: [
    CrispOrdersComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(crispRoutes)
  ],
  providers: [
    LaunchPadGuard
  ]
})

export class CrispModule { }
