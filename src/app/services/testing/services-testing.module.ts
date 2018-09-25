import { NgModule } from '@angular/core';
import { CoreTestingModule } from '@app/core/testing';
import { servicesProviders } from '../services.contants';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: servicesProviders
})

export class ServicesTestingModule { }
