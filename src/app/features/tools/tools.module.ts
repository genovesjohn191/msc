import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import { toolsRoutes } from './tools.constants';
import { ToolsComponent } from './tools.component';

@NgModule({
  declarations: [
    ToolsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(toolsRoutes)
  ]
})

export class ToolsModule { }
