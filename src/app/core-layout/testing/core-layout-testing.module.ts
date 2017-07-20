import { NgModule } from '@angular/core';
/** Modules */
import { CoreTestingModule } from '../../core/testing';
/** Services */
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
