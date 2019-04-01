import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { ConsolePageComponent } from './console-page.component';

@NgModule({
  declarations: [
    ConsolePageComponent
  ],
  imports: [
    SharedModule
  ]
})

export class ConsolePageModule { }
