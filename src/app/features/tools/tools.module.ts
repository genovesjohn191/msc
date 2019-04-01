import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { ToolsComponent } from './tools.component';

@NgModule({
  declarations: [
    ToolsComponent,
  ],
  imports: [
    SharedModule
  ]
})

export class ToolsModule { }
