import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { InternetComponent } from './internet.component';
import {
  InternetPortComponent,
  InternetPortManagementComponent
} from './internet-port';
import {
  internetProviders,
  internetRoutes
} from './internet.constants';

@NgModule({
  declarations: [
    InternetComponent,
    InternetPortComponent,
    InternetPortManagementComponent
  ],
  imports: [
    RouterModule.forChild(internetRoutes),
    SharedModule
  ],
  providers: [...internetProviders]
})

export class InternetModule { }
