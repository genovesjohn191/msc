import { NgModule } from '@angular/core';
/** Modules */
import { SharedModule } from '../../shared';
/** Components */
import { ToolsComponent } from './tools.component';
/** Providers List */
import { toolsProviders } from './tools.constants';

@NgModule({
  declarations: [
    ToolsComponent,
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...toolsProviders
  ]
})

export class ToolsModule { }
