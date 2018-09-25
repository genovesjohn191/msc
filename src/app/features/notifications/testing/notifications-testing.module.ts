import { NgModule } from '@angular/core';
/** Modules */
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';

@NgModule({
  imports: [
    CoreTestingModule,
    ServicesTestingModule
  ]
})

export class NotificationsTestingModule { }
