import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { ToolsComponent } from './tools.component';
/** Providers List */
import { toolsRoutesComponents } from './tools.constants';

@NgModule({
  entryComponents: [
    ...toolsRoutesComponents
  ],
  declarations: [
    ToolsComponent,
  ],
  imports: [
    SharedModule
  ]
})

export class ToolsModule { }
