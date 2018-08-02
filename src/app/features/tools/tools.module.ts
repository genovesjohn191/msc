import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
/** Components */
import { ToolsComponent } from './tools.component';
/** Providers List */
import {
  toolsProviders,
  toolsRoutesComponents
} from './tools.constants';

@NgModule({
  entryComponents: [
    ...toolsRoutesComponents
  ],
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
