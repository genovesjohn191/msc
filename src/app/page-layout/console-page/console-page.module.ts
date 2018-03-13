import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Modules */
import { SharedModule } from '../../shared';
/** Components */
import { ConsolePageComponent } from './console-page.component';
/** Constants */
import {
  consolePageRoutes,
  constantsProviders
} from './console-page.constants';

@NgModule({
  declarations: [
    ConsolePageComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(consolePageRoutes)
  ],
  providers: [
    ...constantsProviders
  ]
})

export class ConsolePageModule { }
