import { NgModule } from '@angular/core';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { coreLayoutProviders } from '../core-layout.constants';

@NgModule({
  imports: [
    CoreTestingModule,
    ServicesTestingModule
  ],
  providers: [
    ...coreLayoutProviders
  ],
})

export class CoreLayoutTestingModule { }
