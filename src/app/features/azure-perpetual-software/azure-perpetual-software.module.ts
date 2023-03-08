import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

/** Azure Perpetual Software */
import { azurePerpetualSoftwareRoute } from './azure-perpetual-software.constants';
import { AzurePerpetualSoftwareComponent } from './azure-perpetual-software.component';

@NgModule({
  declarations: [
    AzurePerpetualSoftwareComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(azurePerpetualSoftwareRoute)
  ],
  providers: []
})

export class AzurePerpetualSoftwareModule { }
