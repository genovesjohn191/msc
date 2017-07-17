import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Modules */
import { SharedModule } from '../../shared';
/** Components */
import { ConsolePageComponent } from './console-page.component';
/** Services */
import { ConsoleService } from './console-page.service';
/** Routes */
import { routes } from './console-page.routes';

@NgModule({
  declarations: [
    ConsolePageComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ConsoleService
  ]
})

export class ConsolePageModule { }
