import { NgModule } from '@angular/core';
/** Providers */
import { constantsProviders } from '../console-page.constants';
/** Modules */
import { CoreTestingModule } from '../../../core/testing';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    ...constantsProviders
  ],
})

export class ConsolePageTestingModule { }
