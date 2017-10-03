import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Modules */
import { SharedModule } from '../../shared';
/** Components */
import { ConsolePageComponent } from './console-page.component';
import { ConsolePageService } from './console-page.service';
/** Constants */
import { consolePageRoutes } from './console-page.constants';

@NgModule({
  declarations: [
    ConsolePageComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(consolePageRoutes)
  ],
  providers: [
    ConsolePageService
  ]
})

export class ConsolePageModule { }
