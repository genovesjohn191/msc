import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Components */
import { ConsolePageComponent } from './console-page.component';
/** Routes */
import { routes } from './console-page.routes';

@NgModule({
  declarations: [
    ConsolePageComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
  ]
})

export class ConsolePageModule { }
