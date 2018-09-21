import { NgModule } from '@angular/core';
import { CoreTestingModule } from '@app/core/testing';
import { coreLayoutProviders } from '../core-layout.constants';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    ...coreLayoutProviders
  ],
})

export class CoreLayoutTestingModule { }
