import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { ConsolePageComponent } from './console-page.component';

@NgModule({
  entryComponents: [
    ConsolePageComponent
  ],
  declarations: [
    ConsolePageComponent
  ],
  imports: [
    SharedModule
  ]
})

export class ConsolePageModule { }
