import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
/** Components */
import { ConsolePageComponent } from './console-page.component';
import { constantsProviders } from './console-page.constants';

@NgModule({
  entryComponents: [
    ConsolePageComponent
  ],
  declarations: [
    ConsolePageComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...constantsProviders
  ]
})

export class ConsolePageModule { }
