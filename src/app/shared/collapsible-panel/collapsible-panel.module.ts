import { NgModule } from '@angular/core';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { CollapsiblePanelComponent } from './collapsible-panel.component';

@NgModule({
  declarations: [
    CollapsiblePanelComponent
  ],
  imports: [
    CheckboxModule
  ],
  exports: [
    CheckboxModule,
    CollapsiblePanelComponent
  ]
})

export class CollapsiblePanelModule { }
