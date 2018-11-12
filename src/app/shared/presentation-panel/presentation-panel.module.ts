import { NgModule } from '@angular/core';
import { PresentationPanelComponent } from './presentation-panel.component';

@NgModule({
  declarations: [
    PresentationPanelComponent
  ],
  exports: [
    PresentationPanelComponent
  ]
})
export class PresentationPanelModule { }
