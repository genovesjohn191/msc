import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

/** Azure Reservations */
import { azureReservationsRoute } from './azure-reservations.constants';
import { AzureReservationsComponent } from './azure-reservations.component';

@NgModule({
  declarations: [
    AzureReservationsComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(azureReservationsRoute)
  ],
  providers: []
})

export class AzureReservationsModule { }
